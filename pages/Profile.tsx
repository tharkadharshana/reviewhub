import React, { useEffect, useState } from 'react';
import { useApp } from '../context/Store';
import { Icon, Button, ReviewCard, Skeleton } from '../components/Shared';
import { api } from '../services/api';
import { Review } from '../types';

export const Profile = () => {
    const { navigate, currentUser, logout } = useApp();
    const [myReviews, setMyReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ reviews: 0, votes: 0, rating: 0 });

    useEffect(() => {
        if (currentUser?.id) {
            const fetchReviews = async () => {
                setIsLoading(true);
                try {
                    const data = await api.reviews.getUserReviews(currentUser.id);
                    setMyReviews(data);
                    
                    // Calculate stats
                    const totalReviews = data.length;
                    const totalVotes = data.reduce((acc, r) => acc + (r.likes || 0), 0);
                    const avgRating = totalReviews > 0 
                        ? (data.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
                        : 0;

                    setStats({
                        reviews: totalReviews,
                        votes: totalVotes,
                        rating: Number(avgRating)
                    });
                } catch (e) {
                    console.error("Failed to load user reviews");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchReviews();
        }
    }, [currentUser]);

    // If no user is logged in, show Auth Wall
    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark p-6 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Icon name="person" className="text-primary" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Join ReviewHub</h2>
                <p className="text-gray-500 mb-8 max-w-xs">Sign up to track your reviews, verify your identity, and build trust.</p>
                <Button onClick={() => navigate('LOGIN')} className="w-full max-w-xs">Sign In / Sign Up</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-background-light dark:bg-background-dark pb-24 animate-fade-in">
            <header className="sticky top-0 z-10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center px-4 py-3 justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h2>
                    <button onClick={logout} className="text-sm font-medium text-red-500 hover:text-red-600">
                        Log Out
                    </button>
                </div>
            </header>

            <section className="flex flex-col items-center px-4 py-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer">
                        <img src={currentUser.avatar} alt="Profile" className="rounded-full h-24 w-24 shadow-xl ring-4 ring-white dark:ring-surface-dark object-cover" />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon name="edit" className="text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h1>
                        <p className="text-gray-500 text-sm font-medium">{currentUser.handle}</p>
                    </div>
                    
                    {currentUser.verified ? (
                         <div className="flex items-center gap-1.5 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                            <Icon name="verified" filled className="text-green-500" size={16} />
                            <span className="text-green-600 font-bold text-xs tracking-wide uppercase">Verified Member</span>
                        </div>
                    ) : (
                        <Button onClick={() => navigate('VERIFY')} variant="outline" className="h-9 text-xs">Verify Identity</Button>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800 border-y border-gray-200 dark:border-gray-800 py-4 mb-4 bg-white dark:bg-surface-dark">
                <div className="flex flex-col items-center">
                    <span className="font-black text-xl text-slate-900 dark:text-white">{stats.reviews}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Reviews</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-black text-xl text-slate-900 dark:text-white">{stats.votes}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Impact</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-black text-xl text-slate-900 dark:text-white">{stats.rating}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Rating</span>
                </div>
            </div>

            <main className="flex flex-col px-4 gap-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Activity</h3>
                    {myReviews.length > 0 && (
                        <button onClick={() => navigate('MY_REVIEWS')} className="text-xs font-bold text-primary">View All</button>
                    )}
                 </div>
                 
                 {isLoading ? (
                     [1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
                 ) : myReviews.length > 0 ? (
                     myReviews.slice(0, 3).map(r => (
                         <ReviewCard 
                            key={r.id}
                            title={r.entityName}
                            subtitle={r.entityType}
                            rating={r.rating}
                            text={r.text}
                            date={r.date}
                            avatar={r.user.avatar}
                            likes={r.likes}
                            comments={r.comments}
                            tags={r.tags}
                            isScam={r.isScam}
                            imageUrl={r.images?.[0]}
                            onClick={() => navigate('REVIEW_DETAILS', r)}
                         />
                     ))
                 ) : (
                     <div className="text-center py-8 text-gray-500">
                         <p className="text-sm mb-4">You haven't posted any reviews yet.</p>
                         <Button onClick={() => navigate('WRITE_REVIEW_MODAL')} variant="outline" className="w-auto mx-auto">Write Review</Button>
                     </div>
                 )}
            </main>
        </div>
    );
};