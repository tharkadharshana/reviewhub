import React, { useState, useEffect } from 'react';
import { useApp } from '../context/Store';
import { api } from '../services/api';
import { Review } from '../types';
import { ReviewCard, Icon, Skeleton } from '../components/Shared';

export const Home = () => {
    const { navigate, isDarkMode, toggleTheme, config } = useApp();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    // Build categories list dynamically
    const categories = ['All', 'High Risk', ...config.categories.map((c: any) => c.label)];

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await api.reviews.getAll(filter);
                setReviews(data);
            } catch (e) {
                console.error("Failed to load feed");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [filter]);

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
                <div className="px-5 pt-6 pb-2 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-1">
                            ReviewHub<span className="text-primary text-3xl">.</span>
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <Icon name={isDarkMode ? "light_mode" : "dark_mode"} className="text-gray-500" />
                        </button>
                        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                            <Icon name="notifications" className="text-gray-500" />
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-background-dark"></span>
                        </button>
                    </div>
                </div>
                
                {/* Search Trigger */}
                <div className="px-5 py-2">
                    <div 
                        onClick={() => navigate('SEARCH')}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-100 dark:bg-surface-dark transition-all active:scale-[0.99]"
                    >
                        <div className="flex items-center px-4 py-3.5 gap-3">
                            <Icon name="search" className="text-gray-400 group-hover:text-primary transition-colors" />
                            <span className="text-sm text-gray-500 font-medium">Search phone, business, email...</span>
                        </div>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="w-full overflow-x-auto no-scrollbar py-3 px-5">
                    <div className="flex gap-2.5">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`flex items-center justify-center px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${
                                    filter === cat 
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105' 
                                    : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Feed */}
            <main className="flex-1 px-5 pt-4">
                <div className="flex justify-between items-end mb-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trending</h2>
                    <button className="text-xs font-bold text-primary hover:text-primary-dark uppercase tracking-wide">View All</button>
                </div>

                <div className="flex flex-col gap-5 pb-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                                <div className="flex gap-3 mb-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-5/6 mb-4" />
                            </div>
                        ))
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className="animate-slide-up">
                                <ReviewCard 
                                    title={review.entityName}
                                    subtitle={review.entityType}
                                    rating={review.rating}
                                    text={review.text}
                                    date={review.date}
                                    avatar={review.user.avatar}
                                    likes={review.likes}
                                    comments={review.comments}
                                    tags={review.tags}
                                    isScam={review.isScam}
                                    imageUrl={review.images?.[0]}
                                    onClick={() => navigate('REVIEW_DETAILS', review)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};