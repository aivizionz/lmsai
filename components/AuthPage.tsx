import React, { useState } from 'react';
import { useAppStore } from '../store';
import { UserRole } from '../types';

export const AuthPage = () => {
  const { login, register } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Left Side: Brand / Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900 overflow-hidden items-center justify-center p-12">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-200/50 dark:bg-primary-900/20 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/50 dark:bg-indigo-900/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/30 mb-8">
            <i className="fa-solid fa-layer-group text-3xl text-white"></i>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Curriculum Architect</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            Design world-class courses, generate rigorous assessments, and adapt content for every learner—powered by Agentic AI.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm dark:shadow-none">
                <i className="fa-solid fa-sitemap text-primary-500 dark:text-primary-400 mb-2 text-xl"></i>
                <h3 className="font-semibold text-slate-900 dark:text-white">Structure Design</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Instantly generate modules & lessons.</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm dark:shadow-none">
                <i className="fa-solid fa-wand-magic-sparkles text-pink-500 dark:text-pink-400 mb-2 text-xl"></i>
                <h3 className="font-semibold text-slate-900 dark:text-white">AI Adaptation</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Personalize for any audience.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
            
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isLogin ? "Welcome back" : "Create an account"}
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    {isLogin ? "Sign in to access your dashboard" : "Join the learning platform"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                
                {!isLogin && (
                    <>
                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                    role === 'student' 
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <i className="fa-solid fa-graduation-cap text-2xl"></i>
                                <span className="font-semibold">I am a Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('coach')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                    role === 'coach' 
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <i className="fa-solid fa-chalkboard-user text-2xl"></i>
                                <span className="font-semibold">I am a Coach</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                            <div className="relative">
                                <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                <input 
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                        <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="name@company.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                        <input 
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
                >
                    {loading ? (
                        <>
                           <i className="fa-solid fa-circle-notch fa-spin"></i>
                           <span>Processing...</span>
                        </>
                    ) : (
                        <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    )}
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-950 text-slate-500">or</span>
                </div>
            </div>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 hover:underline transition-colors"
                >
                    {isLogin ? "Sign up" : "Sign in"}
                </button>
            </p>

            {/* Demo Note */}
            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500 text-center">
                <i className="fa-solid fa-triangle-exclamation mr-1 text-amber-500"></i>
                <span>Prototype Mode: Data is stored in browser LocalStorage. Do not use real passwords.</span>
            </div>
        </div>
      </div>
    </div>
  );
};