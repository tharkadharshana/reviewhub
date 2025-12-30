import React from 'react';
import { AppContextType } from '../types';
import { reviews, currentUser } from '../services/mockData';
import { ReviewCard, Icon, Header } from '../components/Shared';

export const MyReviews = ({ navigate, onReviewClick }: { navigate: AppContextType['navigate'], onReviewClick: (r: any) => void }) => {
    // Filter reviews belonging to the current user
    const myReviews = reviews.filter(r => r.user.id === currentUser.id);

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-fade-in pb-20">
            <Header title="My Reviews" showBack onBack={() => navigate('PROFILE')} />
            
            <main className="flex-1 px-5 pt-6 flex flex-col gap-4 overflow-y-auto">
                {myReviews.length > 0 ? (
                    myReviews.map(review => (
                        <ReviewCard 
                            key={review.id}
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
                            onClick={() => onReviewClick(review)}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Icon name="rate_review" size={48} className="mb-4 opacity-50" />
                        <p className="font-medium">You haven't written any reviews yet.</p>
                        <button 
                            onClick={() => navigate('WRITE_REVIEW_MODAL')}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-dark transition-colors"
                        >
                            Write your first review
                        </button>
                    </div>
                )}
                
                {myReviews.length > 0 && (
                    <div className="text-center text-xs text-gray-400 py-4">
                        Showing all {myReviews.length} reviews
                    </div>
                )}
            </main>
        </div>
    );
};