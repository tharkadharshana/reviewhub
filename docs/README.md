# ReviewHub - Documentation

**ReviewHub** is a scalable, community-powered review platform designed to aggregate user experiences across various categories (Ride Sharing, Online Sellers, Spam Calls, etc.) with a focus on ease of use, speed, and reliability.

## 🚀 Quick Start

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Ensure your API keys are set in `services/firebase.ts` and `process.env.API_KEY` (for Gemini AI) is available.

3.  **Run Development Server**
    ```bash
    npm start
    ```

## 📚 Documentation Index

*   [**Architecture.md**](./ARCHITECTURE.md) - Deep dive into the codebase structure, patterns, and data flow.
*   [**Features.md**](./FEATURES.md) - List of functional requirements and capabilities.
*   [**Migration_Guide.md**](./MIGRATION_GUIDE.md) - **Critical:** How to move from Firebase to AWS/Self-Hosted.
*   [**Best_Practices.md**](./BEST_PRACTICES.md) - Coding standards, UI/UX guidelines, and performance tips.
*   [**Troubleshooting.md**](./TROUBLESHOOTING.md) - Error handling and common issues.

## 🛠 Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS (Mobile-First)
*   **Backend (Current):** Firebase (Auth, Firestore)
*   **AI:** Google Gemini API (Flash Preview)
*   **Build Tool:** ESBuild / Webpack (depending on environment)

## 🔑 Key Concepts

*   **Config-Driven UI:** The app forms and categories are generated dynamically from Firestore/JSON configuration.
*   **Repository Pattern:** The UI never talks to Firebase directly; it uses an `api` service abstraction.
*   **Optimistic UI:** Actions like voting and commenting appear instantly before server confirmation.
