import React, { useState, useRef, useEffect } from 'react';
import { Curriculum } from '../types';
import { useAppStore } from '../store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const CurriculumView = ({ data, readOnly = false }: { data: Curriculum; readOnly?: boolean }) => {
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Curriculum>(data);
  const { addToast, updateCurriculum, togglePublishStatus } = useAppStore();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing) {
        setEditData(data);
    }
  }, [data, isEditing]);

  const toggleModule = (idx: number) => {
    setExpandedModules(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSave = () => {
    updateCurriculum(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
    addToast("Changes discarded", "info");
  };

  const updateField = (field: keyof Curriculum, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const updateModule = (index: number, field: string, value: string) => {
    setEditData(prev => {
        const newModules = [...prev.modules];
        newModules[index] = { ...newModules[index], [field]: value };
        return { ...prev, modules: newModules };
    });
  };

  const updateLesson = (mIndex: number, lIndex: number, field: string, value: string) => {
    setEditData(prev => {
        const newModules = [...prev.modules];
        const newLessons = [...newModules[mIndex].lessons];
        newLessons[lIndex] = { ...newLessons[lIndex], [field]: value };
        newModules[mIndex] = { ...newModules[mIndex], lessons: newLessons };
        return { ...prev, modules: newModules };
    });
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
        backgroundColor: null, 
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height] // Custom format to fit the whole image
      });

      // Dark background for PDF consistency
      pdf.setFillColor(15, 23, 42); 
      pdf.rect(0, 0, canvas.width, canvas.height, 'F');

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

  const activeData = isEditing ? editData : data;
  const isPublished = data.status === 'Published';

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 relative" data-testid="curriculum-view">
      {/* Action Toolbar */}
      <div className="absolute top-4 right-8 z-10 flex gap-2">
        {isEditing ? (
            <>
                <button 
                  onClick={handleSave}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg border border-emerald-500 transition-colors shadow-lg font-medium text-sm flex items-center gap-2"
                  title="Save Changes"
                >
                  <i className="fa-solid fa-check"></i> Save
                </button>
                <button 
                  onClick={handleCancel}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-300 dark:border-slate-700 transition-colors shadow-lg text-sm font-medium"
                  title="Cancel Editing"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
            </>
        ) : (
            <>  
                {/* Publish Action - Primary Workflow Action (Hidden in ReadOnly mode) */}
                {!readOnly && (
                  <button 
                    onClick={togglePublishStatus}
                    className={`px-3 py-2 rounded-lg border transition-all shadow-lg text-sm font-medium flex items-center gap-2 mr-2 ${
                      isPublished 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-red-500 hover:border-red-500' 
                      : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white border-transparent'
                    }`}
                    title={isPublished ? "Unpublish Course" : "Publish to Catalog"}
                  >
                    {isPublished ? (
                        <>
                          <i className="fa-solid fa-ban"></i> Unpublish
                        </>
                    ) : (
                        <>
                          <i className="fa-solid fa-rocket"></i> Publish
                        </>
                    )}
                  </button>
                )}

                {!readOnly && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-300 dark:border-slate-700 transition-colors shadow-lg"
                    title="Edit Curriculum"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                )}

                <button 
                  onClick={handleCopy}
                  className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-300 dark:border-slate-700 transition-colors shadow-lg"
                  title="Copy JSON to Clipboard"
                >
                  <i className="fa-regular fa-copy"></i>
                </button>
                <button 
                  onClick={handleDownloadJson}
                  className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-300 dark:border-slate-700 transition-colors shadow-lg"
                  title="Download JSON"
                >
                  <i className="fa-solid fa-file-code"></i>
                </button>
                <button 
                  onClick={handleExportPdf}
                  className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-300 dark:border-slate-700 transition-colors shadow-lg"
                  title="Export PDF"
                >
                  <i className="fa-solid fa-file-pdf"></i>
                </button>
            </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar" ref={printRef}>
        <div className="mb-8 pr-40"> {/* pr-40 to avoid overlap with toolbar */}
          <div className="flex items-center gap-3 mb-2">
            {/* Status Badge */}
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                activeData.status === 'Published' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400'
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeData.status === 'Published' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                {activeData.status || 'Draft'}
            </span>

            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              activeData.difficultyLevel === 'Advanced' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
              activeData.difficultyLevel === 'Intermediate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              {activeData.difficultyLevel}
            </span>
            {isEditing ? (
                 <input 
                    value={activeData.estimatedTotalDuration}
                    onChange={(e) => updateField('estimatedTotalDuration', e.target.value)}
                    className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 outline-none w-32"
                 />
            ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <i className="fa-regular fa-clock"></i> {activeData.estimatedTotalDuration}
                </span>
            )}
          </div>
          
          {isEditing ? (
              <div className="space-y-3">
                  <input 
                    value={activeData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="text-3xl font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <textarea 
                    value={activeData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 w-full focus:ring-2 focus:ring-primary-500 outline-none resize-none h-20"
                  />
              </div>
          ) : (
              <>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{activeData.title}</h1>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm max-w-2xl">{activeData.description}</p>
              </>
          )}
        </div>

        <div className="space-y-4">
          {activeData.modules.map((module, mIdx) => (
            <div key={mIdx} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm dark:shadow-none">
              <div 
                onClick={() => !isEditing && toggleModule(mIdx)}
                className={`flex items-start justify-between p-4 ${!isEditing ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800' : ''} transition-colors`}
              >
                <div className="flex gap-4 w-full">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 font-bold shrink-0">
                    <span className="text-xs uppercase text-slate-500">Mod</span>
                    <span className="text-lg text-slate-700 dark:text-white">{mIdx + 1}</span>
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                        <div className="space-y-2 mb-2">
                             <input 
                                value={module.title}
                                onChange={(e) => updateModule(mIdx, 'title', e.target.value)}
                                className="text-base font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                                onClick={(e) => e.stopPropagation()}
                             />
                             <input 
                                value={module.description}
                                onChange={(e) => updateModule(mIdx, 'description', e.target.value)}
                                className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 w-full focus:ring-2 focus:ring-primary-500 outline-none"
                                onClick={(e) => e.stopPropagation()}
                             />
                        </div>
                    ) : (
                        <>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{module.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{module.description}</p>
                        </>
                    )}
                  </div>
                </div>
                {!isEditing && (
                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <i className={`fa-solid fa-chevron-down transition-transform duration-200 ${expandedModules[mIdx] ? 'rotate-180' : ''}`}></i>
                    </button>
                )}
              </div>

              {(expandedModules[mIdx] || isEditing) && (
                <div className="border-t border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30">
                  {module.lessons.map((lesson, lIdx) => (
                    <div key={lIdx} className="p-3 pl-20 border-b border-slate-200 dark:border-slate-700/30 last:border-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1">
                          {isEditing ? (
                              <div className="flex gap-2 flex-1">
                                  <select
                                     value={lesson.type}
                                     onChange={(e) => updateLesson(mIdx, lIdx, 'type', e.target.value)}
                                     className="text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none"
                                  >
                                      <option value="Video">Video</option>
                                      <option value="Text">Text</option>
                                      <option value="Quiz">Quiz</option>
                                      <option value="Assignment">Assignment</option>
                                  </select>
                                  <input 
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(mIdx, lIdx, 'title', e.target.value)}
                                    className="text-sm font-medium text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-primary-500 outline-none"
                                  />
                              </div>
                          ) : (
                              <>
                                <i className={`text-xs w-5 text-center ${
                                    lesson.type === 'Video' ? 'fa-solid fa-play text-indigo-500 dark:text-indigo-400' :
                                    lesson.type === 'Quiz' ? 'fa-solid fa-clipboard-question text-amber-500 dark:text-amber-400' :
                                    lesson.type === 'Assignment' ? 'fa-solid fa-pen-ruler text-emerald-500 dark:text-emerald-400' :
                                    'fa-solid fa-file-lines text-slate-400'
                                }`}></i>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{lesson.title}</span>
                              </>
                          )}
                        </div>
                        {isEditing ? (
                             <input 
                                value={lesson.duration}
                                onChange={(e) => updateLesson(mIdx, lIdx, 'duration', e.target.value)}
                                className="text-xs text-slate-500 font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 w-16 text-right focus:ring-2 focus:ring-primary-500 outline-none ml-2"
                             />
                        ) : (
                            <span className="text-xs text-slate-500 font-mono">{lesson.duration}</span>
                        )}
                      </div>
                      
                      {!isEditing && lesson.objectives && lesson.objectives.length > 0 && (
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