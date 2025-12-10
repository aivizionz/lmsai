import React, { useState, useRef } from 'react';
import { Curriculum } from '../types';
import { useAppStore } from '../store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const CurriculumView = ({ data }: { data: Curriculum }) => {
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const { addToast } = useAppStore();
  const printRef = useRef<HTMLDivElement>(null);

  const toggleModule = (idx: number) => {
    setExpandedModules(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    addToast("Curriculum JSON copied to clipboard", "success");
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `curriculum-${data.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Download started", "success");
  };

  const handleExportPdf = async () => {
    if (!printRef.current) return;
    addToast("Generating PDF... this may take a moment", "info");
    
    try {
      // Temporarily expand all modules for the PDF
      const currentExpanded = { ...expandedModules };
      const allExpanded: Record<number, boolean> = {};
      data.modules.forEach((_, i) => allExpanded[i] = true);
      setExpandedModules(allExpanded);

      // Wait for React to render expanded state
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(printRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#0f172a', // Match bg
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] // Custom format to fit the whole image
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`curriculum-${data.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      // Restore state
      setExpandedModules(currentExpanded);
      addToast("PDF exported successfully", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to generate PDF", "error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative" data-testid="curriculum-view">
      {/* Action Toolbar */}
      <div className="absolute top-4 right-8 z-10 flex gap-2">
        <button 
          onClick={handleCopy}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors shadow-lg"
          title="Copy JSON to Clipboard"
        >
          <i className="fa-regular fa-copy"></i>
        </button>
        <button 
          onClick={handleDownloadJson}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors shadow-lg"
          title="Download JSON"
        >
          <i className="fa-solid fa-file-code"></i>
        </button>
        <button 
          onClick={handleExportPdf}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors shadow-lg"
          title="Export PDF"
        >
          <i className="fa-solid fa-file-pdf"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar" ref={printRef}>
        <div className="mb-8 pr-20"> {/* pr-20 to avoid overlap with toolbar */}
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              data.difficultyLevel === 'Advanced' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              data.difficultyLevel === 'Intermediate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {data.difficultyLevel}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <i className="fa-regular fa-clock"></i> {data.estimatedTotalDuration}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{data.title}</h1>
          <p className="text-slate-400 leading-relaxed text-sm max-w-2xl">{data.description}</p>
        </div>

        <div className="space-y-4">
          {data.modules.map((module, mIdx) => (
            <div key={mIdx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-600">
              <div 
                onClick={() => toggleModule(mIdx)}
                className="flex items-start justify-between p-4 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-bold shrink-0">
                    <span className="text-xs uppercase text-slate-500">Mod</span>
                    <span className="text-lg text-white">{mIdx + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-1">{module.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-1">{module.description}</p>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors">
                  <i className={`fa-solid fa-chevron-down transition-transform duration-200 ${expandedModules[mIdx] ? 'rotate-180' : ''}`}></i>
                </button>
              </div>

              {expandedModules[mIdx] && (
                <div className="border-t border-slate-700/50 bg-slate-900/30">
                  {module.lessons.map((lesson, lIdx) => (
                    <div key={lIdx} className="p-3 pl-20 border-b border-slate-700/30 last:border-0 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <i className={`text-xs w-5 text-center ${
                            lesson.type === 'Video' ? 'fa-solid fa-play text-indigo-400' :
                            lesson.type === 'Quiz' ? 'fa-solid fa-clipboard-question text-amber-400' :
                            lesson.type === 'Assignment' ? 'fa-solid fa-pen-ruler text-emerald-400' :
                            'fa-solid fa-file-lines text-slate-400'
                          }`}></i>
                          <span className="text-sm font-medium text-slate-200">{lesson.title}</span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{lesson.duration}</span>
                      </div>
                      {lesson.objectives && lesson.objectives.length > 0 && (
                        <div className="pl-7 mt-1">
                          <ul className="list-disc list-outside ml-4 space-y-0.5">
                              {lesson.objectives.map((obj, oIdx) => (
                                <li key={oIdx} className="text-[11px] text-slate-500">{obj}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
