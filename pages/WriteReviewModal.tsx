import React, { useState, useEffect } from 'react';
import { Icon, Button } from '../components/Shared';
import { api } from '../services/api';
import { useApp } from '../context/Store';
import { CategoryConfig } from '../services/reviewConfig';

export const WriteReviewModal = ({ onClose }: { onClose: () => void }) => {
    const { showToast, config, currentUser, viewData } = useApp();
    const [step, setStep] = useState(0); 
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
    const [entityName, setEntityName] = useState(''); 
    const [extraData, setExtraData] = useState<Record<string, string>>({});
    const [recommendedContact, setRecommendedContact] = useState('');
    const [isSameContact, setIsSameContact] = useState(false); 
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [rating, setRating] = useState(0);
    const [description, setDescription] = useState('');
    const [isAccurate, setIsAccurate] = useState(false);

    // AI Import Integration
    useEffect(() => {
        if (viewData?.entityName) {
            setEntityName(viewData.entityName);
            // If it looks like a phone, auto-select Scam category
            const isPhone = /^\d+$/.test(viewData.entityName.replace(/\D/g, ''));
            if (isPhone) {
                const scamCat = config.categories.find(c => c.id === 'phone_scam');
                if (scamCat) setSelectedCategory(scamCat);
            }
            if (viewData.description) {
                setDescription(viewData.description);
            }
            if (viewData.isAiImport) {
                setStep(1); // Skip category selection if imported
                setRating(1); // Default to 1 star for investigative reports usually
                setIsAccurate(true); // User is confirming AI findings are helpful
            }
        }
    }, [viewData, config.categories]);

    const handleExtraChange = (id: string, value: string) => {
        setExtraData(prev => ({ ...prev, [id]: value }));
        if (id === 'phoneNumber' && isSameContact) setRecommendedContact(value);
    };

    const toggleIssue = (issue: string) => {
        setSelectedIssues(prev => 
            prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
        );
    };

    const handleSubmit = async () => {
        if (!entityName || rating === 0 || !selectedCategory || !currentUser) {
            showToast("Required fields missing", "error");
            return;
        }

        if (!isAccurate) {
            showToast("Confirm accuracy to proceed", "error");
            return;
        }

        setIsLoading(true);
        try {
            const isScam = selectedIssues.some(i => 
                ['Scam', 'Fraud', 'No Delivery', 'Fake Item', 'Lottery Scam', 'Bank OTP Scam', 'Blocked Me'].some(keyword => i.includes(keyword))
            ) || selectedCategory.id === 'phone_scam' || rating === 1;

            const tags = [
                ...(isScam ? ['High Risk'] : []),
                ...(rating >= 4 ? ['Recommended'] : []),
                ...(selectedPlatform ? [selectedPlatform] : []),
                selectedCategory.label,
                ...(viewData?.isAiImport ? ['AI Verified'] : [])
            ];

            await api.reviews.create({
                entityName,
                entityType: selectedCategory.label,
                rating,
                text: description,
                isScam,
                tags,
                meta: { platform: selectedPlatform, issues: selectedIssues, ...extraData },
                user: currentUser
            });

            showToast("Published to Hub!", "success");
            onClose();
        } catch (e: any) {
            showToast(e.message || "Failed to publish", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const renderCategoryStep = () => (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-2">Select Category</h3>
            <p className="text-gray-400 text-sm mb-6">Categorizing helps others find your report faster.</p>
            
            <div className="grid grid-cols-2 gap-3 pb-8">
                {config.categories.map((cat: CategoryConfig) => (
                    <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat); setStep(1); }}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all active:scale-95 border-white/5 bg-white/5 hover:bg-white/10`}
                    >
                        <Icon name={cat.icon} size={32} className={`mb-2 ${cat.color.split(' ')[0]}`} />
                        <span className="font-bold text-xs text-gray-300">{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderDetailsStep = () => {
        if (!selectedCategory) return null;
        const displayedTags = rating >= 4 ? selectedCategory.tags.positive : selectedCategory.tags.negative;

        return (
            <div className="animate-slide-up space-y-6 pb-24">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{selectedCategory.inputLabel}</label>
                    <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary/50 text-lg" 
                        placeholder={selectedCategory.inputPlaceholder}
                        value={entityName}
                        onChange={(e) => setEntityName(e.target.value)}
                    />
                </div>

                {/* Rating */}
                <div className="flex flex-col items-center py-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setRating(star)} className="active:scale-90 transition-transform">
                                <Icon 
                                    name="star" 
                                    filled={star <= rating} 
                                    size={40} 
                                    className={star <= rating ? "text-amber-400" : "text-gray-700"} 
                                />
                            </button>
                        ))}
                    </div>
                    <span className="mt-3 text-xs font-bold text-amber-500 uppercase tracking-widest">
                        {rating > 0 ? ["Terrible", "Poor", "Average", "Good", "Perfect"][rating-1] : "Tap to rate"}
                    </span>
                </div>

                {rating > 0 && (
                    <div className="animate-fade-in">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Key Highlights</label>
                        <div className="flex flex-wrap gap-2">
                            {displayedTags.map((tag: string) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleIssue(tag)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                        selectedIssues.includes(tag) 
                                        ? 'bg-primary border-primary text-white' 
                                        : 'bg-white/5 border-white/10 text-gray-400'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Context & Description</label>
                    <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 h-32 resize-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-600 text-sm" 
                        placeholder="Explain why you are reporting this..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)} 
                    ></textarea>
                </div>
                
                <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20">
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <div className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${isAccurate ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                            {isAccurate && <Icon name="check" size={16} className="text-white font-bold" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={isAccurate} onChange={(e) => setIsAccurate(e.target.checked)} />
                        <div className="text-[11px] text-gray-400 leading-relaxed">
                            I solemnly affirm that this report is based on genuine findings and not meant to harass. Posting false content violates our <span className="text-primary font-bold">Safe Hub Policy</span>.
                        </div>
                    </label>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full bg-[#111418] rounded-t-[2.5rem] shadow-2xl flex flex-col h-[92vh] animate-slide-up border-t border-white/10 overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        {step > 0 && (
                            <button onClick={() => setStep(0)} className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400">
                                <Icon name="arrow_back" size={20} />
                            </button>
                        )}
                        <h2 className="text-lg font-black tracking-tight text-white uppercase">
                            {step === 0 ? "New Report" : selectedCategory?.label}
                        </h2>
                    </div>
                    <button onClick={onClose} className="size-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/5">
                        <Icon name="close" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
                    {step === 0 ? renderCategoryStep() : renderDetailsStep()}
                </div>

                {step > 0 && (
                    <div className="p-6 border-t border-white/10 bg-[#111418] pb-10">
                        <Button 
                            onClick={handleSubmit} 
                            isLoading={isLoading}
                            className={`w-full !h-14 !text-base !rounded-2xl shadow-xl shadow-primary/20 ${!isAccurate ? 'opacity-50' : ''}`}
                            disabled={!entityName || rating === 0 || !isAccurate}
                        >
                            Publish to Community
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};