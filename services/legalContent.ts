export const LEGAL_CONTENT = {
    TERMS: `... (Terms content matching docs/TERMS.md for UI rendering) ...\n[Full content available in docs/TERMS.md]`,
    PRIVACY: `... (Privacy content matching docs/PRIVACY.md for UI rendering) ...\n[Full content available in docs/PRIVACY.md]`,
    COMMUNITY: `... (Community content matching docs/COMMUNITY_GUIDELINES.md for UI rendering) ...\n[Full content available in docs/COMMUNITY_GUIDELINES.md]`,
    DMCA: `... (DMCA content matching docs/DMCA.md for UI rendering) ...`,
    DISCLAIMER: `... (Disclaimer content matching docs/DISCLAIMER.md for UI rendering) ...`,
    COOKIE: `... (Cookie content matching docs/COOKIE_POLICY.md for UI rendering) ...`
};

// Map ViewState data ID to readable titles
export const LEGAL_TITLES: Record<string, string> = {
    'TERMS': 'Terms & Conditions',
    'PRIVACY': 'Privacy Policy',
    'COMMUNITY': 'Community Guidelines',
    'DMCA': 'DMCA Policy',
    'DISCLAIMER': 'Disclaimer',
    'COOKIE': 'Cookie Policy'
};