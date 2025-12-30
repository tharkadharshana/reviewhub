import React, { useEffect, useState } from 'react';
import { useApp } from '../context/Store';
import { Header, Skeleton } from '../components/Shared';
import { LEGAL_TITLES } from '../services/legalContent';

export const LegalDocs = ({ docId }: { docId: string }) => {
    const { navigate } = useApp();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating async load of markdown file
        // In a real app with bundler, we might import/fetch the .md file
        // Here we map the ID to the hardcoded text for the MVP
        setLoading(true);
        
        // This simulates fetching the markdown content from the /docs folder structure
        // Since we can't easily fetch local files in this environment, we use a mapping logic
        // or a placeholder if the content service isn't fully linked to the file system.
        
        // For the purpose of this demo, we will render specific text based on ID
        // In production this would be: fetch(`/docs/${docId}.md`).then(res => res.text())
        
        let text = "";
        switch(docId) {
            case 'TERMS': text = "ReviewHub Terms and Conditions..."; break;
            case 'PRIVACY': text = "ReviewHub Privacy Policy..."; break;
            case 'COMMUNITY': text = "Community Guidelines..."; break;
            default: text = "Document not found.";
        }
        
        // Simulating network delay for realism
        setTimeout(() => {
            // In a real implementation, this would come from the Markdown files provided in /docs
            // We are falling back to a generic message pointing to the file for this specific preview
            // as we cannot effectively serve the static MD files without a server config change.
            setContent(`Please refer to the file docs/${docId}.md for the full legal text.\n\n(In a production environment, the Markdown content would be rendered here.)`);
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