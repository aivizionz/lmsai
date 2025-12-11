import React from 'react';
import { useAppStore } from '../store';

export const Header = () => {
  const { mode, sessions, currentSessionId, updateSessionTitle } = useAppStore();
  
  const currentSession = sessions[currentSessionId];
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSessionTitle(currentSessionId, e.target.value);
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 shrink-0">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {mode === 'curriculum' ? 'Curriculum Architect' : 
            mode === 'assessment' ? 'Assessment Designer' : 
            mode === 'adaptive' ? 'Adaptive Learning Agent' :
            'Coach Assistant Agent'}
            </h1>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <input 
                value={currentSession?.title || "Untitled"}
                onChange={handleTitleChange}
                className="bg-transparent text-sm text-slate-600 dark:text-slate-300 focus:text-slate-900 dark:focus:text-white focus:outline-none focus:bg-slate-200 dark:focus:bg-slate-800/50 rounded px-1 min-w-[150px]"
                placeholder="Session Title"
            />
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          {mode === 'curriculum' ? 'Phase 1: Structure Design' : 
           mode === 'assessment' ? 'Phase 2: Grading & Evaluation' :
           mode === 'adaptive' ? 'Phase 3: Personalization & Remediation' :
           'Phase 4: Pedagogical Support'}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className={`px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center gap-2`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${
            mode === 'curriculum' ? 'bg-primary-500' : 
            mode === 'assessment' ? 'bg-emerald-500' :
            mode === 'adaptive' ? 'bg-pink-500' :
            'bg-cyan-500'
          }`}></span>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Agent Active</span>
        </div>
      </div>
    </header>
  );
};