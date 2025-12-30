import React, { useState } from 'react';
import { useApp } from '../context/Store';
import { api } from '../services/api';
import { Icon, Header, Button } from '../components/Shared';

export const Verify = () => {
    const { navigate, showToast } = useApp();
    const [step, setStep] = useState(1); // 1: Input, 2: OTP
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async () => {
        if (phone.length < 10) return showToast("Invalid phone number", "error");
        setIsLoading(true);
        try {
            await api.auth.sendOtp(phone);
            setStep(2);
            showToast("OTP sent!", "success");
        } catch(e) {
            showToast("Failed to send OTP", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            await api.auth.verifyOtp(phone, otp);
            showToast("Verification Successful!", "success");
            setTimeout(() => navigate('PROFILE'), 1000);
        } catch(e) {
            showToast("Invalid code", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark">
             <Header showBack onBack={() => navigate('PROFILE')} title="Verification" />

             <div className="flex-1 flex flex-col p-6 items-center">
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 mt-8 animate-fade-in">
                    <Icon name={step === 1 ? "phonelink_lock" : "lock"} className="text-primary" size={40} />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                    {step === 1 ? "Verify Phone Number" : "Enter Code"}
                </h2>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm max-w-[280px] mb-8 leading-relaxed">
                    {step === 1 
                        ? "To prevent spam and verify ownership, we need to verify your phone number." 
                        : `We sent a 6-digit code to ${phone}. Enter it below.`}
                </p>

                <div className="w-full space-y-6 max-w-sm">
                    {step === 1 ? (
                        <div className="animate-slide-up">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Icon name="call" size={20} />
                                </div>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl h-14 pl-12 pr-4 text-lg font-medium shadow-sm focus:ring-2 focus:ring-primary/50 transition-all" 
                                    placeholder="(555) 000-0000"
                                />
                            </div>
                            <Button className="w-full mt-6" onClick={handleSendOtp} isLoading={isLoading}>
                                Send Code
                            </Button>
                        </div>
                    ) : (
                        <div className="animate-slide-up">
                            <div className="flex justify-between gap-2 mb-6">
                                {[0,1,2,3,4,5].map((i) => (
                                    <div key={i} className="w-12 h-14 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl font-bold">
                                        {otp[i] || ''}
                                    </div>
                                ))}
                            </div>
                            <input 
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="opacity-0 absolute inset-0 h-full w-full cursor-default"
                                autoFocus
                            />
                             <Button className="w-full" onClick={handleVerify} isLoading={isLoading}>
                                Verify Code
                            </Button>
                            <button onClick={() => setStep(1)} className="w-full py-4 text-sm text-gray-500 font-medium hover:text-primary">
                                Change Phone Number
                            </button>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};