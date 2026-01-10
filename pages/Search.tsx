import React, { useState, useEffect } from 'react';
import { useApp } from '../context/Store';
import { api } from '../services/api';
import { Review } from '../types';
import { Icon, Skeleton, Button, ReviewCard } from '../components/Shared';

export const Search = () => {
    const { navigate, showToast } = useApp();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Review[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Global Search States
    const [isGlobalSearching, setIsGlobalSearching] = useState(false);
    const [globalResult, setGlobalResult] = useState<{ text: string, sources: any[] } | null>(null);

    // Detect if query looks like a phone number
    const isPhoneNumber = /^\d{7,12}$/.test(query.replace(/\D/g, ''));

    // Internal Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2) {
                setIsSearching(true);
                setGlobalResult(null);
                const data = await api.search.query(query);
                setResults(data);
                setIsSearching(false);
            } else {
                setResults([]);
                setGlobalResult(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    const handleGlobalSearch = async () => {
        if (query.length < 3) return;
        setIsGlobalSearching(true);
        try {
            const response = await api.ai.globalSearch(query);
            setGlobalResult(response);
        } catch (e: any) {
            const msg = e.message || "Investigative search failed.";
            showToast(msg, "error");
        } finally {
            setIsGlobalSearching(false);
        }
    };

    const handleImportToHub = () => {
        if (!globalResult) return;
        // Navigate to Write Review modal with pre-filled AI data
        navigate('WRITE_REVIEW_MODAL', {
            entityName: query,
            description: globalResult.text,
            isAiImport: true
        });
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in pb-24">
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 pb-2">
                <div className="flex items-center px-4 pt-4 pb-2 gap-3">
                    <button onClick={() => navigate('HOME')} className="flex items-center justify-center size-10 text-primary hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors shrink-0 active:scale-90">
                        <Icon name="arrow_back" />
                    </button>
                    <div className="flex-1 relative">
                        <div className="flex w-full items-center rounded-2xl bg-gray-100 dark:bg-surface-dark h-12 px-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                            <Icon name={isPhoneNumber ? "call" : "search"} className={isPhoneNumber ? "text-primary" : "text-gray-400"} size={22} />
                            <input 
                                className="w-full bg-transparent border-none focus:ring-0 text-base text-slate-900 dark:text-white placeholder-gray-400 px-3 font-normal" 
                                type="text" 
                                placeholder={isPhoneNumber ? "Investigate this number..." : "Search phone, business, email..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                            {query && (
                                <button onClick={() => setQuery('')}>
                                    <Icon name="cancel" filled className="text-gray-400 hover:text-gray-600" size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto no-scrollbar">
                {/* Local Results */}
                {isSearching ? (
                    <div className="space-y-4">
                        {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Verified Reports in Hub</h4>
                        {results.map(result => (
                            <ReviewCard 
                                key={result.id}
                                title={result.entityName}
                                subtitle={result.entityType}
                                rating={result.rating}
                                text={result.text}
                                date={result.date}
                                avatar={result.user.avatar}
                                likes={result.likes}
                                comments={result.comments}
                                tags={result.tags}
                                isScam={result.isScam}
                                onClick={() => navigate('REVIEW_DETAILS', result)}
                            />
                        ))}
                    </div>
                ) : null}

                {/* Global Search Trigger */}
                {query.length > 2 && !isSearching && (
                    <div className="mt-2 animate-fade-in">
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center gap-4 shadow-sm relative overflow-hidden">
                            {isPhoneNumber && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12"></div>
                            )}
                            
                            <div className={`size-14 rounded-full flex items-center justify-center ${isPhoneNumber ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-gray-400'}`}>
                                <Icon name={isPhoneNumber ? "security" : "explore"} size={32} className={isGlobalSearching ? "animate-spin" : ""} />
                            </div>
                            
                            <div className="max-w-[280px]">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {isPhoneNumber ? "Identify this Caller" : "Global Intelligence Search"}
                                </h3>
                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                    {isPhoneNumber 
                                        ? `Ask AI to scan Reddit, Facebook groups, and Truecaller-style databases for reports on "${query}".`
                                        : `Ask AI to investigate "${query}" across the public web and forums for hidden reputation issues.`}
                                </p>
                            </div>
                            
                            <Button 
                                onClick={handleGlobalSearch} 
                                isLoading={isGlobalSearching}
                                className="!h-11 !px-8 !text-sm !rounded-full shadow-lg"
                                icon={isPhoneNumber ? "mystery_checker" : "search"}
                            >
                                Start AI Investigation
                            </Button>
                        </div>
                    </div>
                )}

                {/* Global AI Results */}
                {globalResult && (
                    <div className="animate-slide-up space-y-4">
                        <div className="bg-white dark:bg-surface-dark border border-primary/20 rounded-2xl overflow-hidden shadow-xl shadow-primary/5">
                            <div className="bg-slate-900 dark:bg-primary text-white px-4 py-3 flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Icon name="auto_awesome" size={16} /> Investigation Report
                                </span>
                                <div className="size-2 rounded-full bg-green-400 animate-pulse"></div>
                            </div>
                            
                            <div className="p-5">
                                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line italic">
                                        "{globalResult.text}"
                                    </p>
                                </div>
                                
                                {/* Sources Grounding */}
                                {globalResult.sources.length > 0 && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Grounding Sources</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {globalResult.sources.map((src: any, i: number) => (
                                                <a 
                                                    key={i}
                                                    href={src.web?.uri || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/5 transition-all active:scale-95"
                                                >
                                                    <Icon name="public" size={14} />
                                                    {src.web?.title ? src.web.title.substring(0, 25) + '...' : `Reference ${i+1}`}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-white/5 p-4 flex flex-col gap-3">
                                <p className="text-[10px] text-center text-gray-500 font-medium italic">Is this information accurate? Help the community by saving it.</p>
                                <Button 
                                    className="w-full !h-12 !rounded-xl"
                                    icon="publish"
                                    onClick={handleImportToHub}
                                >
                                    Helpful? Save to Hub
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Initial Empty State */}
                {query.length === 0 && (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-400 opacity-40">
                        <Icon name="manage_search" size={64} className="mb-4" />
                        <h4 className="text-xs font-black uppercase tracking-widest">Universal Scam Search</h4>
                        <p className="text-xs text-center mt-2 max-w-[200px] leading-relaxed">Search locally or globally. Identify anonymous callers and fake pages instantly.</p>
                    </div>
                )}
            </main>
        </div>
    );
};