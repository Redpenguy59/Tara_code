import React, { useState } from 'react';
import { LANGUAGES, getTranslation, TranslationKeys } from '../services/translationService';
import { UserProfile } from '../types';

interface NavProps {
  currentView: string;
  setView: (view: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  profile: UserProfile;
}

const Navigation: React.FC<NavProps> = ({ 
  currentView, 
  setView, 
  isCollapsed, 
  setIsCollapsed,
  currentLanguage,
  setLanguage,
  theme,
  setTheme,
  profile
}) => {
  const [showLangPicker, setShowLangPicker] = useState(false);

  const t = (key: TranslationKeys) => getTranslation(currentLanguage, key);

  const navItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: t('dashboard') },
    { id: 'explore', icon: 'fa-compass', label: 'Explore' },
    { id: 'applications', icon: 'fa-folder-open', label: t('applications') },
    { id: 'citizenship', icon: 'fa-passport', label: t('citizenship') },
    { id: 'news', icon: 'fa-globe-europe', label: t('news') },
    { id: 'documents', icon: 'fa-file-invoice', label: t('documents') },
    { id: 'calendar', icon: 'fa-calendar-alt', label: t('appointments') },
    { id: 'assistant', icon: 'fa-robot', label: t('assistant') },
    { id: 'profile', icon: 'fa-user-circle', label: t('profile') },
  ];

  const currentLangObj = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <nav className={`${isCollapsed ? 'w-20' : 'w-64'} bg-forest-green h-screen text-white flex flex-col fixed left-0 top-0 shadow-2xl z-50 transition-all duration-300 ease-in-out border-r border-white/5`}>
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-10 h-10 bg-white rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg transform rotate-3">
          <i className="fas fa-route text-forest-green text-2xl"></i>
        </div>
        {!isCollapsed && (
          <div className="animate-fadeIn">
            <h1 className="text-2xl font-black tracking-tighter">TARA</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 -mt-1">Nomad OS</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-slate-800 text-forest-green w-7 h-7 rounded-full flex items-center justify-center shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform z-10"
      >
        <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-[10px]`}></i>
      </button>

      <div className="px-3 mb-4 space-y-1">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2.5 rounded-xl hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest border border-white/5`}
        >
          <div className="w-5 flex items-center justify-center">
             <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-sm`}></i>
          </div>
          {!isCollapsed && <span className="flex-1 text-left">{theme === 'light' ? t('dark_mode') : t('light_mode')}</span>}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowLangPicker(!showLangPicker)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2.5 rounded-xl hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest border border-white/5 ${showLangPicker ? 'bg-white/10' : ''}`}
          >
            <div className="w-5 flex items-center justify-center text-sm">
              <span>{currentLangObj.flag}</span>
            </div>
            {!isCollapsed && <span className="flex-1 text-left truncate">{currentLangObj.name}</span>}
            {!isCollapsed && <i className={`fas fa-chevron-${showLangPicker ? 'up' : 'down'} text-[8px] opacity-30`}></i>}
          </button>
          
          {showLangPicker && (
            <div className={`absolute ${isCollapsed ? 'left-full ml-3 top-0' : 'left-0 right-0 top-full mt-2'} bg-slate-900 rounded-2xl shadow-2xl border border-white/10 py-3 z-[60] max-h-72 overflow-y-auto min-w-[180px] animate-slideUp`}>
              <p className="px-4 pb-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/30">{t('language')}</p>
              {LANGUAGES.map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangPicker(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left text-[11px] font-bold transition-colors ${currentLanguage === lang.code ? 'text-forest-green bg-white' : 'text-white/60'}`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1">{lang.name}</span>
                  {currentLanguage === lang.code && <i className="fas fa-check text-[10px]"></i>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide">
        <p className={`px-4 pb-2 text-[8px] font-black uppercase tracking-[0.2em] text-white/30 ${isCollapsed ? 'text-center opacity-0' : ''}`}>Menu</p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setView(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3.5 rounded-xl transition-all duration-300 ${
                  currentView === item.id 
                  ? 'bg-white text-forest-green font-black shadow-xl scale-[1.02]' 
                  : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <i className={`fas ${item.icon} text-lg w-6 flex-shrink-0 text-center`}></i>
                {!isCollapsed && <span className="truncate text-sm tracking-tight animate-fadeIn">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => setView('profile')}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-2.5 rounded-2xl bg-white/5 w-full text-left hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-user text-forest-green opacity-40"></i>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden animate-fadeIn">
              <p className="text-xs font-black truncate">{profile.displayName || 'New User'}</p>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest truncate">{profile.occupation || 'TARA Traveller'}</p>
            </div>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;