# Application Features

## 1. Authentication
*   **Email/Password Login:** Powered by Firebase Auth.
*   **Mock Phone Verification:** UI flow for OTP verification (backend ready).
*   **Anonymous Browsing:** Users can read reviews without an account.

## 2. Review Management
*   **Dynamic Categories:** Supports Ride Share, Online Sellers, Spam Calls, Business, etc. Each category has specific fields defined in `reviewhub_config`.
*   **Scam Reporting:** Dedicated flow for flagging phone numbers and fraudulent sellers.
*   **Rating System:** 1-5 Star rating with context-aware tags (e.g., "Safe Driving" vs "Late Delivery").
*   **Evidence:** Support for image URLs (Mocked for now, ready for Storage integration).

## 3. Feed & Discovery
*   **Trending Feed:** Chronological feed of latest reviews.
*   **Filtering:** Filter by category (High Risk, Business, Ride Share, etc.).
*   **Smart Search:** Search by Entity Name, Phone Number, or content keywords.

## 4. Interaction
*   **Voting:** Upvote/Downvote reviews.
*   **Commenting:** Threaded discussions on reviews.
*   **Social Share:** (UI Placeholder) for sharing reviews.

## 5. Profile & Reputation
*   **User Stats:** Track number of reviews, votes received, and impact score.
*   **Verification:** Badge system for verified phone numbers/identities.
*   **History:** "My Reviews" section to manage past submissions.

## 6. AI Integration
*   **Toxicity Checking:** The system analyzes review text to prevent toxic or harmful content from being posted.
*   **Global Search:** AI-powered search to investigate entities (phone numbers, businesses) for scams or reputation issues using Google Search grounding.
