import React, { useEffect, useState } from 'react';
import { useApp } from '../context/Store';
import { Header, Skeleton } from '../components/Shared';
import { LEGAL_TITLES } from '../services/legalContent';

export const LegalDocs = ({ docId }: { docId: string }) => {
    const { navigate } = useApp();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        
        // Simulating async load. In production, this fetches MD files.
        setTimeout(() => {
            setContent(`Please refer to the file docs/${docId}.md for the full text.\n\n(In a production environment, the Markdown content would be rendered here.)`);
            setLoading(false);
        }, 300);
        
    }, [docId]);

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark animate-slide-up absolute inset-0 z-50">
            <Header title={LEGAL_TITLES[docId] || 'Legal'} showBack onBack={() => navigate('LOGIN')} />
            
            <main className="flex-1 px-6 py-6 overflow-y-auto">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ) : (
                    <article className="prose dark:prose-invert prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                            {content}
                        </p>
                    </article>
                )}
            </main>
        </div>
    );
};