import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts & Protected Routes
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import DocumentVault from './components/DocumentVault';
import Assistant from './components/Assistant';
import AppointmentCenter from './components/AppointmentCenter';
import CitizenshipRoadmap from './components/CitizenshipRoadmap';
import ApplicationDetail from './components/ApplicationDetail';
import NewsCenter from './components/NewsCenter';
import Profile from './components/Profile';
import Auth from './components/Auth';
import SecurityLock from './components/SecurityLock';
import OnboardingWizard from './components/OnboardingWizard';
import RepositoryView from './components/RepositoryView';
import WalkingLoader from './components/WalkingLoader';
import CountrySelector from './components/CountrySelector';

// Services & Types
import { storage } from './services/storageService';
import { 
  getDetailedRequirements, 
  getApplicationResources, 
  getTravelAdvisory, 
  getContextualQuestions, 
  checkVisaFreeStatus, 
  getBureaucracyGuidance 
} from './services/geminiService';
import { fetchNewsFromRSS } from './services/newsService';
import { Application, UserDocument, Appointment, ApplicationStatus, NewsItem, UserProfile } from './types';
import { getTranslation, TranslationKeys } from './services/translationService';

// Styles
import './App.css';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

/**
 * TARA_CORE_CONTENT:
 * This contains all your original state logic. It is wrapped by AuthProvider.
 */
const TaraCoreContent: React.FC = () => {
  // CORRECT USAGE: useAuth is called inside the component
  const { user, logout } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile>(storage.getProfile());
  const currentLanguage = userProfile.language || 'en';
  const [theme, setTheme] = useState<'light' | 'dark'>((localStorage.getItem('tara_theme') as 'light' | 'dark') || 'light');
  
  // Security & View States
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [view, setView] = useState('dashboard');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Data States
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  // Loading & Wizard States
  const [isRefreshingResources, setIsRefreshingResources] = useState(false);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [newAppCountry, setNewAppCountry] = useState('');
  const [newAppType, setNewAppType] = useState<Application['type']>('Visa');
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardQuestions, setWizardQuestions] = useState<{label: string, key: string, type: string, options?: string[]}[]>([]);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string>>({});
  const [isWizardLoading, setIsWizardLoading] = useState(false);
  const [appFilter, setAppFilter] = useState<ApplicationStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const t = (key: TranslationKeys) => getTranslation(currentLanguage, key);

  // --- EFFECTS ---
  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('tara_theme', theme);
  }, [theme]);

  useEffect(() => {
    setApplications(storage.getApplications());
    setDocuments(storage.getDocuments());
    setAppointments(storage.getAppointments());
    refreshNews();
  }, []);

  // Persistent storage sync
  useEffect(() => { storage.saveApplications(applications); }, [applications]);
  useEffect(() => { storage.saveDocuments(documents); }, [documents]);
  useEffect(() => { storage.saveAppointments(appointments); }, [appointments]);
  useEffect(() => { storage.saveProfile(userProfile); }, [userProfile]);

  // --- HANDLERS ---
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleOnboardingComplete = (profileUpdates: Partial<UserProfile>, initialDocs: UserDocument[]) => {
    const updatedProfile = { ...userProfile, ...profileUpdates, isOnboarded: true, isSecurityEnabled: true };
    setUserProfile(updatedProfile);
    setDocuments(prev => [...prev, ...initialDocs]);
    setIsUnlocked(true);
    addToast('Onboarding complete!', 'success');
  };

  const refreshNews = async () => {
    setIsNewsLoading(true);
    try {
      const updates = await fetchNewsFromRSS();
      setNews(updates);
    } catch (err) {
      addToast('Failed to fetch news feed', 'error');
    } finally {
      setIsNewsLoading(false);
    }
  };

  const startApplicationWizard = async () => {
    if (!newAppCountry) return;
    setIsWizardLoading(true);
    try {
      const questions = await getContextualQuestions(newAppCountry, newAppType);
      setWizardQuestions(questions);
      setWizardStep(2);
    } finally {
      setIsWizardLoading(false);
    }
  };

  const finishApplicationWizard = async () => {
    setIsWizardLoading(true);
    const travelContext = {
      ...wizardAnswers,
      reason: wizardAnswers['reason'] || (newAppType === 'Asylum Application' ? 'Protection' : 'Relocation'),
      duration: wizardAnswers['duration'] || '12+ months',
      occupation: wizardAnswers['occupation'] || userProfile.occupation || 'Professional'
    };

    try {
      const nationalities = userProfile.nationalities.map(n => n.country);
      const visaFreeData = await checkVisaFreeStatus(nationalities, newAppCountry);
      const appID = `app-${Date.now()}`;
      
      const newApp: Application = {
        id: appID,
        title: `${newAppType} (${newAppCountry})`,
        country: newAppCountry,
        type: newAppType,
        status: visaFreeData.isVisaFree ? ApplicationStatus.VISA_FREE : ApplicationStatus.NOT_STARTED,
        progress: visaFreeData.isVisaFree ? 100 : 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        requiredDocs: [],
        completedDocs: [],
        steps: [],
        isVisaFree: visaFreeData.isVisaFree,
        travelContext
      };

      const [detailedData, resources, advisory] = await Promise.all([
        getDetailedRequirements(newAppCountry, newAppType, userProfile, travelContext),
        getApplicationResources(newAppCountry, newAppType, userProfile, travelContext),
        getTravelAdvisory(newAppCountry)
      ]);

      newApp.requiredDocs = detailedData.documents;
      newApp.steps = detailedData.steps;
      newApp.forms = resources.forms;
      newApp.submissionPoints = resources.submissionPoints;
      newApp.advisory = advisory;

      setApplications(prev => [...prev, newApp]);
      setShowAddAppModal(false);
      setWizardStep(1);
      setSelectedAppId(appID);
      setView('application-detail');
      addToast(`Pathway for ${newAppCountry} initiated!`, 'success');
    } catch (err) {
      addToast('Error initializing pathway.', 'error');
    } finally {
      setIsWizardLoading(false);
    }
  };

  const handleToggleStep = (appId: string, stepId: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      const updatedSteps = app.steps?.map(step => 
        step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
      );
      return { ...app, steps: updatedSteps };
    }));
  };

  const renderView = () => {
    if (view === 'application-detail' && selectedAppId) {
      const app = applications.find(a => a.id === selectedAppId);
      if (app) return (
        <ApplicationDetail 
          application={app} profile={userProfile} vault={documents}
          onBack={() => { setSelectedAppId(null); setView('applications'); }}
          onToggleStep={handleToggleStep}
          onUpdateStatus={(id, s) => setApplications(prev => prev.map(a => a.id === id ? {...a, status: s} : a))}
          language={currentLanguage}
        />
      );
    }

    switch(view) {
      case 'dashboard':
        return <Dashboard 
          applications={applications} appointments={appointments} profile={userProfile}
          onAddApp={() => { setWizardStep(1); setShowAddAppModal(true); }}
          onSelectApplication={(id) => { setSelectedAppId(id); setView('application-detail'); }}
          language={currentLanguage}
        />;
      case 'documents':
        return <DocumentVault documents={documents} addDocument={(doc) => setDocuments(prev => [doc, ...prev])} language={currentLanguage} />;
      case 'news':
        return <NewsCenter news={news} isLoading={isNewsLoading} onRefresh={refreshNews} language={currentLanguage} />;
      case 'profile':
        return <Profile profile={userProfile} onUpdateProfile={(u) => setUserProfile(p => ({...p, ...u}))} language={currentLanguage} />;
      case 'applications':
        const filteredApps = applications.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
          <div className="space-y-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center">
                <h2 className="text-4xl font-black dark:text-white">{t('active_pathways')}</h2>
                <button onClick={() => setShowAddAppModal(true)} className="bg-forest-green text-white px-6 py-3 rounded-xl font-bold">{t('new_goal')}</button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredApps.map(app => (
                    <div key={app.id} onClick={() => { setSelectedAppId(app.id); setView('application-detail'); }} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border shadow-sm cursor-pointer">
                        <h4 className="font-black text-xl dark:text-white">{app.title}</h4>
                        <p className="text-slate-400 uppercase text-xs font-bold">{app.country}</p>
                    </div>
                ))}
            </div>
          </div>
        );
      default:
        return <Dashboard applications={applications} profile={userProfile} language={currentLanguage} />;
    }
  };

  if (userProfile.isOnboarded && userProfile.isSecurityEnabled && !isUnlocked) {
    return <SecurityLock displayName={userProfile.displayName} expectedPin={userProfile.pinCode} onUnlock={() => setIsUnlocked(true)} language={currentLanguage} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {!userProfile.isOnboarded && <OnboardingWizard language={currentLanguage} onComplete={handleOnboardingComplete} />}
      
      <Navigation 
        currentView={view} setView={setView} 
        isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} 
        currentLanguage={currentLanguage} theme={theme} setTheme={setTheme} profile={userProfile}
      />

      <main className={`${isCollapsed ? 'ml-20' : 'ml-64'} flex-1 transition-all duration-300`}>
        <div className="w-full max-w-[1440px] mx-auto px-6 py-12">{renderView()}</div>
      </main>

      {showAddAppModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-slideUp">
            {isWizardLoading ? (
               <div className="text-center py-10"><WalkingLoader size="lg" showText /><p className="mt-4 dark:text-white font-bold">Assembling Intelligence...</p></div>
            ) : wizardStep === 1 ? (
              <>
                <h3 className="text-3xl font-black mb-6 dark:text-white">{t('new_goal')}</h3>
                <div className="space-y-4 mb-8">
                  <CountrySelector value={newAppCountry} onChange={setNewAppCountry} placeholder="Destination" />
                  <select value={newAppType} onChange={(e) => setNewAppType(e.target.value as any)} className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white font-bold">
                    <option value="Visa">Visa</option>
                    <option value="Residency">Residency</option>
                    <option value="Work Permit">Work Permit</option>
                  </select>
                </div>
                <button onClick={startApplicationWizard} className="w-full py-4 bg-forest-green text-white rounded-2xl font-black">Continue</button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black mb-6 dark:text-white">Profile Refinement</h3>
                <div className="space-y-4 mb-8">
                    {wizardQuestions.map(q => (
                        <div key={q.key}>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.label}</label>
                            <input className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-lg dark:text-white" onChange={(e) => setWizardAnswers(prev => ({...prev, [q.key]: e.target.value}))} />
                        </div>
                    ))}
                </div>
                <button onClick={finishApplicationWizard} className="w-full py-4 bg-forest-green text-white rounded-2xl font-black">Initiate Pathway</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`px-6 py-4 rounded-2xl text-white font-bold shadow-xl animate-slideUp border-b-4 ${t.type === 'success' ? 'bg-emerald-500' : 'bg-slate-800'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * MAIN APP ENTRY
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth onLogin={() => {}} language="en" />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <TaraCoreContent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
