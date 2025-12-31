# Preventing Fake/False Reviews: Specific Implementations

Fake reviews undermine trust. ReviewHub implements a multi-layered system to combat this:

## 1. Verification and Eligibility Rules
- **Reviewer Verification**: Users must verify their email/phone to post.
- **Ownership-Linked Restrictions**: Reviews on specific entities (like verified businesses) carry more weight when the user has a transaction history.
- **Affirmation**: Users are required to check a "Good Faith" declaration before submitting.

## 2. Detection Technologies
- **AI Analysis**: We use machine learning to detect sentiment anomalies, duplicate text, and bot-like patterns.
- **Community Reporting**: A "Flag as Fake" button allows the community to signal suspicious content for investigation.

## 3. Incentives for Genuine Content
- **Rewards**: Verified, helpful content is boosted in the feed.
- **Penalties**: Repeat offenders are banned. Profiles engaging in "review bombing" are shadow-banned.

## 4. Post-Submission Moderation
- **Voting Thresholds**: Reviews with excessive downvotes or reports are automatically hidden pending review.
- **Audits**: Periodic checks using third-party tools to identify clusters of fake activity.