import React from 'react';
import { useAppStore } from '../store';

export const Sidebar = () => {
  const { mode, setMode, setHistoryOpen, createSession, setSettingsOpen, settings, currentUser, logout } = useAppStore();
  
  const iconSizeClass = settings.iconSize === 'small' ? 'text-base' : settings.iconSize === 'large' ? 'text-xl' : 'text-lg';
  const buttonSizeClass = settings.iconSize === 'small' ? 'w-8 h-8' : settings.iconSize === 'large' ? 'w-12 h-12' : 'w-10 h-10';
  const widthClass = settings.sidebarCollapsed ? 'w-14' : 'w-16'; 
  
  return (
    <div className={`${widthClass} bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6 z-20 h-full justify-between shrink-0 transition-all duration-300`}>
      <div className="flex flex-col items-center gap-6">
        <div 
          className={`${buttonSizeClass} rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-2 cursor-pointer hover:opacity-90 transition-opacity`}
          onClick={() => setHistoryOpen(true)}
          title="Open History"
        >
          <i className={`fa-solid fa-shapes text-white ${iconSizeClass}`}></i>
        </div>

        {/* New Session Button */}
        <button
           onClick={createSession}
           className={`${buttonSizeClass} rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all mb-2 border border-transparent hover:border-slate-700`}
           title="New Session"
        >
          <i className={`fa-solid fa-plus ${iconSizeClass}`}></i>
        </button>
        
        <div className="w-8 h-[1px] bg-slate-800"></div>
        
        <button 
          onClick={() => setMode('curriculum')}
          className={`${buttonSizeClass} rounded-xl flex items-center justify-center transition-all duration-200 group relative ${mode === 'curriculum' ? 'bg-slate-800 text-primary-400' : 'text-slate-500 hover:text-primary-400 hover:bg-slate-800/50'}`}
          title="Curriculum Architect"
          data-testid="nav-curriculum"
        >
          <i className={`fa-solid fa-sitemap ${iconSizeClass}`}></i>
          {mode === 'curriculum' && <div className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full"></div>}
        </button>
        
        <button 
          onClick={() => setMode('assessment')}
          className={`${buttonSizeClass} rounded-xl flex items-center justify-center transition-all duration-200 group relative ${mode === 'assessment' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800/50'}`}
          title="Assessment Designer"
          data-testid="nav-assessment"
        >
          <i className={`fa-solid fa-clipboard-check ${iconSizeClass}`}></i>
          {mode === 'assessment' && <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"></div>}
        </button>

        <button 
          onClick={() => setMode('adaptive')}
          className={`${buttonSizeClass} rounded-xl flex items-center justify-center transition-all duration-200 group relative ${mode === 'adaptive' ? 'bg-slate-800 text-pink-400' : 'text-slate-500 hover:text-pink-400 hover:bg-slate-800/50'}`}
          title="Adaptive Learning Agent"
          data-testid="nav-adaptive"
        >
          <i className={`fa-solid fa-wand-magic-sparkles ${iconSizeClass}`}></i>
          {mode === 'adaptive' && <div className="absolute left-0 w-1 h-6 bg-pink-500 rounded-r-full"></div>}
        </button>

        <button 
          onClick={() => setMode('coach')}
          className={`${buttonSizeClass} rounded-xl flex items-center justify-center transition-all duration-200 group relative ${mode === 'coach' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800/50'}`}
          title="Coach Assistant"
          data-testid="nav-coach"
        >
          <i className={`fa-solid fa-user-graduate ${iconSizeClass}`}></i>
          {mode === 'coach' && <div className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-r-full"></div>}
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
         <button
            onClick={() => setSettingsOpen(true)}
            className={`${buttonSizeClass} rounded-xl flex items-center justify-center text-slate-500 hover:text-primary-400 hover:bg-slate-800/50 transition-colors`}
            title="Settings"
        >
            <i className={`fa-solid fa-gear ${iconSizeClass}`}></i>
        </button>
        
        {/* User Profile / Logout */}
        <div className="group relative">
           <button
              onClick={logout}
              className={`${buttonSizeClass} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-red-500/50 transition-colors`}
              title="Logout"
          >
              <span className="text-xs font-bold">{currentUser?.name?.charAt(0) || 'U'}</span>
              
              {/* Hover Logout Icon overlay */}
              <div className="absolute inset-0 bg-red-500/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <i className="fa-solid fa-arrow-right-from-bracket text-[10px] text-white"></i>
              </div>
          </button>
        </div>
      </div>
    </div>
  );
};
