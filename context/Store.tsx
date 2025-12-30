import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, ViewState, User, ToastMessage } from '../types';
import { api } from '../services/api';
import { REVIEW_CONFIG } from '../services/reviewConfig';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- Navigation State ---
    const [currentView, setView] = useState<ViewState>('HOME');
    const [viewData, setViewData] = useState<any>(null);
    const [history, setHistory] = useState<{view: ViewState, data: any}[]>([]);

    // --- User State ---
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // --- Theme State ---
    const [isDarkMode, setIsDarkMode] = useState(true);

    // --- Toast State ---
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // --- Dynamic Config State ---
    const [config, setConfig] = useState({ categories: REVIEW_CONFIG, loaded: false });

    // Bootstrap
    useEffect(() => {
        // 1. Auth Listener
        const unsubscribe = api.auth.onStateChange((user) => {
            setCurrentUser(user);
        });

        // 2. Load Config from Firestore/Cache
        const loadConfig = async () => {
            try {
                const categories = await api.config.get();
                setConfig({ categories, loaded: true });
            } catch (e) {
                console.error("Config load error", e);
                // Fallback is already set in initial state
            }
        };
        loadConfig();

        // 3. Theme
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return () => unsubscribe();
    }, [isDarkMode]);

    const navigate = (view: ViewState, data?: any) => {
        if (view === 'WRITE_REVIEW_MODAL') {
             setView('WRITE_REVIEW_MODAL');
             return;
        }
        setHistory(prev => [...prev, { view: currentView, data: viewData }]);
        setViewData(data);
        setView(view);
        window.scrollTo(0, 0);
    };

    const login = async () => {
        // For demo, using hardcoded credential. In real app, modal handles input
        try {
            await api.auth.login("demo@reviewhub.com", "password123");
            showToast(`Welcome!`, 'success');
        } catch (e) {
            showToast("Login failed", "error");
        }
    };

    const logout = async () => {
        await api.auth.logout();
        navigate('HOME');
        showToast('Logged out successfully', 'info');
    };

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <AppContext.Provider value={{
            currentView,
            viewData,
            navigate,
            currentUser,
            login,
            logout,
            showToast,
            isDarkMode,
            toggleTheme,
            config
        }}>
            {children}
            
            {/* Global Toast Render */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`animate-fade-in px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border pointer-events-auto backdrop-blur-md ${
                            toast.type === 'success' ? 'bg-green-500/90 text-white border-green-600' :
                            toast.type === 'error' ? 'bg-red-500/90 text-white border-red-600' :
                            'bg-slate-800/90 text-white border-slate-700'
                        }`}
                    >
                         <span className="material-symbols-outlined text-[20px]">
                            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
                         </span>
                         <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                ))}
            </div>
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};