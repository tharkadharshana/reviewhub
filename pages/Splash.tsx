import React from 'react';
import { AppContextType } from '../types';

export const Splash = ({ navigate }: { navigate: AppContextType['navigate'] }) => {
    return (
        <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                 style={{
                     backgroundImage: 'radial-gradient(#007bff 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between px-6 py-8">
                <div className="flex-none h-10"></div>
                
                <div className="flex flex-col items-center justify-center flex-1 w-full animate-fade-in">
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full transform scale-150"></div>
                        <div className="relative w-28 h-28 bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-xl shadow-primary/10 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                            <span className="material-symbols-outlined text-[64px] text-primary">hub</span>
                        </div>
                    </div>
                    
                    <h1 className="text-slate-900 dark:text-white tracking-tight text-[40px] font-extrabold leading-tight text-center pt-4">
                        ReviewHub
                    </h1>
                    <p className="text-text-muted dark:text-slate-400 text-lg font-medium leading-normal pt-2 px-4 text-center">
                        Community-Powered Reviews
                    </p>
                </div>

                <div className="w-full flex flex-col gap-4 pb-8 max-w-md mx-auto animate-slide-up">
                    <button 
                        onClick={() => navigate('HOME')}
                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-primary hover:bg-primary-dark text-white text-[17px] font-bold shadow-lg shadow-primary/25 transition-transform active:scale-95"
                    >
                        Sign Up/Login
                    </button>
                    
                    <button 
                        onClick={() => navigate('HOME')}
                        className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-transparent border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-[17px] font-bold transition-all active:scale-95"
                    >
                        Browse Anonymously
                    </button>
                    
                    <p className="text-center text-xs text-slate-400 mt-2">
                        By continuing, you agree to our Terms & Policy
                    </p>
                </div>
            </div>
        </div>
    );
};