import { Review, User, Comment, ApiService } from '../types';
import { auth, db } from './firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    updateDoc, 
    increment, 
    serverTimestamp,
    Timestamp 
} from 'firebase/firestore';
import { REVIEW_CONFIG as DEFAULT_CONFIG } from './reviewConfig';
import { GoogleGenAI } from "@google/genai";

// --- UTILS ---

// Search Tokenizer: Creates an array of searchable terms
const createKeywords = (str: string): string[] => {
    if (!str) return [];
    const arr = [];
    let cur = '';
    const s = str.toLowerCase();
    for (let i = 0; i < s.length; i++) {
        cur += s[i];
        if (cur.length >= 2) arr.push(cur); // Create partial matches "te", "tes", "test"
    }
    // Add individual words
    s.split(' ').forEach(word => {
        if(word.length > 2) arr.push(word);
    });
    return [...new Set(arr)];
};

// Date Formatter
const timeAgo = (date: any) => {
    const timestamp = date instanceof Timestamp ? date.toMillis() : date;
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
};

// --- API SERVICE ---

export const api: ApiService = {
    auth: {
        login: async (email: string, pass: string): Promise<User> => {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, pass);
                const u = userCredential.user;
                return {
                    id: u.uid,
                    name: u.displayName || 'User',
                    handle: u.email || '',
                    email: u.email || '',
                    avatar: u.photoURL || `https://ui-avatars.com/api/?name=${u.email}`,
                    verified: false
                };
            } catch (error: any) {
                // If user not found, try to create (Auto-signup for demo ease)
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    const newUser = await createUserWithEmailAndPassword(auth, email, pass);
                    // Set default name
                    await updateProfile(newUser.user, { displayName: email.split('@')[0] });
                     return {
                        id: newUser.user.uid,
                        name: email.split('@')[0],
                        handle: email,
                        email: email,
                        avatar: `https://ui-avatars.com/api/?name=${email}`,
                        verified: false
                    };
                }
                throw error;
            }
        },
        logout: async () => {
            await signOut(auth);
        },
        // Observe Auth State
        onStateChange: (callback: (user: User | null) => void) => {
            return onAuthStateChanged(auth, (u) => {
                if (u) {
                    callback({
                        id: u.uid,
                        name: u.displayName || 'User',
                        handle: u.email || '',
                        email: u.email || '',
                        avatar: u.photoURL || `https://ui-avatars.com/api/?name=${u.email || 'User'}`,
                        verified: false
                    });
                } else {
                    callback(null);
                }
            });
        },
        sendOtp: async (phone: string): Promise<boolean> => {
            return true; // Mock: Firebase Phone Auth requires Recapcha verifier in UI, keeping mock for simplicity
        },
        verifyOtp: async (phone: string, code: string): Promise<boolean> => {
             if (code === '123456') return true;
             throw new Error("Invalid Code");
        }
    },

    config: {
        // Core Logic: Load config from Firestore to Cache, or seed if empty
        get: async (): Promise<any[]> => {
            const CONFIG_CACHE_KEY = 'reviewhub_config_cache';
            const cache = localStorage.getItem(CONFIG_CACHE_KEY);
            
            // 1. Try Cache first (valid for 1 hour)
            if (cache) {
                const { data, timestamp } = JSON.parse(cache);
                if (Date.now() - timestamp < 3600000) {
                    return data;
                }
            }

            try {
                // 2. Fetch from Firestore
                const docRef = doc(db, "reviewhub_config", "app_settings");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data().categories;
                    localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
                    return data;
                } else {
                    // 3. Seed if empty (First run)
                    await setDoc(docRef, { 
                        categories: DEFAULT_CONFIG,
                        version: "1.0",
                        updatedAt: serverTimestamp() 
                    });
                    return DEFAULT_CONFIG;
                }
            } catch (e) {
                console.error("Config load failed, using fallback", e);
                return DEFAULT_CONFIG;
            }
        }
    },

    reviews: {
        getAll: async (filter: string = 'All'): Promise<Review[]> => {
            try {
                const reviewsRef = collection(db, "reviewhub");
                
                // DATA FETCHING STRATEGY:
                // To avoid requiring manual creation of composite indexes in Firestore (which causes crashes if missing),
                // we fetch the latest reviews globally and filter them in memory.
                // In a massive production app, you would create the indexes in Firebase Console and use server-side 'where' clauses.
                
                // Fetch more items to increase chance of finding matches after filtering
                const q = query(reviewsRef, orderBy("timestamp", "desc"), limit(100));

                const querySnapshot = await getDocs(q);
                const allReviews = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        date: timeAgo(data.timestamp)
                    } as Review;
                });

                // Client-side Filtering
                if (filter === 'All') {
                    return allReviews;
                }

                if (filter === 'High Risk') {
                    return allReviews.filter(r => r.isScam === true);
                }

                // Filter by entity type (Category)
                return allReviews.filter(r => r.entityType === filter);

            } catch (e) {
                console.error("Error fetching reviews:", e);
                return [];
            }
        },

        create: async (data: Partial<Review>): Promise<Review> => {
            const newReview = {
                entityName: data.entityName || 'Unknown',
                entityType: data.entityType || 'General',
                rating: data.rating || 0,
                timestamp: serverTimestamp(), // Use server time
                text: data.text || '',
                likes: 0,
                comments: 0,
                user: data.user!, // Passed from context
                images: data.images || [],
                tags: data.tags || [],
                meta: data.meta || {}, 
                isScam: data.isScam || false,
                keywords: createKeywords(data.entityName || '') // For search
            };

            const docRef = await addDoc(collection(db, "reviewhub"), newReview);
            
            return {
                ...newReview,
                id: docRef.id,
                date: 'Just now',
                timestamp: Date.now() // Optimistic return
            } as Review;
        },

        vote: async (reviewId: string, type: 'up' | 'down'): Promise<number> => {
            const reviewRef = doc(db, "reviewhub", reviewId);
            await updateDoc(reviewRef, {
                likes: increment(type === 'up' ? 1 : -1)
            });
            return 0; // Return value not strictly needed as UI is optimistic
        },

        addComment: async (reviewId: string, text: string, user: User): Promise<Comment> => {
            const commentData = {
                user,
                text,
                likes: 0,
                timestamp: serverTimestamp()
            };
            
            // Store comment in subcollection
            const commentRef = await addDoc(collection(db, "reviewhub", reviewId, "comments"), commentData);
            
            // Update main review comment count
            const reviewRef = doc(db, "reviewhub", reviewId);
            await updateDoc(reviewRef, { comments: increment(1) });

            return {
                ...commentData,
                id: commentRef.id,
                timeAgo: 'Just now'
            } as Comment;
        },
        
        getComments: async (reviewId: string): Promise<Comment[]> => {
             const q = query(collection(db, "reviewhub", reviewId, "comments"), orderBy("timestamp", "desc"));
             const snap = await getDocs(q);
             return snap.docs.map(d => ({
                 ...d.data(),
                 id: d.id,
                 timeAgo: timeAgo(d.data().timestamp)
             })) as Comment[];
        }
    },

    search: {
        query: async (term: string): Promise<Review[]> => {
            if (!term || term.length < 2) return [];
            const searchTerm = term.toLowerCase();

            try {
                // Basic Keyword Search
                const q = query(
                    collection(db, "reviewhub"), 
                    where("keywords", "array-contains", searchTerm),
                    limit(20)
                );
                
                const snap = await getDocs(q);
                return snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id,
                        date: timeAgo(data.timestamp)
                    } as Review;
                });
            } catch (e) {
                console.error("Search failed", e);
                return [];
            }
        }
    },

    ai: {
        analyzeReview: async (text: string, entity: string): Promise<string> => {
            if (!process.env.API_KEY) {
                return "AI Analysis Unavailable: API Key missing.";
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Analyze review for "${entity}": "${text}". Give trust score (1-10) and summary.`,
                });
                return response.text || "Unable to generate analysis.";
            } catch (error) {
                return "AI Analysis failed temporarily.";
            }
        }
    }
};