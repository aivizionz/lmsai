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
import { UserRole } from "./types";

// --- Coach Layout (Original) ---
const CoachLayout = () => {
  const { mode, curriculum, assessments, settings } = useAppStore();

  return (
    <div className="flex flex-row h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden relative">
      <Sidebar />
      <SessionHistory />
      <SettingsModal />

      <div className="flex flex-col flex-1 h-full min-w-0 transition-all duration-300">
        <Header />
        
        <main className={`flex-1 flex overflow-hidden relative ${settings.layoutSpacing === 'compact' ? 'gap-0' : 'gap-0'}`}>
          <ChatPanel />

          <div className="flex-1 bg-slate-50 dark:bg-slate-950 relative min-w-0">
            {mode === 'curriculum' || mode === 'adaptive' || mode === 'coach'
              ? (curriculum ? <CurriculumView data={curriculum} /> : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400 dark:text-slate-500" data-testid="curriculum-empty-state">
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <i className="fa-regular fa-compass text-2xl text-slate-500 dark:text-slate-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Curriculum Generated</h3>
                    <p className="max-w-xs text-sm">Start by describing your course topic in the chat.</p>
                  </div>
                ))
              : <AssessmentView assessments={assessments} curriculum={curriculum} />
            }
            
            {((mode === 'curriculum' && !curriculum) || (mode === 'assessment' && !assessments.length) || (mode === 'adaptive' && !curriculum) || (mode === 'coach' && !curriculum)) && (
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-200/40 dark:from-primary-900/40 via-transparent to-transparent"></div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Student Layout (New) ---
const StudentLayout = () => {
    const { currentUser, logout, publishedCourses, viewingCourse, openCourse } = useAppStore();

    if (viewingCourse) {
        return (
            <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
                <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
                   <div className="flex items-center gap-4">
                      <button 
                         onClick={() => openCourse(null)}
                         className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                         <i className="fa-solid fa-arrow-left"></i>
                      </button>
                      <h1 className="text-xl font-bold">{viewingCourse.title}</h1>
                   </div>
                   <div className="text-sm text-slate-500 dark:text-slate-400">
                      <i className="fa-solid fa-graduation-cap mr-2"></i>
                      Learning Mode
                   </div>
                </header>
                <div className="flex-1 overflow-hidden">
                    <CurriculumView data={viewingCourse} readOnly={true} /> 
                    {/* Note: readOnly=true prevents students from editing or unpublishing */}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-y-auto">
            {/* Student Header */}
            <header className="px-8 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                             <i className="fa-solid fa-layer-group text-white text-xl"></i>
                         </div>
                         <h1 className="text-xl font-bold tracking-tight">Student Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Hello, {currentUser?.name}</span>
                        <button 
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Course Catalog */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-8">
                <div className="mb-8">
                   <h2 className="text-3xl font-bold mb-2">Available Courses</h2>
                   <p className="text-slate-500 dark:text-slate-400">Explore published curricula from our expert coaches.</p>
                </div>

                {publishedCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <i className="fa-solid fa-book-open text-3xl text-slate-400"></i>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Courses Available Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md">
                            Your coaches are currently designing new content. Check back later!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {publishedCourses.map((course, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
                                     <div className="absolute inset-0 bg-black/10"></div>
                                     <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/60 to-transparent">
                                         <span className="text-xs font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-1 rounded">
                                            {course.difficultyLevel}
                                         </span>
                                     </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white line-clamp-2">{course.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 flex-1">
                                        {course.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                                        <div className="flex items-center gap-1">
                                            <i className="fa-regular fa-clock"></i>
                                            {course.estimatedTotalDuration}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <i className="fa-solid fa-layer-group"></i>
                                            {course.modules.length} Modules
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => openCourse(course)}
                                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group-hover:gap-3"
                                    >
                                        Start Learning <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

const MainRouter = () => {
  const { currentUser } = useAppStore();

  if (!currentUser) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  // Role Based Routing
  return (
      <>
        {currentUser.role === 'student' ? <StudentLayout /> : <CoachLayout />}
        <ToastContainer />
      </>
  );
};

export const App = () => {
  return (
    <AppProvider children={<MainRouter />} />
  );
};

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(<App />);
}