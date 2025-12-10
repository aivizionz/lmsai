
export interface Lesson {
  title: string;
  duration: string;
  type: "Video" | "Text" | "Quiz" | "Assignment";
  objectives: string[];
}

export interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Curriculum {
  title: string;
  description: string;
  targetAudience: string;
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  estimatedTotalDuration: string;
  modules: Module[];
}

export interface AssessmentQuestion {
  id: number;
  text: string;
  type: "Multiple Choice" | "Short Answer";
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface RubricItem {
  criteria: string;
  description: string;
  maxPoints: number;
}

export interface Assessment {
  id: string;
  title: string;
  targetContext: string; // e.g., "Module 1: Introduction"
  type: "Quiz" | "Assignment";
  questions?: AssessmentQuestion[];
  rubric?: RubricItem[];
  totalPoints: number;
}

export interface Message {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: Date;
  feedback?: "up" | "down";
}

export type Mode = "curriculum" | "assessment" | "adaptive" | "coach";

export interface Session {
  id: string;
  title: string;
  lastModified: Date;
  mode: Mode;
  curriculum: Curriculum | null;
  assessments: Assessment[];
  messages: Record<Mode, Message[]>;
}

export type Theme = 'light' | 'dark' | 'system';
export type ColorPalette = 'indigo' | 'purple' | 'green' | 'blue' | 'minimalist';
export type Size = 'small' | 'medium' | 'large';

export interface UserSettings {
  theme: Theme;
  primaryColor: ColorPalette;
  fontSize: Size;
  iconSize: Size;
  sidebarCollapsed: boolean;
  layoutSpacing: 'compact' | 'comfortable';
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Password is not stored in the state object for security best practices, even in mocks
}
