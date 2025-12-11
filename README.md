# Curriculum Architect - AI-Powered Learning Management System

**Curriculum Architect** is an enterprise-grade, Agentic AI application designed to revolutionize the course creation process. It leverages Google's Gemini models to assist educators in structuring curricula, generating rigorous assessments, adapting content for diverse learner needs, and providing pedagogical coaching.

The platform supports a dual-role ecosystem:
1.  **Coaches (Creators):** Use AI agents to build and publish courses.
2.  **Students (Learners):** Access a catalog of published content in a read-only learning environment.

---

## 🏗 System Architecture

The application is built as a **Single Page Application (SPA)** using React 19 and TypeScript. It utilizes a client-side architecture where the frontend interacts directly with the Google GenAI SDK, ensuring low latency and immediate feedback.

### Technology Stack

*   **Core Framework:** React 19, TypeScript
*   **AI Engine:** Google Gemini API (`@google/genai`)
*   **Styling:** Tailwind CSS (Utility-first), FontAwesome (Icons)
*   **State Management:** React Context API + Hooks
*   **Persistence:** Browser LocalStorage (Simulating a NoSQL document store)
*   **Testing:** Vitest, React Testing Library
*   **Build Tooling:** ESBuild (via CDN/Environment)

### High-Level Data Flow

1.  **User Interaction:** User inputs prompts via the `ChatPanel`.
2.  **Context Construction:** The app aggregates current state (e.g., existing curriculum JSON) and system instructions.
3.  **AI Processing:** A request is sent to the Gemini Model (e.g., `gemini-3-pro-preview`).
4.  **Structured Output:** The AI returns structured JSON (for Curriculum/Assessments) or Markdown (for Coaching).
5.  **State Hydration:** The React Store parses the response, updates the internal state, and renders the specific View Component (`CurriculumView`, `AssessmentView`).
6.  **Persistence:** Changes are automatically synced to LocalStorage.

---

## 🧩 Component Overview

### Core Logic
*   **`store.tsx`**: The brain of the application. It handles authentication, session management, global state (Curriculum, Assessments), and interfaces with the AI SDK.
*   **`ai-config.ts`**: Contains the System Instructions (Prompts) and JSON Schemas used to enforce strict output formatting from the LLM.

### User Interface
*   **`AuthPage.tsx`**: Handles user registration and login, including role selection (Student vs. Coach).
*   **`ChatPanel.tsx`**: The primary conversational interface. It supports Markdown rendering, starter prompts, and feedback mechanisms.
*   **`CurriculumView.tsx`**: A hierarchical editor for Modules and Lessons. Supports "Edit Mode" and "Read-Only Mode" depending on the user role.
*   **`AssessmentView.tsx`**: Renders generated quizzes and assignments, including grading rubrics.
*   **`Sidebar.tsx`**: Provides navigation between the four AI Agents (Curriculum, Assessment, Adaptive, Coach).

---

## 🚀 Getting Started

### Prerequisites

*   **Node.js**: Version 18.0 or higher.
*   **API Key**: A valid Google Cloud Project API Key with access to Generative Language API (Gemini).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/curriculum-architect.git
    cd curriculum-architect
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

The application requires an API Key to function. You can set this via environment variables.

1.  Create a `.env` file in the root directory (if supported by your build tool) or export it in your shell.
    ```bash
    export GOOGLE_API_KEY="your_api_key_here"
    ```
    *Note: The application falls back to `process.env.API_KEY` if `GOOGLE_API_KEY` is not present.*

### Running Locally

Start the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 🛡 Roles & Permissions

| Feature | Coach | Student |
| :--- | :---: | :---: |
| **Create Sessions** | ✅ | ❌ |
| **Chat with AI Agents** | ✅ | ❌ |
| **Edit Curriculum** | ✅ | ❌ |
| **Generate Assessments** | ✅ | ❌ |
| **Publish/Unpublish** | ✅ | ❌ |
| **View Catalog** | ❌ (View Drafts) | ✅ |
| **Read-Only Mode** | ❌ | ✅ |

---

## 🔒 Security Note

This application is a **frontend-only prototype**.
*   **Data Persistence:** All data is stored in your browser's `localStorage`. Clearing cache will delete your courses.
*   **API Key:** In a production environment, API calls should be proxied through a backend to keep the API Key secret. Do not expose your private keys in client-side code in public repositories.
