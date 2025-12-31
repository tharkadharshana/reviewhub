import React, { useState, useEffect } from 'react';
import { Icon, Button } from '../components/Shared';
import { api } from '../services/api';
import { useApp } from '../context/Store';
import { CategoryConfig } from '../services/reviewConfig';

export const WriteReviewModal = ({ onClose }: { onClose: () => void }) => {
    const { showToast, config, currentUser } = useApp();
    const [step, setStep] = useState(0); // 0: Category, 1: Details
    const [isLoading, setIsLoading] = useState(false);
    
    // State
    const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
    const [entityName, setEntityName] = useState(''); 
    
    // Dynamic Extras
    const [extraData, setExtraData] = useState<Record<string, string>>({});
    
    const [recommendedContact, setRecommendedContact] = useState('');
    const [isSameContact, setIsSameContact] = useState(false); 

    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [rating, setRating] = useState(0);
    const [description, setDescription] = useState('');
    
    // New: Good Faith Affirmation Checkbox
    const [isAccurate, setIsAccurate] = useState(false);

    // Reset issues when rating changes significantly
    useEffect(() => {
        setSelectedIssues([]);
    }, [rating < 4]);

    useEffect(() => {
        const phoneValue = extraData['phoneNumber'];
        if (isSameContact && phoneValue) {
            setRecommendedContact(phoneValue);
        }
    }, [extraData, isSameContact]);

    const handleExtraChange = (id: string, value: string) => {
        setExtraData(prev => ({ ...prev, [id]: value }));
        
        if (id === 'phoneNumber' && isSameContact) {
            setRecommendedContact(value);
        }
    };

    const toggleIssue = (issue: string) => {
        setSelectedIssues(prev => 
            prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
        );
    };

    const handleSubmit = async () => {
        if (!entityName || rating === 0 || !selectedCategory || !currentUser) {
            showToast("Please fill in the required fields", "error");
            return;
        }

        if (!isAccurate) {
            showToast("You must confirm the review is accurate", "error");
            return;
        }

        setIsLoading(true);
        try {
            // Construct structured Data
            const metaData: any = {
                platform: selectedPlatform,
                issues: selectedIssues,
                category: selectedCategory.id,
                ...extraData 
            };

            if (rating >= 4 && recommendedContact) {
                metaData.recommendedContact = recommendedContact;
            }

            const isScam = selectedIssues.some(i => 
                ['Scam', 'Fraud', 'No Delivery', 'Fake Item', 'Lottery Scam', 'Bank OTP Scam', 'Blocked Me'].some(keyword => i.includes(keyword))
            ) || selectedCategory.id === 'phone_scam' || rating === 1;

            const tags = [
                ...(isScam ? ['High Risk'] : []),
                ...(rating >= 4 ? ['Recommended'] : []),
                ...(selectedPlatform ? [selectedPlatform] : []),
                selectedCategory.label
            ];

            await api.reviews.create({
                entityName: entityName,
                entityType: selectedCategory.label,
                rating: rating,
                text: description,
                isScam: isScam,
                tags: tags,
                meta: metaData,
                user: currentUser
            });

            showToast("Review published successfully!", "success");
            onClose();
        } catch (e) {
            console.error(e);
            showToast("Failed to publish review", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const renderCategoryStep = () => (
        <div className="animate-fade-in px-1">
            <h3 className="text-xl font-bold text-white mb-2">What kind of review is this?</h3>
            <p className="text-gray-400 text-sm mb-6">Select a category to help us ask the right questions.</p>
            
            <div className="grid grid-cols-2 gap-3 pb-8">
                {config.categories.map((cat: CategoryConfig) => (
                    <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat); setStep(1); }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 hover:bg-white/5 ${cat.color}`}
                    >
                        <Icon name={cat.icon} size={32} className="mb-2" />
                        <span className="font-bold text-sm text-gray-200">{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderDetailsStep = () => {
        if (!selectedCategory) return null;

        let displayedTags: string[] = [];
        if (rating > 0) {
            displayedTags = rating >= 4 ? selectedCategory.tags.positive : selectedCategory.tags.negative;
        }

        return (
            <div className="animate-slide-up space-y-6 pb-20">
                {/* 1. Identity Inputs */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{selectedCategory.inputLabel} <span className="text-red-500">*</span></label>
                    <input 
                        className="w-full bg-[#1c2128] border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg transition-all" 
                        placeholder={selectedCategory.inputPlaceholder}
                        value={entityName}
                        onChange={(e) => setEntityName(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Conditional Inputs from Config (Dynamic) */}
                {selectedCategory.secondaryInputs && selectedCategory.secondaryInputs.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {selectedCategory.secondaryInputs.map(input => (
                             <div key={input.id}>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{input.label}</label>
                                <input 
                                    className="w-full bg-[#1c2128] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                                    placeholder={input.placeholder}
                                    type={input.type}
                                    value={extraData[input.id] || ''}
                                    onChange={(e) => handleExtraChange(input.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. Platform Selection */}
                {selectedCategory.platforms.length > 0 && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Platform / Method</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedCategory.platforms.map((p: string) => (
                                <button
                                    key={p}
                                    onClick={() => setSelectedPlatform(p)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                        selectedPlatform === p 
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                        : 'bg-transparent border-gray-600 text-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Rating */}
                <div className="flex flex-col items-center py-2">
                    <div className="flex items-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                                key={star} 
                                onClick={() => setRating(star)} 
                                className="group transition-transform active:scale-95 focus:outline-none"
                            >
                                <Icon 
                                    name="star" 
                                    filled={star <= rating} 
                                    size={36} 
                                    className={`transition-all duration-200 ${
                                        star <= rating 
                                        ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" 
                                        : "text-gray-700 dark:text-gray-600 hover:text-gray-500"
                                    }`} 
                                />
                            </button>
                        ))}
                    </div>
                    <div className={`mt-3 h-5 flex items-center justify-center transition-all duration-300 ${rating > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                        <span className={`text-sm font-bold tracking-wider ${
                            rating >= 4 ? 'text-green-400' : 
                            rating === 3 ? 'text-yellow-400' : 
                            'text-red-400'
                        }`}>
                            {rating === 1 ? "Terrible" : rating === 2 ? "Bad" : rating === 3 ? "Okay" : rating === 4 ? "Good" : rating === 5 ? "Excellent" : ""}
                        </span>
                    </div>
                </div>

                {/* 4. Dynamic Highlights */}
                {rating > 0 && displayedTags.length > 0 && (
                    <div className="animate-fade-in">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                            {rating >= 4 ? "What went well?" : "What went wrong?"}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {displayedTags.map((issue: string) => {
                                const isSelected = selectedIssues.includes(issue);
                                const isPositive = rating >= 4;
                                
                                return (
                                    <button
                                        key={issue}
                                        onClick={() => toggleIssue(issue)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                            isSelected 
                                                ? (isPositive 
                                                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                                                    : 'bg-red-500/20 border-red-500 text-red-400')
                                                : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'
                                        }`}
                                    >
                                        {issue}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 5. Conditional Contact Info */}
                {rating >= 4 && (
                    <div className="animate-fade-in bg-green-500/5 p-4 rounded-xl border border-green-500/20">
                        <div className="flex items-start gap-3 mb-3">
                            <Icon name="verified" className="text-green-500 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-green-400 text-sm">Help others find this!</h4>
                                <p className="text-xs text-gray-400">Add a contact number so others can hire this person/service.</p>
                            </div>
                        </div>

                        {extraData['phoneNumber'] && extraData['phoneNumber'].length > 0 && (
                            <label className="flex items-center gap-2 mb-3 cursor-pointer group w-fit select-none">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSameContact ? 'bg-green-500 border-green-500' : 'border-gray-500 group-hover:border-green-500'}`}>
                                    {isSameContact && <Icon name="check" size={12} className="text-white font-bold" />}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={isSameContact}
                                    onChange={(e) => setIsSameContact(e.target.checked)}
                                />
                                <span className={`text-xs font-medium transition-colors ${isSameContact ? 'text-green-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                    Same as above
                                </span>
                            </label>
                        )}

                        <input 
                            className="w-full bg-[#111418] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" 
                            placeholder="Recommended Contact Number (Optional)"
                            type="tel"
                            value={recommendedContact}
                            onChange={(e) => {
                                setRecommendedContact(e.target.value);
                                if (isSameContact) setIsSameContact(false);
                            }}
                        />
                    </div>
                )}

                {/* 6. Description */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description (Optional)</label>
                    <textarea 
                        className="w-full bg-[#1c2128] border border-gray-700 rounded-xl px-4 py-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500 text-base" 
                        placeholder="Tell others about your experience..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)} 
                    ></textarea>
                </div>
                
                {/* 7. Good Faith Declaration (New) */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isAccurate ? 'bg-primary border-primary' : 'border-gray-500 group-hover:border-primary'}`}>
                            {isAccurate && <Icon name="check" size={14} className="text-white font-bold" />}
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden"
                            checked={isAccurate}
                            onChange={(e) => setIsAccurate(e.target.checked)}
                        />
                        <div className="text-xs text-gray-400 leading-relaxed">
                            I confirm this review is based on my genuine personal experience. I understand that posting false or malicious reviews is a violation of the <span className="text-primary hover:underline">Terms</span> and may result in account termination.
                        </div>
                    </label>
                </div>

            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            
            <div className="relative w-full bg-surface-dark dark:bg-[#111418] rounded-t-3xl shadow-2xl flex flex-col h-[92vh] animate-slide-up text-white overflow-hidden border-t border-white/10">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/5 bg-[#111418] z-20">
                    <div className="flex items-center gap-3">
                        {step > 0 && (
                            <button onClick={() => setStep(step - 1)} className="p-1 rounded-full hover:bg-white/10 text-gray-400">
                                <Icon name="arrow_back" size={20} />
                            </button>
                        )}
                        <h2 className="text-lg font-bold tracking-tight">
                            {step === 0 ? "New Review" : selectedCategory?.title}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <Icon name="close" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar relative">
                    {step === 0 && renderCategoryStep()}
                    {step === 1 && renderDetailsStep()}
                </div>

                {/* Footer Actions */}
                {step > 0 && (
                    <div className="p-4 border-t border-white/10 bg-[#111418] z-20 pb-8">
                        <Button 
                            variant="primary" 
                            onClick={handleSubmit} 
                            isLoading={isLoading}
                            className={`w-full text-base ${!isAccurate ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!entityName || rating === 0 || !isAccurate}
                        >
                            Submit Review
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};