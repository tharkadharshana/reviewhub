import React, { useEffect, useState } from 'react';
import { useApp } from '../context/Store';
import { Header, Skeleton } from '../components/Shared';
import { LEGAL_CONTENT, LEGAL_TITLES } from '../services/legalContent';

interface LegalDocsProps {
    docId: string;
    onBack?: () => void;
}

export const LegalDocs: React.FC<LegalDocsProps> = ({ docId, onBack }) => {
    const { navigate } = useApp();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const handleBack = onBack || (() => navigate('LOGIN'));

    useEffect(() => {
        setLoading(true);
        // Simulate async fetching for smoothness, though data is local now
        setTimeout(() => {
            const text = (LEGAL_CONTENT as any)[docId] || "Document not found.";
            setContent(text);
            setLoading(false);
        }, 300);
    }, [docId]);

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-slide-up absolute inset-0 z-50">
            <Header title={LEGAL_TITLES[docId] || 'Legal'} showBack onBack={handleBack} />
            
            <main className="flex-1 px-6 py-6 overflow-y-auto">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ) : (
                    <article className="prose dark:prose-invert prose-sm max-w-none pb-10">
                        <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                            {content}
                        </div>
                    </article>
                )}
            </main>
        </div>
    );
};