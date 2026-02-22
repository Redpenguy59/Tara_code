
import React, { useState } from 'react';
import { Application, ApplicationStatus, UserProfile, UserDocument } from '../types';
import { getTranslation, TranslationKeys } from '../services/translationService';
import FormSmartFill from './FormSmartFill';
import WalkingLoader from './WalkingLoader';

interface ApplicationDetailProps {
  application: Application;
  profile: UserProfile;
  vault: UserDocument[];
  onBack: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onUpdateDueDate: (id: string, date: string) => void;
  onToggleDoc: (id: string, doc: string) => void;
  onToggleStep: (id: string, stepId: string) => void;
  onRefreshResources: (id: string) => void;
  onDetailedDocSearch: (id: string) => void;
  onMarkFormSubmitted: (appId: string, formName: string) => void;
  isRefreshing?: boolean;
  language?: string;
}

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ 
  application, 
  profile,
  vault,
  onBack, 
  onToggleDoc,
  onToggleStep,
  onRefreshResources,
  onDetailedDocSearch,
  onMarkFormSubmitted,
  isRefreshing = false,
  language = 'en'
}) => {
  const [activeSmartForm, setActiveSmartForm] = useState<string | null>(null);
  const t = (key: TranslationKeys) => getTranslation(language, key);

  const completedDocsCount = application.completedDocs?.length || 0;
  const totalDocsCount = application.requiredDocs.length;
  
  const completedStepsCount = application.steps?.filter(s => s.isCompleted).length || 0;
  const totalStepsCount = application.steps?.length || 0;

  const totalItems = totalDocsCount + totalStepsCount;
  const completedItems = completedDocsCount + completedStepsCount;
  
  const calculatedProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : application.progress;

  const nextPendingStep = application.steps?.find(s => !s.isCompleted);

  const findInVault = (docName: string) => {
    return vault.find(v => v.name.toLowerCase().includes(docName.toLowerCase()) || docName.toLowerCase().includes(v.name.toLowerCase()));
  };

  const getAdvisoryStyles = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          container: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400',
          icon: 'fa-shield-check text-emerald-500',
          badge: 'bg-emerald-500'
        };
      case 'Medium':
        return {
          container: 'bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800 text-amber-800 dark:text-amber-400',
          icon: 'fa-triangle-exclamation text-amber-500',
          badge: 'bg-amber-500'
        };
      case 'High':
        return {
          container: 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800 text-orange-800 dark:text-orange-400',
          icon: 'fa-circle-exclamation text-orange-500',
          badge: 'bg-orange-500'
        };
      case 'Extreme':
        return {
          container: 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800 text-red-800 dark:text-red-400',
          icon: 'fa-skull-crossbones text-red-500',
          badge: 'bg-red-500'
        };
      default:
        return {
          container: 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-400',
          icon: 'fa-info-circle text-slate-500',
          badge: 'bg-slate-500'
        };
    }
  };

  const advisoryStyle = application.advisory ? getAdvisoryStyles(application.advisory.level) : null;

  return (
    <div className="space-y-8 animate-fadeIn pb-20 max-w-6xl mx-auto">
      {activeSmartForm && (
        <FormSmartFill 
          formName={activeSmartForm} 
          profile={profile} 
          application={application} 
          onClose={() => setActiveSmartForm(null)} 
          language={language}
        />
      )}

      <nav className="flex items-center gap-4 text-slate-400">
        <button onClick={onBack} className="hover:text-forest-green transition-colors flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
          <i className="fas fa-arrow-left"></i> {t('back')}
        </button>
        <span className="opacity-30">/</span>
        <span className="text-slate-600 dark:text-slate-400 font-bold truncate max-w-xs">{application.title}</span>
      </nav>

      {application.isVisaFree && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-5xl animate-bounce">
                🎉
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">Congratulations!</h2>
                <p className="text-xl font-bold opacity-90 max-w-2xl">
                  Based on your citizenship, you don't need to do anything. You can stay in {application.country} visa-free for up to <span className="underline decoration-white/40 underline-offset-8">{application.visaFreeDuration || '90 days'}</span>.
                </p>
              </div>
           </div>
        </div>
      )}

      {application.advisory && advisoryStyle && (
        <div className={`px-8 py-6 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between border shadow-sm animate-slideUp gap-6 ${advisoryStyle.container}`}>
          <div className="flex items-start gap-5">
            <div className="mt-1">
              <i className={`fas ${advisoryStyle.icon} text-3xl`}></i>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-0.5 text-[9px] font-black text-white uppercase tracking-widest rounded-full ${advisoryStyle.badge}`}>
                  Level: {application.advisory.level}
                </span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Intelligence Stream</p>
              </div>
              <p className="text-base font-black leading-tight tracking-tight">{application.advisory.message}</p>
            </div>
          </div>
          {application.advisory.lastUpdated && (
            <div className="text-right flex-shrink-0">
               <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Last Verification</p>
               <p className="text-[11px] font-bold">{new Date(application.advisory.lastUpdated).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-br from-forest-green to-emerald-900 p-10 md:p-14 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="flex items-center gap-10">
              <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-inner border border-white/20 transform -rotate-3">
                {application.country.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-5xl font-black mb-4 tracking-tighter leading-none">{application.title}</h2>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">{application.country}</span>
                  <span className="px-4 py-2 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">{application.type}</span>
                  <span className="px-4 py-2 bg-emerald-500/30 border border-emerald-400/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">{application.status}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Goal Completion</p>
               <div className="flex items-baseline justify-end gap-1">
                 <span className="text-7xl font-black tracking-tighter">{calculatedProgress}</span>
                 <span className="text-2xl font-black opacity-40">%</span>
               </div>
            </div>
          </div>

          <div className="mt-12 w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(52,211,153,0.5)]" 
              style={{width: `${calculatedProgress}%`}}
            ></div>
          </div>
        </div>

        <div className="p-10 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-20">
            
            {!application.isVisaFree && (
              <section>
                <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                      <i className="fas fa-route text-forest-green"></i> Procedural Logic
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Execute steps in order for maximum efficiency</p>
                  </div>
                </div>
                
                <div className="relative pl-12 space-y-4">
                  {/* Improved Dynamic Timeline Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-[3px] bg-slate-100 dark:bg-slate-700/50 rounded-full">
                    <div 
                      className="bg-forest-green transition-all duration-1000 rounded-full" 
                      style={{ 
                        height: `${(completedStepsCount / (totalStepsCount || 1)) * 100}%`,
                        maxHeight: '100%'
                      }}
                    ></div>
                  </div>

                  {isRefreshing ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] ml-[-3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                      <WalkingLoader size="lg" showText />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Analyzing Requirements...</p>
                    </div>
                  ) : application.steps && application.steps.length > 0 ? (
                    application.steps.map((step, idx) => {
                      const isNextAction = nextPendingStep?.id === step.id;
                      
                      return (
                        <div 
                          key={step.id || idx} 
                          className={`relative group transition-all duration-500 pb-8 last:pb-0 ${isNextAction ? 'scale-[1.01]' : ''}`}
                        >
                          {/* Timeline Step Connector Icon */}
                          <button 
                            onClick={() => onToggleStep(application.id, step.id)}
                            className={`absolute -left-12 top-0 w-12 h-12 rounded-[1.2rem] border-4 z-10 transition-all duration-500 flex items-center justify-center ${
                              step.isCompleted 
                              ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900 text-white shadow-lg shadow-emerald-500/20' 
                              : isNextAction
                                ? 'bg-white dark:bg-slate-800 border-forest-green text-forest-green shadow-xl ring-8 ring-forest-green/5 animate-[pulse_2s_infinite]'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-200 group-hover:border-forest-green/30'
                            }`}
                          >
                            {step.isCompleted ? (
                              <i className="fas fa-check text-sm"></i>
                            ) : isNextAction ? (
                              <i className="fas fa-play text-xs ml-0.5"></i>
                            ) : (
                              <span className="text-xs font-black">{idx + 1}</span>
                            )}
                          </button>
                          
                          <div 
                            onClick={() => !step.isCompleted && isNextAction && onToggleStep(application.id, step.id)}
                            className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer select-none ${
                            step.isCompleted 
                            ? 'bg-emerald-50/10 border-emerald-100/20 dark:bg-emerald-900/5' 
                            : isNextAction
                              ? 'bg-white dark:bg-slate-900 border-forest-green shadow-[0_20px_50px_rgba(27,94,75,0.08)] ring-1 ring-forest-green/5'
                              : 'bg-transparent border-transparent opacity-60 grayscale-[0.5]'
                          }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                               <div className="flex items-center gap-3">
                                 <h4 className={`text-xl font-black transition-all ${step.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                                   {step.title}
                                 </h4>
                                 {step.isCompleted && (
                                   <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">Completed</span>
                                 )}
                               </div>
                               {isNextAction && !step.isCompleted && (
                                 <div className="px-3 py-1 bg-forest-green text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
                                   <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                                   Active Action
                                 </div>
                               )}
                            </div>
                            <p className={`text-sm leading-relaxed transition-all ${step.isCompleted ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
                              {step.description}
                            </p>
                            
                            {!step.isCompleted && isNextAction && (
                               <div className="mt-6 flex gap-3">
                                  <button 
                                    className="px-6 py-2.5 bg-forest-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-forest-green/20 hover:scale-105 transition-all"
                                    onClick={(e) => { e.stopPropagation(); onToggleStep(application.id, step.id); }}
                                  >
                                    Mark as Complete
                                  </button>
                               </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 ml-[-3rem]">
                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                         <i className="fas fa-dna text-2xl"></i>
                      </div>
                      <p className="text-slate-400 font-black mb-6">Procedural logic not yet initialized.</p>
                      <button 
                        onClick={() => onDetailedDocSearch(application.id)}
                        className="px-8 py-4 bg-forest-green text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-forest-green/20"
                      >
                        Initialize TARA Scan
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                    <i className="fas fa-fingerprint text-forest-green"></i> {t('checklist')}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{completedDocsCount} of {totalDocsCount} documents secured</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {application.requiredDocs.map((doc, idx) => {
                  const isDone = application.completedDocs?.includes(doc);
                  const vaultDoc = findInVault(doc);

                  return (
                    <div 
                      key={idx} 
                      onClick={() => onToggleDoc(application.id, doc)} 
                      className={`p-6 rounded-[2rem] border-2 cursor-pointer flex flex-col gap-4 transition-all group ${
                        isDone
                        ? 'bg-emerald-50/40 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-forest-green/40 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          isDone 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-200'
                        }`}>
                          {isDone ? <i className="fas fa-check text-xs"></i> : <i className="fas fa-file-invoice text-xs"></i>}
                        </div>
                        <span className={`font-black text-sm transition-all flex-1 ${isDone ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{doc}</span>
                        {vaultDoc && !isDone && (
                          <div className="px-3 py-1 bg-forest-green/10 text-forest-green text-[8px] font-black uppercase tracking-widest rounded-lg animate-pulse">Vault Match</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-12">
             <section className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-forest-green rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-1000"></div>
                <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
                  <i className="fas fa-file-signature text-forest-green"></i> Official Forms
                </h3>
                <div className="space-y-4 relative z-10">
                  {application.forms && application.forms.length > 0 ? application.forms.map((form, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group/form">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-black truncate max-w-[150px]">{form.name}</h4>
                        <span className="text-[8px] font-black bg-forest-green px-2 py-1 rounded text-white">{form.type}</span>
                      </div>
                      <p className="text-[10px] text-white/40 mb-4 line-clamp-2">{form.description}</p>
                      <button 
                        onClick={() => setActiveSmartForm(form.name)}
                        className="w-full py-2 bg-forest-green text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg"
                      >
                        Smart Fill
                      </button>
                    </div>
                  )) : (
                    <p className="text-xs text-white/30 font-bold italic">No forms identified for this pathway yet.</p>
                  )}
                  <button 
                    onClick={() => onRefreshResources(application.id)}
                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-forest-green transition-all"
                  >
                    Refresh Resources
                  </button>
                </div>
             </section>

             <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 space-y-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                  <i className="fas fa-building text-forest-green"></i> Submission Points
                </h3>
                <div className="space-y-6">
                  {application.submissionPoints && application.submissionPoints.length > 0 ? application.submissionPoints.map((point, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                         <h4 className="text-sm font-black text-slate-800 dark:text-white">{point.name}</h4>
                         <span className="text-[8px] font-black text-forest-green uppercase tracking-widest">{point.type}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{point.location || 'Local Jurisdiction'}</p>
                      {point.url && (
                        <a href={point.url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-forest-green hover:underline uppercase tracking-widest block pt-2">Visit Portal</a>
                      )}
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic">No submission points detected.</p>
                  )}
                </div>
             </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
