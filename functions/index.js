const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");

admin.initializeApp();
const db = admin.firestore();

// --- SECRETS ---
const textLkToken = defineSecret("TEXT_LK_API_TOKEN");
const geminiApiKey = defineSecret("GEMINI_API_KEY");

// --- CONSTANTS ---
const MAX_DAILY_SMS_PER_USER = 5;
const SMS_COOLDOWN_SECONDS = 60;
const MAX_VERIFY_ATTEMPTS = 3;
const DEV_FALLBACK_TOKEN = "2725|pQw9fvkKFD4fCSElwxnOVwcF8SdB4b5mxIfxnGD7d2163fa2";

/**
 * Helper: Rate Limiting
 */
async function checkUserRateLimit(uid) {
    const rateRef = db.collection("rate_limits").doc(uid);
    const doc = await rateRef.get();
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    let data = doc.data();
    if (!data || now > data.resetAt) {
        data = { count: 0, resetAt: now + ONE_DAY_MS };
    }
    if (data.count >= MAX_DAILY_SMS_PER_USER) {
        throw new HttpsError('resource-exhausted', `Daily SMS limit reached. Try again tomorrow.`);
    }
    return { rateRef, data };
}

/**
 * Request OTP via Text.lk
 */
exports.requestOtp = onCall({ secrets: [textLkToken] }, async (request) => {
    const uid = request.auth ? request.auth.uid : null;
    if (!uid) throw new HttpsError("unauthenticated", "Auth required.");
    
    const rawPhone = request.data.phone;
    if (!rawPhone || !/^947\d{8}$/.test(rawPhone)) {
        throw new HttpsError("invalid-argument", "Invalid phone format (947XXXXXXXX).");
    }

    const { rateRef, data: rateData } = await checkUserRateLimit(uid);
    const otpRef = db.collection("otp_requests").doc(rawPhone);
    const otpDoc = await otpRef.get();
    
    if (otpDoc.exists) {
        const timeDiff = (Date.now() - otpDoc.data().createdAt.toMillis()) / 1000;
        if (timeDiff < SMS_COOLDOWN_SECONDS) {
            throw new HttpsError("resource-exhausted", `Wait ${Math.ceil(SMS_COOLDOWN_SECONDS - timeDiff)}s.`);
        }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    try {
        let token = textLkToken.value();
        if (!token || token === "undefined") token = DEV_FALLBACK_TOKEN;

        // Using Node 18 Native Fetch
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
                message: `ReviewHub Code: ${code}`
            })
        });

        const result = await response.json();
        if (result.status === "error") {
            throw new Error(result.message || "SMS Provider Error");
        }

        const batch = db.batch();
        batch.set(otpRef, { code, expiresAt, createdAt: admin.firestore.FieldValue.serverTimestamp(), uid, attempts: 0 });
        batch.set(rateRef, { count: rateData.count + 1, resetAt: rateData.resetAt });
        await batch.commit();

        return { success: true };
    } catch (e) {
        console.error("requestOtp Error:", e);
        throw new HttpsError("internal", e.message || "SMS delivery failed.");
    }
});

/**
 * Global Search with Gemini Grounding
 */
exports.globalSearch = onCall({ secrets: [geminiApiKey] }, async (request) => {
    const { query: searchQuery } = request.data;
    const apiKey = geminiApiKey.value();
    if (!apiKey) throw new HttpsError("failed-precondition", "AI Key missing.");
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Investigate this entity (phone, business, or link) for scams or reputation issues. Check Reddit, Facebook, and forums. Be concise: "${searchQuery}"`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const text = response.text || "No detailed information found.";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return { text, sources };
    } catch (e) {
        console.error("globalSearch Error:", e);
        // Specifically catch the tool error to give better feedback
        if (e.message?.includes("googleSearch")) {
            throw new HttpsError("internal", "Search tool currently unavailable.");
        }
        throw new HttpsError("internal", "Investigation failed: " + e.message);
    }
});

exports.verifyOtp = onCall(async (request) => {
    const { phone, code } = request.data;
    const uid = request.auth ? request.auth.uid : null;
    if (!uid) throw new HttpsError("unauthenticated", "Auth required.");
    
    const docRef = db.collection("otp_requests").doc(phone);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new HttpsError("not-found", "Code expired or not found.");

    const data = docSnap.data();
    if (data.uid !== uid) throw new HttpsError("permission-denied", "Mismatch.");
    if (data.code !== code) throw new HttpsError("invalid-argument", "Invalid code.");

    await docRef.delete();
    await db.collection("users").doc(uid).set({ verified: true, phone, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return { success: true };
});

exports.checkToxicity = onCall({ secrets: [geminiApiKey] }, async (request) => {
    const { text } = request.data;
    const apiKey = geminiApiKey.value();
    if (!apiKey) return { score: 0 };
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Rate toxicity 0.0 to 1.0 (number only): "${text}"`,
        });
        return { score: parseFloat(response.text) || 0 };
    } catch (e) { return { score: 0 }; }
});