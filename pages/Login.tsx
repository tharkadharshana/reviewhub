import React, { useState } from 'react';
import { useApp } from '../context/Store';
import { Icon, Button, Header } from '../components/Shared';
import { LegalDocs } from './LegalDocs';

export const Login = () => {
    const { login, loginWithGoogle, navigate, showToast } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    // Local state for overlaying legal docs to preserve form state
    const [viewingDoc, setViewingDoc] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!agreed) {
            showToast("You must agree to the Terms & Policy", "error");
            return;
        }

        if (!email || !password) {
            showToast("Please enter email and password", "error");
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password); 
            navigate('PROFILE'); // Navigate on success
        } catch (e) {
            // Toast handled in store
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!agreed) {
            showToast("You must agree to the Terms & Policy", "error");
            return;
        }
        setIsLoading(true);
        try {
            await loginWithGoogle();
            navigate('PROFILE');
        } catch (e) {
            // handled in store
        } finally {
            setIsLoading(false);
        }
    };

    const openDoc = (docId: string) => {
        setViewingDoc(docId);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden relative">
            {/* Overlay Legal Docs if Active */}
            {viewingDoc && (
                <LegalDocs docId={viewingDoc} onBack={() => setViewingDoc(null)} />
            )}

            <Header showBack onBack={() => navigate('HOME')} transparent />

            <div className="flex-1 flex flex-col justify-center px-6 -mt-10 overflow-y-auto no-scrollbar">
                <div className="flex flex-col items-center mb-8 animate-fade-in shrink-0">
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-4 text-primary">
                        <Icon name="hub" size={48} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-gray-500 text-center max-w-xs">
                        {isSignUp 
                            ? "Join the community to report scams and review services." 
                            : "Sign in to manage your reviews and reputation."}
                    </p>
                </div>

                <div className="space-y-4 animate-slide-up w-full">
                    <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        className={`w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-slate-900 dark:text-white font-bold h-14 rounded-xl flex items-center justify-center gap-3 transition-all ${!agreed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                        Continue with Google
                    </button>
                    
                    <div className="flex items-center gap-4 py-1">
                        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                        <span className="text-gray-400 text-xs font-bold uppercase">Or continue with email</span>
                        <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                    </div>

                    <form onSubmit={handleAuth} className="w-full space-y-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Icon name="mail" size={20} />
                                </div>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="username"
                                    className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl h-14 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 transition-all outline-none" 
                                    placeholder="Email Address"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Icon name="lock" size={20} />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl h-14 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 transition-all outline-none" 
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        {/* Legal Consent Checkbox */}
                        <div className="py-2">
                            <label className="flex items-start gap-3 cursor-pointer group select-none">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${agreed ? 'bg-primary border-primary' : 'border-gray-400 group-hover:border-primary'}`}>
                                    {agreed && <Icon name="check" size={16} className="text-white font-bold" />}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <div className="text-xs text-gray-500 leading-relaxed">
                                    I agree to the <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDoc('TERMS'); }} className="text-primary font-bold hover:underline cursor-pointer">Terms & Conditions</span>, <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDoc('PRIVACY'); }} className="text-primary font-bold hover:underline cursor-pointer">Privacy Policy</span>, and <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDoc('COMMUNITY'); }} className="text-primary font-bold hover:underline cursor-pointer">Community Guidelines</span>.
                                </div>
                            </label>
                        </div>

                        <Button 
                            type="submit" 
                            className={`w-full ${!agreed ? 'opacity-70 cursor-not-allowed' : ''}`} 
                            isLoading={isLoading}
                        >
                            {isSignUp ? "Sign Up" : "Log In"}
                        </Button>
                    </form>
                </div>

                <div className="mt-6 text-center shrink-0 pb-6">
                    <button 
                        onClick={() => { setIsSignUp(!isSignUp); setAgreed(false); }}
                        className="text-sm font-medium text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
            
            <div className="p-4 text-center text-[10px] text-gray-400 shrink-0">
                <p>Protected by reCAPTCHA and subject to the Google Privacy Policy and Terms of Service.</p>
            </div>
        </div>
    );
};