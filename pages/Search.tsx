import React, { useState, useEffect } from 'react';
import { useApp } from '../context/Store';
import { api } from '../services/api';
import { Review } from '../types';
import { Icon, Skeleton } from '../components/Shared';

export const Search = () => {
    const { navigate } = useApp();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Review[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2) {
                setIsSearching(true);
                const data = await api.search.query(query);
                setResults(data);
                setIsSearching(false);
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in">
            <header className="sticky top-0 z-50 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800 pb-2">
                <div className="flex items-center px-4 pt-4 pb-2 gap-3">
                    <button onClick={() => navigate('HOME')} className="flex items-center justify-center size-10 text-primary hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors shrink-0">
                        <Icon name="arrow_back" />
                    </button>
                    <div className="flex-1 relative">
                        <div className="flex w-full items-center rounded-2xl bg-slate-100 dark:bg-surface-dark h-12 px-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                            <Icon name="search" className="text-gray-400" size={22} />
                            <input 
                                className="w-full bg-transparent border-none focus:ring-0 text-base text-slate-900 dark:text-white placeholder-gray-400 px-3 font-normal" 
                                type="text" 
                                placeholder="Search everything..."
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

            <main className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
                {isSearching ? (
                    [1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
                ) : results.length > 0 ? (
                    results.map(result => (
                        <div 
                            key={result.id}
                            onClick={() => navigate('REVIEW_DETAILS', result)}
                            className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer border border-gray-100 dark:border-gray-800"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">{result.entityName}</h3>
                                <span className="text-xs text-gray-500">{result.rating.toFixed(1)} ★</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{result.text}</p>
                        </div>
                    ))
                ) : query.length > 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                        <Icon name="search_off" size={48} className="mb-2 opacity-50" />
                        <p>No results found for "{query}"</p>
                    </div>
                ) : (
                    <div className="pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Recent Searches</h4>
                        <div className="flex flex-wrap gap-2">
                            {['iPhone 15', 'Scam calls', 'Best Pizza'].map(t => (
                                <button key={t} onClick={() => setQuery(t)} className="px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};