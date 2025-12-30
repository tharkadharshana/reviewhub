# Architecture & Design

ReviewHub follows a **Service-Oriented Architecture (SOA)** on the frontend, specifically utilizing the **Repository Pattern** to decouple the User Interface from the backend data source.

## 1. Directory Structure

```text
/src
  ├── components/    # Atomic UI components (Buttons, Icons, Cards)
  ├── context/       # Global State (Auth, Theme, Navigation)
  ├── pages/         # View Controllers (Home, Profile, Details)
  ├── services/      # The API Layer (The most important folder for migration)
  ├── types.ts       # TypeScript Interfaces (The Contract)
  └── App.tsx        # Main Router
```

## 2. The Repository Pattern (`services/api.ts`)

This is the core architectural decision. We defined a strict interface `ApiService` in `types.ts`.

*   **The Contract:** `types.ts` defines *what* the app needs (e.g., `reviews.getAll()`, `auth.login()`).
*   **The Implementation:** `services/api.ts` fulfills this contract using Firebase SDKs.
*   **The Consumer:** React components (`Home.tsx`) call `api.reviews.getAll()`. They do **not** know Firebase exists.

This allows us to swap the backend without touching a single UI component.

## 3. Data Flow & State Management

1.  **Global Context (`Store.tsx`):**
    *   Holds "Session" state (Current User, Theme, Toast Notifications).
    *   Holds "Config" state (Categories, Tags).
    *   Does *not* hold heavy data (like the feed) to prevent unnecessary re-renders.

2.  **Local State:**
    *   Pages (e.g., `Home.tsx`) manage their own data fetching and loading states.

3.  **Configuration Caching:**
    *   **Source:** Firestore collection `reviewhub_config`.
    *   **Mechanism:** On app load, we check `localStorage` for a cached config.
    *   **Expiration:** Cache is valid for 1 hour.
    *   **Fallback:** If Firestore fails, falls back to `services/reviewConfig.ts` (Hardcoded JSON).

## 4. Search Architecture

To avoid expensive 3rd-party search services (like Algolia) for the MVP:

1.  **Write Time:** When a review is created, we generate a `keywords` array (tokenized strings) in the document.
2.  **Read Time:** We use Firestore's `array-contains` query to match these tokens.
3.  **Result:** Fast, cheap, "good enough" search for entity names.

## 5. Performance Optimization

*   **Client-Side Filtering:** To avoid the "Explosion of Indexes" problem in NoSQL, we fetch the latest 100 reviews sorted by time, then filter by Category/Risk Level in memory (JavaScript). This drastically reduces database complexity.
*   **Component Reuse:** Shared components (`ReviewCard`, `Header`) ensure consistent rendering performance.
