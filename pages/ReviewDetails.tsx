import React, { useState, useEffect } from 'react';
import { useApp } from '../context/Store';
import { Review, Comment } from '../types';
import { Icon, Header, Button } from '../components/Shared';
import { api } from '../services/api';

export const ReviewDetails = ({ review }: { review: Review }) => {
    const { navigate, showToast, currentUser } = useApp();
    const [likes, setLikes] = useState(review?.likes || 0);
    const [hasLiked, setHasLiked] = useState(false);
    
    // Comments State
    const [commentsList, setCommentsList] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    // Load comments on mount
    useEffect(() => {
        if(review?.id) {
            api.reviews.getComments(review.id).then(setCommentsList);
        }
    }, [review]);

    if (!review) return null;

    const handleLike = async () => {
        if (!currentUser) {
            showToast("Please login to vote", "info");
            navigate('LOGIN');
            return;
        }

        const newHasLiked = !hasLiked;
        setHasLiked(newHasLiked);
        setLikes(prev => newHasLiked ? prev + 1 : prev - 1);
        
        try {
            await api.reviews.vote(review.id, newHasLiked ? 'up' : 'down');
        } catch (e) {
            setHasLiked(!newHasLiked);
            setLikes(prev => !newHasLiked ? prev + 1 : prev - 1);
            showToast("Failed to vote", "error");
        }
    };

    const handlePostComment = async () => {
        if (!currentUser) return;
        if (!commentText.trim()) return;

        setIsPosting(true);
        try {
            const newComment = await api.reviews.addComment(review.id, commentText, currentUser);
            setCommentsList(prev => [newComment, ...prev]);
            setCommentText('');
            showToast("Comment posted!", "success");
        } catch (e) {
            showToast("Failed to post comment", "error");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-background-light dark:bg-background-dark pb-24 animate-fade-in">
            <Header 
                title="Review Details" 
                showBack 
                onBack={() => navigate('HOME')} 
                rightAction={
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-slate-900 dark:text-white">
                        <Icon name="share" size={20} />
                    </button>
                }
            />

            {/* Hero Section */}
            <div className="px-5 pt-4 pb-6 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-2">{review.entityName}</h2>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300 font-medium">{review.entityType || 'Business'}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">{review.date}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                <span className="text-lg font-black">{review.rating}</span>
                            </div>
                            <div className="flex text-amber-400 text-[10px]">
                                {[1,2,3,4,5].map(i => <Icon key={i} name="star" filled={i <= Math.round(review.rating)} size={12} />)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 px-4 pt-6 flex flex-col gap-6">
                <article className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
                    {/* User Info */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src={review.user.avatar} className="w-10 h-10 rounded-full bg-gray-200 object-cover" alt={review.user.name} />
                                {review.user.verified && (
                                    <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-[2px] border-2 border-white dark:border-surface-dark flex items-center justify-center">
                                        <Icon name="check" size={10} className="font-bold" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{review.user.name}</span>
                                <span className="text-xs text-gray-500 font-medium">Reviewer stats: {review.user.stats?.reviews || 12} reviews</span>
                            </div>
                        </div>
                        <Button variant="outline" className="!h-8 !px-3 !text-xs !rounded-lg">Follow</Button>
                    </div>

                    <div className="mb-5">
                         <p className="text-slate-700 dark:text-slate-300 text-[16px] leading-relaxed whitespace-pre-line">
                            {review.text}
                         </p>
                    </div>

                    {review.images && (
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-4 -mx-1 px-1">
                            {review.images.map((img: string, i: number) => (
                                <div key={i} className="flex-none w-60 aspect-video rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden relative border border-gray-100 dark:border-gray-700">
                                    <img src={img} className="w-full h-full object-cover" alt="Proof" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={handleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 ${hasLiked ? 'bg-primary/10 text-primary' : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                             >
                                <Icon name="thumb_up" filled={hasLiked} size={20} />
                                <span className="text-sm font-bold">{likes}</span>
                             </button>
                             <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                                <Icon name="chat_bubble" size={20} />
                                <span className="text-sm font-bold">{commentsList.length}</span>
                             </button>
                        </div>
                    </div>
                </article>

                {/* Developer/Official Response */}
                {review.isScam && (
                     <article className="relative bg-red-500/5 rounded-2xl border border-red-500/20 p-5 overflow-hidden">
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-1">
                                <Icon name="security" className="text-red-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-red-500 text-sm mb-1">Safety Warning</h4>
                                <p className="text-sm text-red-900/80 dark:text-red-200/80 leading-relaxed">
                                    This number has been flagged by multiple users as a scam. Do not provide personal information.
                                </p>
                            </div>
                        </div>
                     </article>
                )}

                {/* Comments */}
                <section className="flex flex-col gap-4 mt-2">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Discussion</h4>
                    
                    {/* Add Comment Input */}
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        {currentUser ? (
                            <div className="flex gap-3">
                                <img src={currentUser.avatar} className="w-8 h-8 rounded-full bg-gray-200 object-cover shrink-0" alt={currentUser.name} />
                                <div className="flex-1 flex flex-col gap-2">
                                    <textarea 
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..." 
                                        className="w-full bg-gray-50 dark:bg-background-dark border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-gray-500 resize-none h-20"
                                    />
                                    <div className="flex justify-end">
                                        <Button 
                                            className="!h-8 !px-4 !text-xs !rounded-lg"
                                            onClick={handlePostComment}
                                            isLoading={isPosting}
                                            disabled={!commentText.trim()}
                                        >
                                            Post
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-2 text-center">
                                <p className="text-sm text-gray-500 mb-3">Log in to join the conversation</p>
                                <Button variant="outline" onClick={() => navigate('LOGIN')} className="!h-9">
                                    Sign In
                                </Button>
                            </div>
                        )}
                    </div>

                    {commentsList.map(comment => (
                        <div key={comment.id} className="flex gap-3 animate-fade-in">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 mt-1">
                                <img src={comment.user.avatar} className="w-full h-full object-cover" alt="User" />
                            </div>
                            <div className="flex-1 bg-white dark:bg-surface-dark p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{comment.user.name}</span>
                                    <span className="text-[10px] text-gray-400">{comment.timeAgo}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};