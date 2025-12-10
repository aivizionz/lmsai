import React from 'react';
import { useAppStore } from '../store';
import { ColorPalette, Size, Theme } from '../types';

export const SettingsModal = () => {
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings } = useAppStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setSettingsOpen(false)}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                <i className="fa-solid fa-sliders text-white"></i>
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <p className="text-sm text-slate-400">Customize your workspace</p>
            </div>
          </div>
          <button 
            onClick={() => setSettingsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section 1: Appearance (Theme) */}
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Appearance</h3>
            <div className="grid grid-cols-3 gap-4">
               {['light', 'dark', 'system'].map((t) => (
                   <button
                    key={t}
                    onClick={() => updateSettings({ theme: t as Theme })}
                    className={`
                        flex flex-col items-center justify-center p-4 rounded-xl border transition-all
                        ${settings.theme === t 
                            ? 'bg-primary-600/10 border-primary-500 text-white shadow-lg shadow-primary-500/10' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600'
                        }
                    `}
                   >
                       <i className={`text-2xl mb-2 fa-solid ${t === 'light' ? 'fa-sun' : t === 'dark' ? 'fa-moon' : 'fa-laptop'}`}></i>
                       <span className="capitalize font-medium">{t} Default</span>
                   </button>
               ))}
            </div>
          </section>

          {/* Section 2: Color Palette */}
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Color Palette</h3>
            <div className="grid grid-cols-5 gap-3">
                {[
                    { id: 'indigo', label: 'Indigo', color: '#6366f1' },
                    { id: 'purple', label: 'Purple', color: '#a855f7' },
                    { id: 'blue', label: 'Blue', color: '#3b82f6' },
                    { id: 'green', label: 'Green', color: '#22c55e' },
                    { id: 'minimalist', label: 'Minimal', color: '#64748b' },
                ].map((palette) => (
                    <button
                        key={palette.id}
                        onClick={() => updateSettings({ primaryColor: palette.id as ColorPalette })}
                        className={`
                            group relative p-3 rounded-xl border flex flex-col items-center gap-2 transition-all
                            ${settings.primaryColor === palette.id 
                                ? 'bg-slate-800 border-white/20 ring-1 ring-white/20' 
                                : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                            }
                        `}
                    >
                        <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: palette.color }}>
                            {settings.primaryColor === palette.id && (
                                <div className="w-full h-full flex items-center justify-center text-white">
                                    <i className="fa-solid fa-check text-sm"></i>
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-medium text-slate-300">{palette.label}</span>
                    </button>
                ))}
            </div>
          </section>

          {/* Section 3: Typography & Icons */}
          <section>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Font Size */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Font Size</h3>
                    <div className="flex bg-slate-800 p-1 rounded-lg">
                        {(['small', 'medium', 'large'] as Size[]).map((size) => (
                            <button
                                key={size}
                                onClick={() => updateSettings({ fontSize: size })}
                                className={`
                                    flex-1 py-2 text-sm font-medium rounded-md transition-all
                                    ${settings.fontSize === size 
                                        ? 'bg-primary-600 text-white shadow' 
                                        : 'text-slate-400 hover:text-white'
                                    }
                                `}
                            >
                                <span className={size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'}>Aa</span>
                                <span className="ml-2 capitalize hidden sm:inline">{size}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Icon Size */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Icon Size</h3>
                    <div className="flex bg-slate-800 p-1 rounded-lg">
                        {(['small', 'medium', 'large'] as Size[]).map((size) => (
                            <button
                                key={size}
                                onClick={() => updateSettings({ iconSize: size })}
                                className={`
                                    flex-1 py-2 text-sm font-medium rounded-md transition-all
                                    ${settings.iconSize === size 
                                        ? 'bg-primary-600 text-white shadow' 
                                        : 'text-slate-400 hover:text-white'
                                    }
                                `}
                            >
                                <i className={`fa-solid fa-icons ${size === 'small' ? 'text-xs' : size === 'large' ? 'text-lg' : 'text-sm'}`}></i>
                            </button>
                        ))}
                    </div>
                </div>
             </div>
          </section>

          {/* Section 4: Layout */}
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Layout Preferences</h3>
            <div className="space-y-3">
                <div 
                    onClick={() => updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
                             <i className={`fa-solid ${settings.sidebarCollapsed ? 'fa-expand' : 'fa-compress'}`}></i>
                        </div>
                        <div>
                            <p className="font-medium text-white">Collapse Sidebar</p>
                            <p className="text-xs text-slate-400">Maximize horizontal space for content</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.sidebarCollapsed ? 'bg-primary-600' : 'bg-slate-700'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.sidebarCollapsed ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     {['compact', 'comfortable'].map((spacing) => (
                         <button
                            key={spacing}
                            onClick={() => updateSettings({ layoutSpacing: spacing as 'compact' | 'comfortable' })}
                            className={`
                                p-4 rounded-xl border text-left transition-all
                                ${settings.layoutSpacing === spacing 
                                    ? 'bg-primary-600/10 border-primary-500/50 text-primary-200' 
                                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800'
                                }
                            `}
                         >
                            <p className="font-medium capitalize mb-1 text-white">{spacing} Spacing</p>
                            <div className="space-y-1.5 opacity-50">
                                <div className={`h-2 rounded bg-current w-3/4 ${spacing === 'compact' ? 'mb-0.5' : 'mb-2'}`}></div>
                                <div className="h-2 rounded bg-current w-1/2"></div>
                            </div>
                         </button>
                     ))}
                </div>
            </div>
          </section>

        </div>
        
        <div className="p-4 border-t border-slate-800 flex justify-end">
            <button 
                onClick={() => setSettingsOpen(false)}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/20 transition-all"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};
