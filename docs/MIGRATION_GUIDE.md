# Migration Guide: Firebase to AWS/Self-Hosted

ReviewHub is "Vendor-Lock-In Resistant". Follow this guide to migrate your backend to AWS EC2, DigitalOcean, or any other provider.

## Prerequisite

You must have a backend API running (Node.js/Express, Python/Django, Go, etc.) that exposes REST or GraphQL endpoints matching our data structure.

## The Strategy

We only need to modify **one file**: `services/api.ts`.

## Step-by-Step

### 1. Setup your new Backend
Ensure your new server has endpoints that correspond to the `ApiService` interface in `types.ts`.

*   `POST /auth/login`
*   `GET /config`
*   `GET /reviews`
*   `POST /reviews`
*   `POST /reviews/:id/vote`

### 2. Update `services/api.ts`

Delete the Firebase imports and replace the object methods with `fetch` calls.

**Before (Firebase):**
```typescript
import { collection, getDocs } from 'firebase/firestore';

export const api: ApiService = {
    reviews: {
        getAll: async (filter) => {
             const q = query(collection(db, "reviewhub"), ...);
             return (await getDocs(q)).docs.map(...);
        }
    }
}
```

**After (AWS/REST):**
```typescript
const BASE_URL = "https://api.your-aws-ec2-instance.com/v1";

export const api: ApiService = {
    reviews: {
        getAll: async (filter) => {
             const res = await fetch(`${BASE_URL}/reviews?filter=${filter}`);
             return await res.json();
        }
    }
}
```

### 3. Migrate Authentication

1.  **Option A (Custom Auth):** If you built your own JWT auth on EC2, update `api.auth.login` to store the JWT in `localStorage` and send it in the headers of subsequent requests.
2.  **Option B (Cognito/Auth0):** If using AWS Cognito, install the AWS Amplify SDK and replace the Firebase Auth functions in `api.auth` with Amplify functions.

### 4. Migrate Data

Write a script (Node.js or Python) to:
1.  Read all documents from Firestore.
2.  Transform the data (if your new DB schema differs).
3.  Insert into your new SQL/NoSQL database.

### 5. Config Migration

Ensure your new backend serves the JSON configuration found in `docs/review_categories.json` at the `/config` endpoint. This maintains dynamic app behavior.
