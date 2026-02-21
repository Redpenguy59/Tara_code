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
  getBureaucracyGuidance,
  addCitizenshipToProfile  // ← NEW: Import the helper function
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
  
  // NEW: Citizenship handling states
  const [needsCitizenship, setNeedsCitizenship] = useState(false);
  const [citizenshipPrompt, setCitizenshipPrompt] = useState('');
  const [selectedCitizenship, setSelectedCitizenship] = useState('');
  const [backendResponse, setBackendResponse] = useState<any>(null);

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
      // Check if citizenship is already in userProfile
      const hasStoredCitizenship = userProfile.nationalities && userProfile.nationalities.length > 0;
      
      // Prepare the profile with user_id
      const profileWithId = {
        ...userProfile,
        user_id: user?.email || userProfile.email || `temp_${Date.now()}`
      };

      const nationalities = hasStoredCitizenship ? userProfile.nationalities.map(n => n.country) : [];
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

      // Call backend with profile that includes user_id
      const [detailedData, resources, advisory] = await Promise.all([
        getDetailedRequirements(newAppCountry, newAppType, profileWithId, travelContext),
        getApplicationResources(newAppCountry, newAppType, profileWithId, travelContext),
        getTravelAdvisory(newAppCountry)
      ]);

      // *** NEW: Check if backend is asking for citizenship ***
      if (detailedData.status === "INCOMPLETE" && detailedData.awaiting_feedback?.citizenship) {
        console.log("⚠️ Backend needs citizenship information");
        setNeedsCitizenship(true);
        setCitizenshipPrompt(detailedData.awaiting_feedback.citizenship);
        setBackendResponse({
          newApp,
          detailedData,
          resources,
          advisory,
          appID,
          travelContext,
          profileWithId
        });
        setIsWizardLoading(false);
        return; // Don't proceed yet, wait for citizenship
      }

      // If we got here, we have all the data we need
      newApp.requiredDocs = detailedData.documents || [];
      newApp.steps = detailedData.steps || [];
      newApp.forms = resources.forms || [];
      newApp.submissionPoints = resources.submissionPoints || [];
      newApp.advisory = advisory;

      setApplications(prev => [...prev, newApp]);
      setShowAddAppModal(false);
      setWizardStep(1);
      setNeedsCitizenship(false); // Reset citizenship state
      setSelectedAppId(appID);
      setView('application-detail');
      addToast(`Pathway for ${newAppCountry} initiated!`, 'success');
    } catch (err) {
      console.error("Error in finishApplicationWizard:", err);
      addToast('Error initializing pathway.', 'error');
    } finally {
      setIsWizardLoading(false);
    }
  };

  // NEW: Handler for when user provides citizenship
  const handleCitizenshipSubmit = async () => {
    if (!selectedCitizenship || !backendResponse) return;
    
    setIsWizardLoading(true);
    
    try {
      // Get citizenship details
      const citizenshipData = COUNTRIES.find(c => c.code === selectedCitizenship);
      if (!citizenshipData) {
        addToast('Invalid citizenship selected', 'error');
        return;
      }

      // Update user profile with citizenship
      const updatedProfile = {
        ...userProfile,
        nationalities: [{
          country: citizenshipData.name,
          code: citizenshipData.code
        }]
      };
      setUserProfile(updatedProfile);

      // Add citizenship to the profile we're sending
      const profileWithCitizenship = addCitizenshipToProfile(
        backendResponse.profileWithId,
        citizenshipData.name,
        citizenshipData.code
      );

      // Retry the backend call with citizenship included
      const [detailedData, resources] = await Promise.all([
        getDetailedRequirements(newAppCountry, newAppType, profileWithCitizenship, backendResponse.travelContext),
        getApplicationResources(newAppCountry, newAppType, profileWithCitizenship, backendResponse.travelContext)
      ]);

      // Now finish creating the application
      const newApp = backendResponse.newApp;
      newApp.requiredDocs = detailedData.documents || [];
      newApp.steps = detailedData.steps || [];
      newApp.forms = resources.forms || [];
      newApp.submissionPoints = resources.submissionPoints || [];
      newApp.advisory = backendResponse.advisory;

      setApplications(prev => [...prev, newApp]);
      setShowAddAppModal(false);
      setWizardStep(1);
      setNeedsCitizenship(false);
      setSelectedCitizenship('');
      setBackendResponse(null);
      setSelectedAppId(backendResponse.appID);
      setView('application-detail');
      addToast(`Pathway for ${newAppCountry} initiated!`, 'success');
    } catch (err) {
      console.error("Error handling citizenship:", err);
      addToast('Error processing citizenship information', 'error');
    } finally {
      setIsWizardLoading(false);
    }
  };

// ADD THIS NEW COUNTRIES ARRAY before the return statement (around line 280):
// This provides the country options for the citizenship dropdown
const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MK', name: 'Macedonia' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KP', name: 'North Korea' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SZ', name: 'Swaziland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];


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

  // REPLACE THE MODAL CODE (the part inside showAddAppModal && (...))
// This is around line 295-330 in your current App.tsx

{showAddAppModal && (
  <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-slideUp">
      {isWizardLoading ? (
        <div className="text-center py-10">
          <WalkingLoader size="lg" showText />
          <p className="mt-4 dark:text-white font-bold">Assembling Intelligence...</p>
        </div>
      ) : needsCitizenship ? (
        // *** NEW: Citizenship Collection Step ***
        <>
          <h3 className="text-3xl font-black mb-4 dark:text-white">Additional Information</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {citizenshipPrompt}
          </p>
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Select Your Citizenship
              </label>
              <select
                value={selectedCitizenship}
                onChange={(e) => setSelectedCitizenship(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white font-bold"
              >
                <option value="">Choose your country of citizenship</option>
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setNeedsCitizenship(false);
                setWizardStep(1);
              }}
              className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-black"
            >
              Back
            </button>
            <button
              onClick={handleCitizenshipSubmit}
              disabled={!selectedCitizenship}
              className="flex-1 py-4 bg-forest-green text-white rounded-2xl font-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </>
      ) : wizardStep === 1 ? (
        // Existing Step 1: Country & Type Selection
        <>
          <h3 className="text-3xl font-black mb-6 dark:text-white">{t('new_goal')}</h3>
          <div className="space-y-4 mb-8">
            <CountrySelector value={newAppCountry} onChange={setNewAppCountry} placeholder="Destination" />
            <select 
              value={newAppType} 
              onChange={(e) => setNewAppType(e.target.value as any)} 
              className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white font-bold"
            >
              <option value="Visa">Visa</option>
              <option value="Residency">Residency</option>
              <option value="Work Permit">Work Permit</option>
            </select>
          </div>
          <button 
            onClick={startApplicationWizard} 
            className="w-full py-4 bg-forest-green text-white rounded-2xl font-black"
          >
            Continue
          </button>
        </>
      ) : (
        // Existing Step 2: Profile Refinement
        <>
          <h3 className="text-2xl font-black mb-6 dark:text-white">Profile Refinement</h3>
          <div className="space-y-4 mb-8">
            {wizardQuestions.map(q => (
              <div key={q.key}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {q.label}
                </label>
                <input 
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-lg dark:text-white" 
                  onChange={(e) => setWizardAnswers(prev => ({...prev, [q.key]: e.target.value}))} 
                />
              </div>
            ))}
          </div>
          <button 
            onClick={finishApplicationWizard} 
            className="w-full py-4 bg-forest-green text-white rounded-2xl font-black"
          >
            Initiate Pathway
          </button>
        </>
      )}
    </div>
  </div>
)}


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
