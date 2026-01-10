
import { Review, User, Comment, ApiService } from '../types';
import { auth, db, functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider
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
    onSnapshot,
    Timestamp 
} from 'firebase/firestore';
import { REVIEW_CONFIG as DEFAULT_CONFIG } from './reviewConfig';

const createKeywords = (str: string): string[] => {
    if (!str) return [];
    const arr = [];
    let cur = '';
    const s = str.toLowerCase();
    for (let i = 0; i < s.length; i++) {
        cur += s[i];
        if (cur.length >= 2) arr.push(cur);
    }
    s.split(' ').forEach(word => {
        if(word.length > 2) arr.push(word);
    });
    return [...new Set(arr)];
};

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
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    const newUser = await createUserWithEmailAndPassword(auth, email, pass);
                    await updateProfile(newUser.user, { displayName: email.split('@')[0] });
                    await setDoc(doc(db, "users", newUser.user.uid), {
                        name: email.split('@')[0],
                        email: email,
                        verified: false,
                        createdAt: serverTimestamp()
                    });
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
        loginWithGoogle: async (): Promise<User> => {
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                const u = result.user;
                const userRef = doc(db, "users", u.uid);
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    await setDoc(userRef, {
                        name: u.displayName,
                        email: u.email,
                        verified: false,
                        createdAt: serverTimestamp()
                    });
                }
                return {
                    id: u.uid,
                    name: u.displayName || 'User',
                    handle: u.email || '',
                    email: u.email || '',
                    avatar: u.photoURL || `https://ui-avatars.com/api/?name=${u.email}`,
                    verified: snap.exists() ? snap.data().verified : false
                };
            } catch (error: any) {
                if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
                     throw new Error("Popup blocked or closed. Please allow popups for this site.");
                }
                throw error;
            }
        },
        logout: async () => { await signOut(auth); },
        onStateChange: (callback: (user: User | null) => void) => {
            return onAuthStateChanged(auth, (u) => {
                if (u) {
                    const unsubProfile = onSnapshot(doc(db, "users", u.uid), (docSnap) => {
                        const data = docSnap.data();
                        callback({
                            id: u.uid,
                            name: data?.name || u.displayName || 'User',
                            handle: data?.email || u.email || '',
                            email: u.email || '',
                            avatar: u.photoURL || `https://ui-avatars.com/api/?name=${u.email}`,
                            verified: data?.verified || false,
                            stats: data?.stats
                        });
                    });
                } else {
                    callback(null);
                }
            });
        },
        sendOtp: async (phone: string): Promise<boolean> => {
            try {
                let formattedPhone = phone.replace(/\D/g, ''); 
                if (formattedPhone.startsWith('0')) formattedPhone = '94' + formattedPhone.substring(1);
                const requestOtp = httpsCallable(functions, 'requestOtp');
                const response: any = await requestOtp({ phone: formattedPhone });
                return response.data?.success || false;
            } catch (e: any) {
                if (e.message && (e.message.includes("limit") || e.message.includes("wait") || e.message.includes("format"))) {
                     alert(e.message); 
                } else {
                     alert("Failed to send SMS. Please try again later.");
                }
                return false;
            }
        },
        verifyOtp: async (phone: string, code: string): Promise<boolean> => {
             let formattedPhone = phone.replace(/\D/g, ''); 
             if (formattedPhone.startsWith('0')) formattedPhone = '94' + formattedPhone.substring(1);
             try {
                 const verifyOtp = httpsCallable(functions, 'verifyOtp');
                 const response: any = await verifyOtp({ phone: formattedPhone, code });
                 return response.data?.success || false;
             } catch (e: any) {
                 if (e.message) alert(e.message);
                 throw new Error(e.message || "Invalid Code");
             }
        }
    },
    config: {
        get: async (): Promise<any[]> => {
            const CONFIG_CACHE_KEY = 'reviewhub_config_cache';
            const cache = localStorage.getItem(CONFIG_CACHE_KEY);
            if (cache) {
                const { data, timestamp } = JSON.parse(cache);
                if (Date.now() - timestamp < 3600000) return data;
            }
            try {
                const docRef = doc(db, "reviewhub_config", "app_settings");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data().categories;
                    localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
                    return data;
                } else {
                    await setDoc(docRef, { categories: DEFAULT_CONFIG, version: "1.0", updatedAt: serverTimestamp() });
                    return DEFAULT_CONFIG;
                }
            } catch (e) {
                return DEFAULT_CONFIG;
            }
        }
    },
    reviews: {
        getAll: async (filter: string = 'All'): Promise<Review[]> => {
            try {
                const reviewsRef = collection(db, "reviewhub");
                const q = query(reviewsRef, orderBy("timestamp", "desc"), limit(50));
                const querySnapshot = await getDocs(q);
                const allReviews = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return { ...data, id: doc.id, date: timeAgo(data.timestamp) } as Review;
                }).filter(r => r.status !== 'hidden');
                if (filter === 'All') return allReviews;
                if (filter === 'High Risk') return allReviews.filter(r => r.isScam === true);
                return allReviews.filter(r => r.entityType === filter);
            } catch (e) { return []; }
        },
        getUserReviews: async (userId: string): Promise<Review[]> => {
            try {
                const reviewsRef = collection(db, "reviewhub");
                const q = query(reviewsRef, where("user.id", "==", userId));
                const querySnapshot = await getDocs(q);
                return querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return { ...data, id: doc.id, date: timeAgo(data.timestamp) } as Review;
                }).sort((a, b) => b.timestamp - a.timestamp);
            } catch (e) { return []; }
        },
        create: async (data: Partial<Review>): Promise<Review> => {
            let toxicity = 0;
            if (data.text && data.text.length > 5) {
                try {
                     const checkToxicity = httpsCallable(functions, 'checkToxicity');
                     const result: any = await checkToxicity({ text: data.text });
                     toxicity = result.data?.score || 0;
                     if (toxicity > 0.7) throw new Error("Review rejected: Content flagged as toxic/harmful.");
                } catch (e: any) {
                    if (e.message.includes("Review rejected")) throw e;
                }
            }
            const newReview = {
                entityName: data.entityName || 'Unknown',
                entityType: data.entityType || 'General',
                rating: data.rating || 0,
                timestamp: serverTimestamp(),
                text: data.text || '',
                likes: 0,
                comments: 0,
                user: data.user!,
                images: data.images || [],
                tags: data.tags || [],
                meta: data.meta || {}, 
                isScam: data.isScam || false,
                keywords: createKeywords(data.entityName || ''),
                status: 'active',
                toxicityScore: toxicity,
                verifiedBadge: data.user?.verified || false
            };
            const docRef = await addDoc(collection(db, "reviewhub"), newReview);
            return { ...newReview, id: docRef.id, date: 'Just now', timestamp: Date.now() } as Review;
        },
        vote: async (reviewId: string, type: 'up' | 'down'): Promise<number> => {
            const reviewRef = doc(db, "reviewhub", reviewId);
            await updateDoc(reviewRef, { likes: increment(type === 'up' ? 1 : -1) });
            return 0;
        },
        addComment: async (reviewId: string, text: string, user: User): Promise<Comment> => {
            const commentData = { user, text, likes: 0, timestamp: serverTimestamp() };
            const commentRef = await addDoc(collection(db, "reviewhub", reviewId, "comments"), commentData);
            await updateDoc(doc(db, "reviewhub", reviewId), { comments: increment(1) });
            return { ...commentData, id: commentRef.id, timeAgo: 'Just now' } as Comment;
        },
        getComments: async (reviewId: string): Promise<Comment[]> => {
             const q = query(collection(db, "reviewhub", reviewId, "comments"), orderBy("timestamp", "desc"));
             const snap = await getDocs(q);
             return snap.docs.map(d => ({ ...d.data(), id: d.id, timeAgo: timeAgo(d.data().timestamp) })) as Comment[];
        },
        report: async (reviewId: string, reason: string): Promise<void> => {
             await addDoc(collection(db, "reviewhub_flags"), { reviewId, reason, timestamp: serverTimestamp(), status: 'pending' });
        }
    },
    search: {
        query: async (term: string): Promise<Review[]> => {
            if (!term || term.length < 2) return [];
            const searchTerm = term.toLowerCase();
            try {
                const q = query(collection(db, "reviewhub"), where("keywords", "array-contains", searchTerm), limit(20));
                const snap = await getDocs(q);
                return snap.docs.map(doc => {
                    const data = doc.data();
                    return { ...data, id: doc.id, date: timeAgo(data.timestamp) } as Review;
                }).filter(r => r.status !== 'hidden');
            } catch (e) { return []; }
        }
    },
    ai: {
        analyzeReview: async (text: string, entity: string): Promise<string> => {
            try {
                const analyzeReview = httpsCallable(functions, 'analyzeReview');
                const result: any = await analyzeReview({ text, entity });
                return result.data?.text || "Analysis unavailable.";
            } catch (error) { return "AI Analysis failed temporarily."; }
        },
        checkToxicity: async (text: string): Promise<number> => {
            try {
                 const checkToxicity = httpsCallable(functions, 'checkToxicity');
                 const result: any = await checkToxicity({ text });
                 return result.data?.score || 0;
            } catch (e) { return 0; }
        },
        globalSearch: async (query: string): Promise<{ text: string, sources: any[] }> => {
            try {
                const globalSearch = httpsCallable(functions, 'globalSearch');
                const result: any = await globalSearch({ query });
                return result.data || { text: "No global info found.", sources: [] };
            } catch (e) {
                console.error("AI global search error", e);
                return { text: "Investigative search failed.", sources: [] };
            }
        }
    }
};
