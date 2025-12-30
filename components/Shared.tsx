import React from 'react';

// --- ATOMS ---

interface IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const Icon: React.FC<IconProps> = ({ name, filled = false, size = 24, className = "", onClick }) => (
  <span 
    onClick={onClick}
    className={`material-symbols-outlined ${filled ? 'filled' : ''} ${className} ${onClick ? 'cursor-pointer' : ''} select-none`}
    style={{ fontSize: `${size}px` }}
  >
    {name}
  </span>
);

export const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`}></div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    isLoading?: boolean;
    icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, variant = 'primary', isLoading, icon, className = "", ...props 
}) => {
    const base = "relative overflow-hidden h-12 rounded-xl px-5 font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
    
    const variants = {
        primary: "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark",
        secondary: "bg-surface-dark text-white hover:bg-black",
        outline: "border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800",
        ghost: "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5",
        danger: "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600"
    };

    return (
        <button className={`${base} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    {icon && <Icon name={icon} size={20} />}
                    {children}
                </>
            )}
        </button>
    );
};

// --- MOLECULES ---

interface ReviewCardProps {
    title: string;
    subtitle?: string;
    rating?: number;
    text: string;
    date: string;
    avatar?: string;
    imageUrl?: string;
    likes: number;
    comments: number;
    tags?: string[];
    isScam?: boolean;
    onClick?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ 
    title, subtitle, rating, text, date, avatar, imageUrl, likes, comments, tags, isScam, onClick 
}) => {
    return (
        <div 
            onClick={onClick}
            className="group bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer relative overflow-hidden active:bg-gray-50 dark:active:bg-gray-800/50"
        >
            {isScam && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>
            )}
            
            <div className="flex items-start justify-between mb-3">
                <div className="flex gap-3 w-full">
                    {/* Avatar Area */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white dark:ring-surface-dark shadow-sm ${isScam ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {avatar ? (
                            <img src={avatar} alt={title} className="h-full w-full object-cover" />
                        ) : isScam ? (
                            <Icon name="phone_disabled" size={20} />
                        ) : (
                             <Icon name="storefront" className="text-gray-400" size={20} />
                        )}
                    </div>
                    
                    {/* Header Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex justify-between items-start">
                            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-tight truncate pr-2">{title}</h3>
                            {tags && tags.length > 0 && (
                                <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset shrink-0 ${isScam ? 'bg-red-50 text-red-600 ring-red-500/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'}`}>
                                    {tags[0]}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-1">
                            {isScam ? (
                                <>
                                    <Icon name="warning" className="text-red-500" size={16} />
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400">High Risk Alert</span>
                                </>
                            ) : (
                                <>
                                    {rating !== undefined && (
                                        <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                                            <Icon name="star" filled className="text-amber-500" size={12} />
                                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 ml-1">{rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                    {subtitle && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1 truncate max-w-[120px]">{subtitle}</span>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-3 pl-[52px]">
                {isScam && <span className="font-bold text-red-500 mr-1">DO NOT ANSWER.</span>}
                {text}
            </p>
            
            {imageUrl && (
                 <div className="pl-[52px] mb-3">
                    <div className="h-32 w-full rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <img src={imageUrl} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                 </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 pl-[52px]">
                <div className="flex items-center gap-4">
                    <button className={`flex items-center gap-1.5 transition-colors group ${isScam ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                        <Icon name="thumb_up" filled={isScam} size={16} className="group-hover:text-primary transition-colors" />
                        <span className="text-xs font-semibold">{likes}</span>
                    </button>
                    {!isScam && (
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                            <Icon name="chat_bubble" size={16} />
                            <span className="text-xs font-semibold">{comments}</span>
                        </button>
                    )}
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{date}</span>
            </div>
        </div>
    );
};

// --- ORGANISMS ---

export const BottomNav = ({ activeTab, onNavigate }: { activeTab: string, onNavigate: (v: any) => void }) => {
    const navItems = [
        { id: 'HOME', icon: 'home', label: 'Home' },
        // Search removed as per request
        { id: 'ADD', icon: 'add', label: '', isFab: true },
        { id: 'PROFILE', icon: 'person', label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 pb-safe z-40 max-w-md mx-auto">
            <div className="flex justify-around items-center h-16 px-2 pb-1">
                {navItems.map((item) => {
                    if (item.isFab) {
                        return (
                            <div key={item.id} className="-mt-8 relative z-50">
                                <button 
                                    onClick={() => onNavigate('WRITE_REVIEW_MODAL')}
                                    className="h-14 w-14 rounded-full bg-primary text-white shadow-xl shadow-primary/40 flex items-center justify-center hover:bg-primary-dark transition-all active:scale-90"
                                >
                                    <Icon name={item.icon} size={28} />
                                </button>
                            </div>
                        );
                    }
                    const isActive = activeTab === item.id;
                    return (
                        <button 
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            <Icon name={item.icon} filled={isActive} size={24} className={isActive ? "animate-bounce-short" : ""} />
                            <span className={`text-[10px] font-semibold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export const Header = ({ title, showBack, onBack, rightAction, transparent = false }: { title?: string, showBack?: boolean, onBack?: () => void, rightAction?: React.ReactNode, transparent?: boolean }) => (
    <div className={`sticky top-0 z-30 px-4 py-3 flex items-center justify-between h-[60px] transition-all ${transparent ? 'bg-transparent' : 'bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800'}`}>
        {showBack ? (
            <button onClick={onBack} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-slate-900 dark:text-white active:scale-90">
                <Icon name="arrow_back_ios_new" size={18} />
            </button>
        ) : (
            <div className="w-10"></div> // Spacer
        )}
        
        {title && (
            <h1 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">{title}</h1>
        )}

        <div className="flex items-center gap-2 min-w-[40px] justify-end">
            {rightAction}
        </div>
    </div>
);