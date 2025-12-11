# Testing Strategy & LLM Evaluation

This document outlines the testing protocols for the Curriculum Architect application. We employ a multi-layered testing strategy that includes standard unit/integration tests and a specialized **LLM Evaluation Framework** to ensure the reliability of AI-generated content.

---

## 🛠 Testing Stack

*   **Test Runner:** [Vitest](https://vitest.dev/) (Fast, Jest-compatible)
*   **DOM Testing:** [React Testing Library](https://testing-library.com/)
*   **Mocks:** Built-in Vitest mocking for `@google/genai`.

---

## 🧪 Test Categories

### 1. Unit & Integration Tests
Located in `tests/*.test.tsx`. These tests ensure the UI components and State logic function correctly.

*   **Component Rendering:** Verifies that critical UI elements (Chat, Sidebar, Views) render based on state.
*   **State Management:** Tests the transitions between phases (Curriculum -> Assessment).
*   **Mocked AI Calls:** We mock the `GoogleGenAI` SDK to test application logic without incurring API costs or latency.
*   **Role-Based Logic:** Ensures Students cannot access Coach-only features.

### 2. LLM Evaluation (Agentic QA)
Located in `tests/LLMEvaluation.test.tsx` and `tests/eval-framework.ts`.

Because AI output is non-deterministic, we cannot use simple string equality assertions. Instead, we use an **"LLM-as-a-Judge"** approach.

#### The Evaluation Framework (`eval-framework.ts`)

We define `BaseMetric` classes that evaluate specific quality aspects:

*   **`JsonComplianceMetric` (Syntactic Correctness):**
    *   **Goal:** Ensure the AI outputs valid JSON that matches our schema.
    *   **Method:** Attempts to parse the output and checks for required keys.
    *   **Pass Criteria:** `JSON.parse()` succeeds and returns an object.

*   **`RelevancyMetric` (Semantic Correctness):**
    *   **Goal:** Ensure the AI's response actually answers the user's prompt.
    *   **Method:** Sends the *User Prompt* and the *AI Output* to a separate "Judge" LLM instance. The Judge analyzes the relationship and returns a score (0.0 - 1.0).
    *   **Pass Criteria:** Score > 0.7.

---

## 🏃‍♂️ How to Run Tests

### Prerequisites
Ensure dependencies are installed:
```bash
npm install
```

### Running the Suite

To run all tests (Unit, Integration, and Eval):

```bash
npm test
```

To run tests in watch mode (re-runs on file save):

```bash
npx vitest
```

### Configuration for LLM Evals
The LLM Evaluation tests (`LLMEvaluation.test.tsx`) may attempt to make real API calls to the Judge LLM if not mocked.

If you wish to run **Live Evaluations** (actually calling the API for the Judge):
1.  Ensure your `GOOGLE_API_KEY` is set in your environment.
2.  Adjust the mocks in `tests/LLMEvaluation.test.tsx` to allow pass-through, or use a separate integration test config.

*Currently, the provided tests use mocks to ensure deterministic passing in CI/CD environments.*

---

## 📂 Test File Structure

| File | Purpose |
| :--- | :--- |
| `tests/CurriculumArchitect.test.tsx` | Tests Phase 1 (Curriculum Generation) UI flow. |
| `tests/AssessmentDesigner.test.tsx` | Tests Phase 2 (Quiz Generation) and dependency on Curriculum. |
| `tests/AdaptiveLearning.test.tsx` | Tests Phase 3 (Content Adaptation) logic. |
| `tests/CoachAssistant.test.tsx` | Tests Phase 4 (Chat Streaming) logic. |
| `tests/Integration.test.tsx` | End-to-end flows, error handling, and state persistence. |
| `tests/LLMEvaluation.test.tsx` | Execution of the Quality Assurance metrics. |
| `tests/eval-framework.ts` | Classes defining the grading logic for AI outputs. |
| `tests/test-data.ts` | Static JSON objects used for mocking responses. |
