import React from 'react';
import { useAppStore } from '../store';

export const SessionHistory = () => {
  const { 
    sessions, currentSessionId, switchSession, deleteSession, createSession, 
    isHistoryOpen, setHistoryOpen 
  } = useAppStore();

  if (!isHistoryOpen) return null;

  // Sort sessions by lastModified descending
  const sortedSessions = Object.values(sessions).sort((a, b) => 
    b.lastModified.getTime() - a.lastModified.getTime()
  );

  return (
    <div className="absolute inset-0 z-30 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setHistoryOpen(false)}
      ></div>

      {/* Drawer */}
      <div className="relative w-80 h-full bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <h2 className="font-semibold text-white">Session History</h2>
          <button 
            onClick={() => setHistoryOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={createSession}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-900/20 font-medium"
          >
            <i className="fa-solid fa-plus"></i>
            <span>New Session</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          {sortedSessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => switchSession(session.id)}
              className={`
                group flex flex-col p-3 rounded-lg border transition-all cursor-pointer relative
                ${session.id === currentSessionId 
                  ? 'bg-slate-800 border-primary-500/50 shadow-md' 
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                }
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm font-medium line-clamp-1 pr-6 ${session.id === currentSessionId ? 'text-white' : 'text-slate-300'}`}>
                  {session.title}
                </h3>
              </div>
              
              <div className="flex justify-between items-center text-xs text-slate-500">
                 <span>{session.lastModified.toLocaleDateString()}</span>
                 <span>{session.mode}</span>
              </div>

              {/* Delete Button (visible on hover or active) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete session "${session.title}"?`)) {
                    deleteSession(session.id);
                  }
                }}
                className={`absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1`}
                title="Delete Session"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
