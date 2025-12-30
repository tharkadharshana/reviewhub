import React, { useState } from 'react';
import { useApp } from '../context/Store';
import { Icon, Button, Header } from '../components/Shared';

export const Login = () => {
    const { login, navigate, showToast } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

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
            await login(); // This uses the store's mock login which calls api.auth.login
            navigate('PROFILE'); // Navigate on success
        } catch (e) {
            // Toast handled in store
        } finally {
            setIsLoading(false);
        }
    };

    const openDoc = (docId: string) => {
        navigate('LEGAL', docId);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden">
            <Header showBack onBack={() => navigate('HOME')} transparent />

            <div className="flex-1 flex flex-col justify-center px-6 -mt-10">
                <div className="flex flex-col items-center mb-8 animate-fade-in">
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

                <form onSubmit={handleAuth} className="w-full space-y-4 animate-slide-up">
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Icon name="mail" size={20} />
                            </div>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl h-14 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 transition-all outline-none" 
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {/* Legal Consent Checkbox */}
                    <div className="py-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
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
                                I agree to the <span onClick={(e) => { e.preventDefault(); openDoc('TERMS'); }} className="text-primary font-bold hover:underline">Terms & Conditions</span>, <span onClick={(e) => { e.preventDefault(); openDoc('PRIVACY'); }} className="text-primary font-bold hover:underline">Privacy Policy</span>, and <span onClick={(e) => { e.preventDefault(); openDoc('COMMUNITY'); }} className="text-primary font-bold hover:underline">Community Guidelines</span>.
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

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => { setIsSignUp(!isSignUp); setAgreed(false); }}
                        className="text-sm font-medium text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
            
            <div className="p-6 text-center text-[10px] text-gray-400">
                <p>Protected by reCAPTCHA and subject to the Google Privacy Policy and Terms of Service.</p>
            </div>
        </div>
    );
};