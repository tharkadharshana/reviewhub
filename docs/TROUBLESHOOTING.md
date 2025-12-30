# Troubleshooting & Error Handling

## Common Issues

### 1. "The query requires an index" (Firebase)
*   **Cause:** Firestore requires a composite index when sorting by one field (`timestamp`) and filtering by another (`entityType`).
*   **Fix:** We have implemented **Client-Side Filtering** in `services/api.ts` to bypass this requirement for the MVP.
*   **Long Term:** If moving to production with millions of records, create the index via the link provided in the console error log.

### 2. AI Analysis Failed
*   **Cause:** The Gemini API key is missing or quota exceeded.
*   **Fix:** Check `process.env.API_KEY`. If running locally, ensure your `.env` file is set up. The app handles this gracefully by returning a default message.

### 3. Config Not Updating
*   **Cause:** The configuration is cached in `localStorage` for 1 hour.
*   **Fix:** Clear your browser's Local Storage or wait for the cache to expire.

## Error Handling Strategy

### Global Toasts
We use a centralized Toast system in `Store.tsx`.
*   **Usage:** `showToast("Message", "error")`
*   **Behavior:** Auto-dismisses after 3 seconds. Stacks vertically.

### API Failures
All API calls in `services/api.ts` are wrapped in `try/catch` blocks.
*   **Read Operations:** Return empty arrays `[]` or default values on failure to prevent UI crashes.
*   **Write Operations:** Throw errors so the UI can notify the user (e.g., "Failed to submit review").

### Auth State
The app listens to `onAuthStateChanged`. If the user session invalidates, the `currentUser` becomes `null`, and the UI automatically adjusts (e.g., hiding the "Write Review" button).
