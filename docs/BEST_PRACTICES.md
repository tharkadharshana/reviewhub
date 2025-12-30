# Best Practices & Standards

## 1. Code Quality

*   **Strict Typing:** Always define interfaces in `types.ts`. Avoid `any` wherever possible.
*   **Service Abstraction:** Never import `firebase` in a React component (`.tsx`). Always use `useApp()` or `api`.
*   **Modular Components:** If a component exceeds 200 lines, break it down (e.g., separate `ReviewCard` from `Home`).

## 2. Scalability & Database

*   **Read Optimization:** We prioritize minimizing reads.
    *   *Config:* Cached in LocalStorage.
    *   *Feed:* Fetched in batches (limit 50-100).
*   **Write Optimization:**
    *   *Search:* Tokens are generated *on write*. This moves the computational cost to the rare event (writing) rather than the frequent event (searching).
*   **Client-Side Filtering:** For datasets under 1000 items (per batch), use `Array.filter` on the client instead of complex database queries. This reduces the need for composite indexes.

## 3. UI/UX Guidelines

*   **Mobile First:** Design for 375px width first, then scale up.
*   **Touch Targets:** Buttons must be at least 44px height for mobile tappability.
*   **Optimistic Updates:** When a user clicks "Like", update the UI count immediately (`setLikes(prev + 1)`), *then* call the API. If the API fails, revert the state and show a Toast error.
*   **Dark Mode:** All colors must have a `dark:` variant. Use semantic color names (`bg-surface-dark`) instead of hardcoded hex codes where possible.
*   **Skeleton Loading:** Never show a blank screen. Use `<Skeleton />` components during data fetching.

## 4. Security

*   **Inputs:** All user inputs (Review text, names) are treated as untrusted. (Note: Sanitization happens on the backend/API layer, but UI handles display safely).
*   **Environment Variables:** API Keys (Gemini, Firebase Config) must be loaded via `process.env`.
*   **Auth Gates:** Protected routes (Profile, Write Review) must check `currentUser` before rendering or executing actions.
