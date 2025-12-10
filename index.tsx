import React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider, useAppStore } from "./store";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ChatPanel } from "./components/ChatPanel";
import { CurriculumView } from "./components/CurriculumView";
import { AssessmentView } from "./components/AssessmentView";
import { ToastContainer } from "./components/Toast";
import { SessionHistory } from "./components/SessionHistory";
import { SettingsModal } from "./components/SettingsModal";
import { AuthPage } from "./components/AuthPage";

const Layout = () => {
  const { mode, curriculum, assessments, settings, currentUser } = useAppStore();

  if (!currentUser) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex flex-row h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden relative">
      <Sidebar />
      <SessionHistory />
      <SettingsModal />

      <div className="flex flex-col flex-1 h-full min-w-0 transition-all duration-300">
        <Header />
        
        <main className={`flex-1 flex overflow-hidden relative ${settings.layoutSpacing === 'compact' ? 'gap-0' : 'gap-0'}`}>
          <ChatPanel />

          <div className="flex-1 bg-slate-950 relative min-w-0">
            {mode === 'curriculum' || mode === 'adaptive' || mode === 'coach'
              ? (curriculum ? <CurriculumView data={curriculum} /> : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500" data-testid="curriculum-empty-state">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                      <i className="fa-regular fa-compass text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No Curriculum Generated</h3>
                    <p className="max-w-xs text-sm">Start by describing your course topic in the chat.</p>
                  </div>
                ))
              : <AssessmentView assessments={assessments} curriculum={curriculum} />
            }
            
            {((mode === 'curriculum' && !curriculum) || (mode === 'assessment' && !assessments.length) || (mode === 'adaptive' && !curriculum) || (mode === 'coach' && !curriculum)) && (
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/40 via-slate-950 to-slate-950"></div>
            )}
          </div>

          <ToastContainer />
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
};

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<App />);
}
