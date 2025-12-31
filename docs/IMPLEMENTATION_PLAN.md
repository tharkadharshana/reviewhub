# Implementation Plan: Anonymity & Fake Review Prevention

This document outlines the technical strategy for "verified anonymity" and risk mitigation, tailored for a Firebase/Cloud Run architecture.

## 1. Database Schema Updates (Firestore)

### Users Collection
```json
{
  "uid": "firebase-uid",
  "verified_entities": {
    "phones": ["hashed-phone1"], 
    "emails": ["hashed-email1"]
  },
  "flags": 0,
  "consent_given": true
}
```

### Reviews Collection
```json
{
  "review_id": "auto-id",
  "entity_id": "hashed-identifier",
  "author_uid": "firebase-uid", // Private
  "content": "Review text",
  "verified_badge": true,
  "status": "active", // 'active', 'hidden', 'flagged'
  "ai_toxicity_score": 0.1,
  "votes": { "up": 0, "down": 0 }
}
```

## 2. Backend Logic (Cloud Run / Functions)

### Anonymity Logic
- **Sanitization**: API responses must strip `author_uid` and replace with "Anonymous" or a pseudonym.
- **Verification**: OTP endpoints link hashed phone numbers to user accounts without storing raw numbers in the public user profile.

### Proactive Moderation (Pre-Write)
- **AI Screening**: Before writing to Firestore, the API calls Google Cloud Natural Language (or Gemini).
- **Rule**: If `toxicity > 0.7`, reject the request.

### Fake Review Detection (Triggers)
- **Duplicate Check**: Prevent multiple reviews on the same entity by the same user.
- **Pattern Analysis**: Flag reviews if multiple negative reviews are posted rapidly from the same IP (simulated via headers).

## 3. Frontend Integration

### Verification Flow
- Users verify phone numbers via OTP.
- The UI displays a "Verified Owner" badge if the review is linked to a verified asset.

### Dispute Resolution
- Verified entity owners can "Dispute" a review. This triggers a backend workflow requiring evidence.

### Reporting
- Community-led "Flag as Fake" button feeds into the moderation queue.
