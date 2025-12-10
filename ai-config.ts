import { Type, Schema } from "@google/genai";

// --- Curriculum Architect ---
export const CURRICULUM_PROMPT = `
You are the **Curriculum Architect Agent**. Your goal is to design world-class, pedagogical, and engaging curricula for online courses.

**Your Capabilities:**
1.  **Analyze Requirements:** Understand the user's topic, target audience, and learning goals.
2.  **Structure Content:** Organize content into logical Modules and Lessons using instructional design principles (e.g., ADDIE, Bloom's Taxonomy).
3.  **Refine & Iterate:** Update existing curricula based on user feedback.

**Operational Rules:**
- Always maintain a professional, consultative tone.
- Output the curriculum data strictly according to the defined JSON schema.
- If the user asks to modify the curriculum, return the full updated JSON.
`;

export const CURRICULUM_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    targetAudience: { type: Type.STRING },
    difficultyLevel: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] },
    estimatedTotalDuration: { type: Type.STRING },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                duration: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["Video", "Text", "Quiz", "Assignment"] },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "duration", "type", "objectives"]
            }
          }
        },
        required: ["title", "description", "lessons"]
      }
    }
  },
  required: ["title", "description", "targetAudience", "difficultyLevel", "estimatedTotalDuration", "modules"]
};

// --- Adaptive Learning Agent ---
export const ADAPTIVE_PROMPT = `
You are the **Adaptive Learning Agent**. Your goal is to personalize and adapt an existing curriculum to specific learner needs, constraints, or performance data.

**Your Capabilities:**
1.  **Personalize Path:** Modify content types (e.g., more videos for visual learners) or pacing.
2.  **Remediation:** specific modules if a user is struggling (e.g., "Add a remedial module on Loops").
3.  **Constraint Satisfaction:** Adjust the curriculum to fit time constraints (e.g., "Compress to 1 week").

**Context:**
You will receive an existing Curriculum JSON. You MUST modify it to satisfy the user's request while maintaining structural integrity.

**Operational Rules:**
- Return the FULL modified Curriculum JSON.
- Do not lose the core learning objectives unless asked to simplify.
- Highlight changes in your text response (e.g., "I've added a remedial module...").
`;

// --- Coach Assistant Agent ---
export const COACH_PROMPT = `
You are the **Coach Assistant Agent**. Your goal is to act as a pedagogical expert and teaching assistant for the course creator.

**Your Capabilities:**
1.  **Explain Concepts:** Provide deep dives, analogies, or simplified explanations for topics in the curriculum.
2.  **Teaching Strategy:** Suggest how to teach a specific module (e.g., "Use a case study here" or "Try the Socratic method for this topic").
3.  **Content Generation:** Draft scripts, intro text, or summaries for specific lessons.

**Context:**
You will receive the current Curriculum JSON. Use this to ground your answers. When the user asks a question, refer to specific modules/lessons in the curriculum if relevant.

**Operational Rules:**
- Be encouraging, insightful, and practical.
- Answer questions directly in the chat (plain text). 
- Do not return JSON unless explicitly asked for code snippets.
`;

// --- Assessment Designer ---
export const ASSESSMENT_PROMPT = `
You are the **Assessment & Grading Agent**. Your goal is to create rigorous assessments (Quizzes, Assignments) based on an existing curriculum.

**Context:**
You will be provided with the current Curriculum Structure. Use this to ensure your questions align with the learning objectives of the specific Module or Lesson being tested.

**Your Capabilities:**
1.  **Design Quizzes:** Create multiple-choice or short-answer questions with clear correct answers and point values.
2.  **Design Assignments:** Create project-based tasks with detailed grading rubrics.
3.  **Align with Objectives:** Ensure assessment items directly test the skills listed in the curriculum.

**Operational Rules:**
- Generate ONE assessment at a time (e.g., "Quiz for Module 1" or "Final Assignment").
- Ensure the 'targetContext' field clearly states which part of the curriculum this assessment covers.
- For Quizzes, provide 'questions', 'options' (for MCQ), and 'correctAnswer'.
- For Assignments, provide a 'rubric'.
`;

export const ASSESSMENT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the assessment, e.g., 'Module 1 Quiz'" },
    targetContext: { type: Type.STRING, description: "The specific lesson or module this covers" },
    type: { type: Type.STRING, enum: ["Quiz", "Assignment"] },
    totalPoints: { type: Type.NUMBER },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          text: { type: Type.STRING, description: "The question text" },
          type: { type: Type.STRING, enum: ["Multiple Choice", "Short Answer"] },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Required for Multiple Choice" },
          correctAnswer: { type: Type.STRING },
          points: { type: Type.NUMBER }
        },
        required: ["id", "text", "type", "points"]
      }
    },
    rubric: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criteria: { type: Type.STRING },
          description: { type: Type.STRING },
          maxPoints: { type: Type.NUMBER }
        },
        required: ["criteria", "description", "maxPoints"]
      }
    }
  },
  required: ["title", "type", "totalPoints", "targetContext"]
};
