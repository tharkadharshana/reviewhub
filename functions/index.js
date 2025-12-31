const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");

admin.initializeApp();
const db = admin.firestore();

// --- SECRETS CONFIGURATION ---
// Best Practice: Store keys in Google Cloud Secret Manager
// Run: firebase functions:secrets:set TEXT_LK_API_TOKEN
// Run: firebase functions:secrets:set GEMINI_API_KEY
const textLkToken = defineSecret("TEXT_LK_API_TOKEN");
const geminiApiKey = defineSecret("GEMINI_API_KEY");

// --- CONSTANTS ---
const MAX_DAILY_SMS_PER_USER = 5;
const SMS_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 3;

/**
 * Helper: Check Rate Limits
 * Enforces a daily limit per User ID to control costs.
 */
async function checkUserRateLimit(uid) {
    const rateRef = db.collection("rate_limits").doc(uid);
    const doc = await rateRef.get();
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    let data = doc.data();

    // If no record or 24 hours passed, reset
    if (!data || now > data.resetAt) {
        data = { count: 0, resetAt: now + ONE_DAY_MS };
    }

    if (data.count >= MAX_DAILY_SMS_PER_USER) {
        throw new HttpsError('resource-exhausted', `Daily SMS limit reached (${MAX_DAILY_SMS_PER_USER}). Try again in 24 hours.`);
    }

    // Return the ref and data to update later only if SMS succeeds
    return { rateRef, data };
}

/**
 * 1. Secure OTP Request
 * Generates code server-side, stores in DB, sends SMS.
 */
exports.requestOtp = onCall({ secrets: [textLkToken] }, async (request) => {
    // 1. Auth Check
    const uid = request.auth ? request.auth.uid : null;
    if (!uid) throw new HttpsError("unauthenticated", "You must be logged in.");

    // 2. Input Validation
    const rawPhone = request.data.phone;
    if (!rawPhone) throw new HttpsError("invalid-argument", "Phone number required");

    // sanitize: ensure it starts with 94 and has 9 digits after
    const phoneRegex = /^947\d{8}$/;
    if (!phoneRegex.test(rawPhone)) {
        throw new HttpsError("invalid-argument", "Invalid format. Use 947XXXXXXXX.");
    }

    // 3. Rate Limit Check (User Level)
    const { rateRef, data: rateData } = await checkUserRateLimit(uid);

    // 4. Cooldown Check (Phone Number Level)
    const otpRef = db.collection("otp_requests").doc(rawPhone);
    const otpDoc = await otpRef.get();
    
    if (otpDoc.exists) {
        const lastRequest = otpDoc.data().createdAt.toMillis();
        const timeDiff = (Date.now() - lastRequest) / 1000;
        if (timeDiff < SMS_COOLDOWN_SECONDS) {
            throw new HttpsError("resource-exhausted", `Please wait ${Math.ceil(SMS_COOLDOWN_SECONDS - timeDiff)}s before requesting again.`);
        }
    }

    // 5. Generate Logic
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins expiration

    try {
        // 6. External API Call
        const fetch = (await import("node-fetch")).default;
        const token = textLkToken.value(); // Access Secret
        
        console.log(`[SECURE] Sending OTP to ${rawPhone}`);

        const response = await fetch("https://app.text.lk/api/v3/sms/send", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                recipient: rawPhone,
                sender_id: "TextLKDemo", 
                type: "plain",
                message: `Your ReviewHub verification code is: ${code}`
            })
        });

        const result = await response.json();

        // 7. Store Request & Update Rate Limit
        const batch = db.batch();

        batch.set(otpRef, {
            code,
            expiresAt,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            uid: uid, 
            attempts: 0
        });

        batch.set(rateRef, {
            count: rateData.count + 1,
            resetAt: rateData.resetAt
        });

        await batch.commit();
        
        if (result.status === "error" || (result.data && result.data.status === "fail")) {
            console.error("Text.lk Provider Error:", result);
            // In dev, you might choose to return the code, but in prod, keep it secure.
            // For now, we return specific error info.
            return { success: false, message: "SMS Provider Error. Please try again later." };
        }

        return { success: true };

    } catch (e) {
        console.error("SMS Logic Error", e);
        if (e instanceof HttpsError) throw e;
        throw new HttpsError("internal", "Failed to send SMS due to network error.");
    }
});

/**
 * 2. Secure OTP Verification
 */
exports.verifyOtp = onCall(async (request) => {
    const { phone, code } = request.data;
    const uid = request.auth ? request.auth.uid : null;

    if (!uid) throw new HttpsError("unauthenticated", "User must be logged in.");
    if (!phone || !code) throw new HttpsError("invalid-argument", "Missing phone or code.");

    const docRef = db.collection("otp_requests").doc(phone);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        throw new HttpsError("not-found", "OTP request not found or expired.");
    }

    const data = docSnap.data();

    if (data.uid && data.uid !== uid) {
         throw new HttpsError("permission-denied", "This OTP was requested by a different account.");
    }

    if (data.expiresAt < Date.now()) {
        await docRef.delete();
        throw new HttpsError("failed-precondition", "OTP expired. Request a new one.");
    }

    if (data.code !== code) {
        const newAttempts = (data.attempts || 0) + 1;
        
        if (newAttempts >= MAX_VERIFY_ATTEMPTS) {
            await docRef.delete();
            throw new HttpsError("resource-exhausted", "Too many failed attempts. Request a new OTP.");
        }

        await docRef.update({ attempts: newAttempts });
        throw new HttpsError("invalid-argument", `Invalid code. ${MAX_VERIFY_ATTEMPTS - newAttempts} attempts remaining.`);
    }

    await docRef.delete();

    await db.collection("users").doc(uid).set({
        verified: true,
        phone: phone, 
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true };
});

/**
 * 3. AI Analysis
 */
exports.analyzeReview = onCall({ secrets: [geminiApiKey] }, async (request) => {
    const { text, entity } = request.data;
    const apiKey = geminiApiKey.value();
    
    if (!apiKey) return { text: "AI Analysis unavailable (Missing Key)." };

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this review for ${entity}. Provide a trust score (1-10) and a brief summary. Text: "${text}"`,
        });
        return { text: response.text };
    } catch (e) {
        console.error("AI Error", e);
        return { text: "Unable to analyze at this time." };
    }
});

exports.checkToxicity = onCall({ secrets: [geminiApiKey] }, async (request) => {
    const { text } = request.data;
    const apiKey = geminiApiKey.value();
    
    if (!apiKey) return { score: 0 };

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Rate the toxicity of this text from 0.0 to 1.0 (1.0 = hate speech/spam). Return only number. Text: "${text}"`,
        });
        const score = parseFloat(response.text);
        return { score: isNaN(score) ? 0 : score };
    } catch (e) {
        return { score: 0 };
    }
});