import React, { useRef } from 'react';
import { Assessment, Curriculum } from '../types';
import { useAppStore } from '../store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const AssessmentView = ({ assessments, curriculum }: { assessments: Assessment[], curriculum: Curriculum | null }) => {
  const { addToast } = useAppStore();
  const printRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(assessments, null, 2));
    addToast("Assessments copied to clipboard", "success");
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(assessments, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `assessments-library.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Download started", "success");
  };

  const handleExportPdf = async () => {
    if (!printRef.current) return;
    addToast("Generating PDF... this may take a moment", "info");
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] 
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`assessment-library.pdf`);
      
      addToast("PDF exported successfully", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to generate PDF", "error");
    }
  };

  if (!assessments.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500" data-testid="assessment-empty-state">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <i className="fa-solid fa-clipboard-question text-2xl"></i>
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Assessments Created</h3>
        <p className="max-w-xs text-sm">
          {curriculum 
            ? "Ask the agent to create a quiz or assignment for a specific module." 
            : "Please design a curriculum in Phase 1 first."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 relative" data-testid="assessment-library">
       {/* Action Toolbar */}
       <div className="absolute top-4 right-8 z-10 flex gap-2">
        <button 
          onClick={handleCopy}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors shadow-lg"
          title="Copy Library to Clipboard"
        >
          <i className="fa-regular fa-copy"></i>
        </button>
        <button 
          onClick={handleDownloadJson}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors shadow-lg"
          title="Download Library JSON"
        >
          <i className="fa-solid fa-file-code"></i>
        </button>
        <button 
          onClick={handleExportPdf}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors shadow-lg"
          title="Export Library PDF"
        >
          <i className="fa-solid fa-file-pdf"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6" ref={printRef}>
         <div className="mb-4 pr-20">
          <h2 className="text-2xl font-bold text-white">Assessment Library</h2>
          <p className="text-sm text-slate-400">Generated Quizzes and Assignments</p>
         </div>

         {assessments.map((assessment, idx) => (
           <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden" data-testid={`assessment-card-${idx}`}>
             <div className="p-4 border-b border-slate-700/50 flex justify-between items-start bg-slate-800/50">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                     assessment.type === 'Quiz' 
                       ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                       : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                   }`}>
                     {assessment.type}
                   </span>
                   <span className="text-xs text-slate-500">
                      <i className="fa-solid fa-bullseye mr-1"></i>
                      {assessment.totalPoints} pts
                   </span>
                 </div>
                 <h3 className="text-lg font-semibold text-white">{assessment.title}</h3>
                 <p className="text-sm text-slate-400 mt-1">
                   <i className="fa-solid fa-link mr-1"></i>
                   {assessment.targetContext}
                 </p>
               </div>
             </div>

             <div className="p-4 bg-slate-900/30">
               {assessment.type === 'Quiz' && assessment.questions && (
                 <div className="space-y-4">
                   {assessment.questions.map((q, qIdx) => (
                     <div key={q.id} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                       <div className="flex justify-between gap-2 mb-2">
                         <span className="text-sm font-medium text-slate-200">{qIdx + 1}. {q.text}</span>
                         <span className="text-xs text-slate-500 whitespace-nowrap">({q.points} pts)</span>
                       </div>
                       {q.type === 'Multiple Choice' && q.options && (
                         <div className="grid grid-cols-1 gap-2 pl-4">
                           {q.options.map((opt, oIdx) => (
                             <div key={oIdx} className={`text-xs px-3 py-2 rounded border ${opt === q.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900/50 border-slate-700 text-slate-400'}`}>
                               <span className="font-mono mr-2 opacity-50">{String.fromCharCode(65 + oIdx)}.</span>
                               {opt}
                               {opt === q.correctAnswer && <i className="fa-solid fa-check ml-2"></i>}
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}

               {assessment.type === 'Assignment' && assessment.rubric && (
                 <div className="overflow-hidden rounded-lg border border-slate-700/50">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-800/80 text-xs uppercase text-slate-400">
                       <tr>
                         <th className="px-4 py-2">Criteria</th>
                         <th className="px-4 py-2">Description</th>
                         <th className="px-4 py-2 text-right">Max Pts</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-700/50">
                       {assessment.rubric.map((r, rIdx) => (
                         <tr key={rIdx} className="bg-slate-800/20">
                           <td className="px-4 py-2 font-medium text-indigo-300">{r.criteria}</td>
                           <td className="px-4 py-2 text-slate-400">{r.description}</td>
                           <td className="px-4 py-2 text-right text-slate-300">{r.maxPoints}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};
