import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Mode, Message, Curriculum, Assessment, Session, UserSettings, User } from "./types";
import { 
  CURRICULUM_PROMPT, CURRICULUM_SCHEMA, 
  ASSESSMENT_PROMPT, ASSESSMENT_SCHEMA, 
  ADAPTIVE_PROMPT, COACH_PROMPT 
} from "./ai-config";

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface AppState {
  // Auth
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;

  // Session Management
  sessions: Record<string, Session>;
  currentSessionId: string;
  createSession: () => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  updateSessionTitle: (id: string, title: string) => void;
  isHistoryOpen: boolean;
  setHistoryOpen: (open: boolean) => void;

  // Settings
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  // Active Session State
  mode: Mode;
  setMode: (m: Mode) => void;
  curriculum: Curriculum | null;
  assessments: Assessment[];
  messages: Record<Mode, Message[]>;
  submitFeedback: (messageId: string, rating: "up" | "down") => void;
  
  // UI State
  isTyping: boolean;
  sendMessage: (text: string) => Promise<void>;
  resetState: () => void; // Clears ALL data
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  cancelGeneration: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const INITIAL_MESSAGES: Record<Mode, Message[]> = {
  curriculum: [{
    id: 'welcome-c',
    role: 'model',
    text: "Hello! I am your Curriculum Architect. \n\nTell me about the course topic you want to teach, and I will design a structured blueprint for you.",
    timestamp: new Date()
  }],
  assessment: [{
    id: 'welcome-a',
    role: 'model',
    text: "I am the Assessment Designer. \n\nOnce you have a curriculum, I can create quizzes and assignments for specific modules. Just ask!",
    timestamp: new Date()
  }],
  adaptive: [{
    id: 'welcome-ad',
    role: 'model',
    text: "I am your Adaptive Learning Specialist. \n\nDoes the current curriculum need adjustment? Tell me your learning style (e.g., Visual, Auditory) or constraints (e.g., 'Make it 1 week long'), and I will personalize the path.",
    timestamp: new Date()
  }],
  coach: [{
    id: 'welcome-co',
    role: 'model',
    text: "I am your Coach Assistant. \n\nI can explain complex concepts, suggest teaching strategies, or draft lesson content for you. What do you need help with.",
    timestamp: new Date()
  }]
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  primaryColor: 'indigo',
  fontSize: 'medium',
  iconSize: 'medium',
  sidebarCollapsed: false,
  layoutSpacing: 'comfortable'
};

const COLOR_PALETTES: Record<string, Record<string, string>> = {
  indigo: {
    50: '238 242 255', 100: '224 231 255', 200: '199 210 254', 300: '165 180 252',
    400: '129 140 248', 500: '99 102 241', 600: '79 70 229', 700: '67 56 202',
    800: '55 48 163', 900: '49 46 129'
  },
  purple: {
    50: '250 245 255', 100: '243 232 255', 200: '233 213 255', 300: '216 180 254',
    400: '192 132 252', 500: '168 85 247', 600: '147 51 234', 700: '126 34 206',
    800: '107 33 168', 900: '88 28 135'
  },
  blue: {
    50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 300: '147 197 253',
    400: '96 165 250', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216',
    800: '30 64 175', 900: '30 58 138'
  },
  green: {
    50: '240 253 244', 100: '220 252 231', 200: '187 247 208', 300: '134 239 172',
    400: '74 222 128', 500: '34 197 94', 600: '22 163 74', 700: '21 128 61',
    800: '22 101 52', 900: '20 83 45'
  },
  minimalist: {
    50: '248 250 252', 100: '241 245 249', 200: '226 232 240', 300: '203 213 225',
    400: '148 163 184', 500: '100 116 139', 600: '71 85 105', 700: '51 65 85',
    800: '30 41 59', 900: '15 23 42'
  }
};

const STORAGE_KEY = 'curriculum_architect_v2'; 
const SETTINGS_KEY = 'curriculum_architect_settings';
const AUTH_KEY = 'curriculum_architect_users';
const CURRENT_USER_KEY = 'curriculum_architect_current_user';

const createNewSessionData = (id: string): Session => ({
  id,
  title: "Untitled Course",
  lastModified: new Date(),
  mode: 'curriculum',
  curriculum: null,
  assessments: [],
  messages: JSON.parse(JSON.stringify(INITIAL_MESSAGES), (k, v) => k === 'timestamp' ? new Date(v) : v)
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // --- State Initialization ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Record<string, Session>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  
  // Active Session State
  const [mode, setMode] = useState<Mode>('curriculum');
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [messages, setMessages] = useState<Record<Mode, Message[]>>(INITIAL_MESSAGES);
  
  const [isTyping, setIsTyping] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- Hydration ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load Auth
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      // Load Sessions
      const saved = localStorage.getItem(STORAGE_KEY);
      let initialSessions: Record<string, Session> = {};
      let initialId = "";

      if (saved) {
        const parsed = JSON.parse(saved, (key, value) => {
          if (key === 'timestamp' || key === 'lastModified') return new Date(value);
          return value;
        });
        initialSessions = parsed.sessions || {};
        initialId = parsed.currentSessionId || "";
      }

      if (Object.keys(initialSessions).length === 0) {
        const newId = Date.now().toString();
        initialSessions = { [newId]: createNewSessionData(newId) };
        initialId = newId;
      }

      setSessions(initialSessions);
      setCurrentSessionId(initialId);
      
      const current = initialSessions[initialId];
      if (current) {
        setMode(current.mode);
        setCurriculum(current.curriculum);
        setAssessments(current.assessments);
        setMessages(current.messages);
      }

      // Load Settings
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }

    } catch (err) {
      console.error("Storage Load Error:", err);
    }
  }, []);

  // --- Settings Effect ---
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.indigo;
    Object.entries(palette).forEach(([shade, value]) => {
      root.style.setProperty(`--color-primary-${shade}`, value);
    });

    body.classList.remove('text-scale-small', 'text-scale-medium', 'text-scale-large');
    body.classList.add(`text-scale-${settings.fontSize}`);

  }, [settings]);

  // --- Persistence ---
  useEffect(() => {
    if (!currentSessionId) return;

    setSessions(prev => {
      const currentSession = prev[currentSessionId];
      if (!currentSession) return prev;

      let title = currentSession.title;
      if (curriculum?.title && (title === "Untitled Course" || title === "Migrated Session")) {
        title = curriculum.title;
      }

      const updatedSession: Session = {
        ...currentSession,
        mode,
        curriculum,
        assessments,
        messages,
        title,
        lastModified: new Date()
      };

      const newSessions = { ...prev, [currentSessionId]: updatedSession };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessions: newSessions,
        currentSessionId
      }));

      return newSessions;
    });
  }, [mode, curriculum, assessments, messages, currentSessionId]); 

  // --- Auth Actions ---
  const login = async (email: string, pass: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const usersStr = localStorage.getItem(AUTH_KEY);
            const users = usersStr ? JSON.parse(usersStr) : [];
            const user = users.find((u: any) => u.email === email && u.password === pass); // NOTE: In production, assume backend validation
            
            if (user) {
                const safeUser = { id: user.id, name: user.name, email: user.email };
                setCurrentUser(safeUser);
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
                addToast(`Welcome back, ${safeUser.name}`, 'success');
                resolve(true);
            } else {
                addToast("Invalid email or password", 'error');
                resolve(false);
            }
        }, 800); // Simulate network delay
    });
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const usersStr = localStorage.getItem(AUTH_KEY);
            const users = usersStr ? JSON.parse(usersStr) : [];
            
            if (users.find((u: any) => u.email === email)) {
                addToast("Email already exists", 'error');
                resolve(false);
                return;
            }

            const newUser = { id: Date.now().toString(), name, email, password: pass }; // NOTE: Insecure password storage for demo only
            users.push(newUser);
            localStorage.setItem(AUTH_KEY, JSON.stringify(users));
            
            const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email };
            setCurrentUser(safeUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
            
            addToast("Account created successfully", 'success');
            resolve(true);
        }, 800);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    addToast("Logged out successfully", 'info');
  };

  // --- Session Actions ---

  const createSession = () => {
    const newId = Date.now().toString();
    const newSession = createNewSessionData(newId);
    
    setSessions(prev => ({ ...prev, [newId]: newSession }));
    setCurrentSessionId(newId);
    
    setMode('curriculum');
    setCurriculum(null);
    setAssessments([]);
    setMessages(JSON.parse(JSON.stringify(INITIAL_MESSAGES), (k, v) => k === 'timestamp' ? new Date(v) : v));
    
    setHistoryOpen(false);
    addToast("New session created", "info");
  };

  const switchSession = (id: string) => {
    const target = sessions[id];
    if (!target) return;

    setCurrentSessionId(id);
    setMode(target.mode);
    setCurriculum(target.curriculum);
    setAssessments(target.assessments);
    setMessages(target.messages);
    
    setHistoryOpen(false);
    addToast(`Switched to "${target.title}"`, "info");
  };

  const deleteSession = (id: string) => {
    const newSessions = { ...sessions };
    delete newSessions[id];
    
    if (id === currentSessionId) {
      const remainingIds = Object.keys(newSessions);
      if (remainingIds.length > 0) {
        const recentId = remainingIds.sort((a, b) => 
          newSessions[b].lastModified.getTime() - newSessions[a].lastModified.getTime()
        )[0];
        
        setSessions(newSessions);
        switchSession(recentId); 
        
        const target = newSessions[recentId];
        setCurrentSessionId(recentId);
        setMode(target.mode);
        setCurriculum(target.curriculum);
        setAssessments(target.assessments);
        setMessages(target.messages);
      } else {
        const newId = Date.now().toString();
        const newSession = createNewSessionData(newId);
        setSessions({ [newId]: newSession });
        setCurrentSessionId(newId);
        setMode('curriculum');
        setCurriculum(null);
        setAssessments([]);
        setMessages(JSON.parse(JSON.stringify(INITIAL_MESSAGES), (k, v) => k === 'timestamp' ? new Date(v) : v));
      }
    } else {
      setSessions(newSessions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessions: newSessions,
        currentSessionId
      }));
    }
  };

  const updateSessionTitle = (id: string, title: string) => {
    setSessions(prev => ({
      ...prev,
      [id]: { ...prev[id], title }
    }));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const submitFeedback = (messageId: string, rating: "up" | "down") => {
    setMessages(prev => {
      const currentModeList = prev[mode];
      const updatedList = currentModeList.map(msg => 
        msg.id === messageId ? { ...msg, feedback: rating } : msg
      );
      return { ...prev, [mode]: updatedList };
    });
    addToast(rating === 'up' ? "Thanks for the positive feedback!" : "Feedback received. We'll improve.", "info");
  };

  // --- Helper Actions ---

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const resetState = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    window.location.reload();
  };

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
      addToast("Generation cancelled by user.", 'info');
    }
  };

  const addMessage = (m: Mode, msg: Message) => {
    setMessages(prev => ({
      ...prev,
      [m]: [...prev[m], msg]
    }));
  };

  const sendMessage = async (inputText: string) => {
    if (!inputText.trim()) return;

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };
    addMessage(mode, userMsg);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      if (mode === 'coach') {
        const responseId = (Date.now() + 1).toString();
        addMessage('coach', { id: responseId, role: 'model', text: "", timestamp: new Date() });

        const prompt = `Current Curriculum Context: ${JSON.stringify(curriculum)}\nUser Question: "${inputText}"\nProvide a helpful response in markdown.`;

        const streamResult = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { systemInstruction: COACH_PROMPT, temperature: 0.5 }
        });

        for await (const chunk of streamResult) {
          if (abortControllerRef.current?.signal.aborted) break;
          const chunkText = (chunk as GenerateContentResponse).text;
          if (chunkText) {
            setMessages(prev => {
              const currentList = [...prev.coach];
              const lastMsg = { ...currentList[currentList.length - 1], text: currentList[currentList.length - 1].text + chunkText };
              currentList[currentList.length - 1] = lastMsg;
              return { ...prev, coach: currentList };
            });
          }
        }

      } else if (mode === 'curriculum') {
        const prompt = curriculum 
          ? `Current Curriculum JSON:\n${JSON.stringify(curriculum)}\n\nUser Request: ${inputText}\n\nUpdate and return FULL JSON.`
          : `${inputText}\n\nCreate a new curriculum. Return FULL JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: CURRICULUM_PROMPT,
            responseMimeType: "application/json",
            responseSchema: CURRICULUM_SCHEMA,
            temperature: 0.2,
          }
        });

        if (abortControllerRef.current?.signal.aborted) return;

        if (response.text) {
          const data = JSON.parse(response.text) as Curriculum;
          setCurriculum(data);
          addMessage('curriculum', {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: curriculum ? "I've updated the curriculum blueprint." : `I've designed a curriculum for "${data.title}".`,
            timestamp: new Date()
          });
          if (!curriculum) updateSessionTitle(currentSessionId, data.title);
          addToast("Curriculum updated successfully", "success");
        }

      } else if (mode === 'assessment') {
        if (!curriculum) {
            addMessage('assessment', {
                id: Date.now().toString(),
                role: 'model',
                text: "I need a curriculum to work with before I can create assessments. Please generate one in Phase 1.",
                timestamp: new Date()
            });
            setIsTyping(false);
            return;
        }
        const prompt = `Current Curriculum: ${JSON.stringify(curriculum)}\nUser Request: "${inputText}"\nGenerate assessment JSON.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: ASSESSMENT_PROMPT,
            responseMimeType: "application/json",
            responseSchema: ASSESSMENT_SCHEMA,
            temperature: 0.4,
          }
        });

        if (abortControllerRef.current?.signal.aborted) return;

        if (response.text) {
          const data = JSON.parse(response.text) as Assessment;
          data.id = Date.now().toString();
          setAssessments(prev => [data, ...prev]);
          addMessage('assessment', {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: `I've created a ${data.type} for "${data.targetContext}".`,
            timestamp: new Date()
          });
          addToast("Assessment generated", "success");
        }
      } else if (mode === 'adaptive') {
         if (!curriculum) {
             addMessage('adaptive', {
                id: Date.now().toString(),
                role: 'model',
                text: "I cannot adapt a curriculum that doesn't exist yet. Please create one in Phase 1.",
                timestamp: new Date()
             });
             setIsTyping(false);
             return;
         }
         const prompt = `Current Curriculum: ${JSON.stringify(curriculum)}\nRequest: "${inputText}"\nAdapt and return FULL JSON.`;

         const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: ADAPTIVE_PROMPT,
            responseMimeType: "application/json",
            responseSchema: CURRICULUM_SCHEMA,
            temperature: 0.3,
          }
        });
        
        if (abortControllerRef.current?.signal.aborted) return;
        
        if (response.text) {
           const data = JSON.parse(response.text) as Curriculum;
           setCurriculum(data);
           addMessage('adaptive', {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "Curriculum adapted successfully.",
            timestamp: new Date()
           });
           addToast("Curriculum adapted", "success");
        }
      }

    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) return;
      console.error("Agent Error:", error);
      const errText = error instanceof Error ? error.message : "Unknown error";
      addMessage(mode, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: mode === 'coach' ? "Sorry, I encountered an error." : `Error: ${errText}`,
        timestamp: new Date()
      });
      addToast(`Error: ${errText}`, "error");
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <AppContext.Provider value={{ 
      sessions, currentSessionId, createSession, switchSession, deleteSession, updateSessionTitle,
      isHistoryOpen, setHistoryOpen,
      settings, updateSettings, isSettingsOpen, setSettingsOpen,
      mode, setMode, curriculum, assessments, messages, isTyping, 
      sendMessage, resetState, 
      toasts, addToast, removeToast, cancelGeneration, submitFeedback,
      currentUser, login, register, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within an AppProvider');
  return context;
};
