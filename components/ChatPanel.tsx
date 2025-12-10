import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../store';

export const ChatPanel = () => {
  const { mode, messages, isTyping, sendMessage, cancelGeneration, addToast, submitFeedback, settings } = useAppStore();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentMessages = messages[mode];
  
  // Settings-based sizing logic
  const spacingClass = settings.layoutSpacing === 'compact' ? 'space-y-3 p-3' : 'space-y-6 p-4';
  const bubblePadding = settings.layoutSpacing === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isTyping]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  const handleStop = () => {
    cancelGeneration();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("Message copied to clipboard", "info");
  };

  return (
    <div className={`w-[400px] flex flex-col border-r border-slate-800 bg-slate-900/50 shrink-0 ${settings.sidebarCollapsed ? 'w-[450px]' : ''} transition-all duration-300`}>
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${spacingClass}`}>
        {currentMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-end gap-2 max-w-[95%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                 msg.role === 'user' ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-700/50 text-slate-400'
              }`}>
                <i className={`text-[10px] ${msg.role === 'user' ? 'fa-solid fa-user' : 'fa-solid fa-robot'}`}></i>
              </div>

              {/* Bubble */}
              <div 
                className={`relative rounded-2xl text-sm leading-relaxed shadow-sm ${bubblePadding} ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none' 
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                }`}
              >
                {/* Markdown Content */}
                <div className="markdown-body">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                
                {/* Actions Toolbar (Copy & Feedback) */}
                <div className={`absolute -bottom-7 ${msg.role === 'user' ? 'right-0' : 'left-0'} flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                   <button
                    onClick={() => copyToClipboard(msg.text)}
                    className="text-xs text-slate-500 hover:text-white flex items-center gap-1 py-1 px-1 rounded hover:bg-slate-800"
                    title="Copy Text"
                  >
                    <i className="fa-regular fa-copy"></i>
                  </button>
                  
                  {msg.role === 'model' && (
                    <>
                      <button
                        onClick={() => submitFeedback(msg.id, 'up')}
                        className={`text-xs flex items-center gap-1 py-1 px-1 rounded hover:bg-slate-800 ${msg.feedback === 'up' ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
                        title="Helpful"
                      >
                        <i className={`${msg.feedback === 'up' ? 'fa-solid' : 'fa-regular'} fa-thumbs-up`}></i>
                      </button>
                      <button
                        onClick={() => submitFeedback(msg.id, 'down')}
                        className={`text-xs flex items-center gap-1 py-1 px-1 rounded hover:bg-slate-800 ${msg.feedback === 'down' ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                        title="Not Helpful"
                      >
                        <i className={`${msg.feedback === 'down' ? 'fa-solid' : 'fa-regular'} fa-thumbs-down`}></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <span className={`text-[10px] text-slate-600 mt-1 px-10 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}
        
        {isTyping && mode !== 'coach' && (
          <div className="flex items-center gap-2 text-slate-500 text-xs pl-10" data-testid="typing-indicator">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="font-medium text-primary-400">Architecting...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`bg-slate-900 border-t border-slate-800 ${settings.layoutSpacing === 'compact' ? 'p-3' : 'p-4'}`}>
        <div className="relative group">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              mode === 'curriculum' ? "Describe your course topic..." : 
              mode === 'assessment' ? "Request a quiz or assignment..." :
              mode === 'adaptive' ? "e.g., 'I am a visual learner'..." :
              "Ask for an explanation or teaching strategy..."
            }
            disabled={isTyping}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none h-24 disabled:opacity-50 disabled:cursor-wait transition-all shadow-inner"
            data-testid="chat-input"
          />
          {isTyping ? (
            <button
              onClick={handleStop}
              className="absolute right-3 bottom-3 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 hover:border-red-500 rounded-lg transition-all"
              title="Stop Generation"
            >
              <i className="fa-solid fa-stop text-xs"></i>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="absolute right-3 bottom-3 p-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-primary-500/20"
              data-testid="send-button"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          )}
        </div>
        <div className="text-[10px] text-slate-500 text-center mt-2">
          Press <kbd className="font-sans px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">Enter</kbd> to send, <kbd className="font-sans px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};
