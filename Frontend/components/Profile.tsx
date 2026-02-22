import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { getTranslation, TranslationKeys } from '../services/translationService';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  language?: string;
}

const Profile: React.FC<ProfileProps> = ({ 
  profile,
  onUpdateProfile,
  language = 'en'
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const profileInputRef = useRef<HTMLInputElement>(null);
  
  const t = (key: TranslationKeys) => getTranslation(language, key);

  // Safe fallbacks for potentially undefined properties
  const displayName = profile?.displayName || 'User';
  const email = profile?.email || '';
  const currentResidence = profile?.currentResidence || '';
  const nationalities = profile?.nationalities || [];
  const profilePicture = profile?.profilePicture || null;
  const isSecurityEnabled = profile?.isSecurityEnabled || false;
  const pinCode = profile?.pinCode || '';

  const handleSavePin = () => {
    if (newPin.length === 6) {
      onUpdateProfile({ pinCode: newPin });
      setShowPinModal(false);
      setNewPin('');
    }
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdateProfile({ profilePicture: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row items-center gap-10">
        <div className="relative group">
          <input 
            type="file" 
            ref={profileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleProfilePictureUpload} 
          />
          <div 
            onClick={() => profileInputRef.current?.click()}
            className="w-44 h-44 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl transition-transform hover:scale-105 cursor-pointer relative"
          >
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300">
                <i className="fas fa-user text-6xl"></i>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <i className="fas fa-camera text-white text-3xl"></i>
            </div>
          </div>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-2">{displayName}</h2>
          <p className="text-slate-400 font-bold text-lg flex items-center justify-center md:justify-start gap-3">
            <i className="fas fa-envelope text-slate-200 dark:text-slate-700"></i> {email}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <i className="fas fa-fingerprint text-forest-green"></i> {t('security_access')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">{t('display_name')}</label>
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => onUpdateProfile({ displayName: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-forest-green dark:text-white font-bold transition-all" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">{t('current_base')}</label>
                <input 
                  type="text" 
                  value={currentResidence}
                  onChange={(e) => onUpdateProfile({ currentResidence: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-forest-green dark:text-white font-bold transition-all" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-forest-green text-xl shadow-sm">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white">{t('active_protection')}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">Require PIN/Biometric on launch.</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdateProfile({ isSecurityEnabled: !isSecurityEnabled })}
                  className={`w-14 h-8 rounded-full p-1.5 transition-all duration-300 ${isSecurityEnabled ? 'bg-forest-green' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${isSecurityEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-forest-green text-xl shadow-sm">
                    <i className="fas fa-key"></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white">{t('access_pin')}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                      {pinCode ? '6-digit PIN is set' : 'No PIN configured'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPinModal(true)}
                  className="bg-white dark:bg-slate-800 px-6 py-2.5 rounded-xl text-xs font-black text-forest-green shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-105 transition-all"
                >
                  {pinCode ? 'Change' : 'Set PIN'}
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <i className="fas fa-globe-americas text-forest-green"></i> {t('verified_nationalities')}
            </h3>
            {nationalities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nationalities.map((nat: any) => (
                  <div key={nat.country} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 hover:border-forest-green/20 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-inner font-black text-forest-green text-sm border border-slate-100 dark:border-slate-700">
                        {nat.country.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-black text-slate-700 dark:text-slate-300">{nat.country}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <i className="fas fa-globe text-4xl text-slate-300 mb-4"></i>
                <p className="text-slate-400 font-bold">No nationalities added yet</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-8">
          <section className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-forest-green rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
            <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
              <i className="fas fa-bell text-forest-green"></i> {t('notification_hub')}
            </h3>
            <p className="text-sm text-white/60 relative z-10">Stay updated with your application progress and important deadlines.</p>
          </section>
          
          <div className="p-8 rounded-[2.5rem] bg-forest-green/5 dark:bg-forest-green/10 border-2 border-dashed border-forest-green/20 text-center space-y-4">
             <i className="fas fa-cloud-arrow-up text-3xl text-forest-green opacity-40"></i>
             <h4 className="font-black text-forest-green">{t('cloud_backup')}</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400">Your data is securely synced</p>
          </div>
        </aside>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-slideUp">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Update Access PIN</h3>
            <p className="text-slate-400 font-bold mb-8 text-sm">Enter a new 6-digit PIN code for secure access.</p>
            
            <input 
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full text-center text-4xl tracking-[0.5em] px-6 py-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-forest-green font-black dark:text-white mb-8"
            />

            <div className="flex gap-4">
              <button 
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePin}
                disabled={newPin.length !== 6}
                className="flex-1 py-4 bg-forest-green text-white rounded-2xl font-black shadow-xl shadow-forest-green/20 disabled:opacity-50"
              >
                Set PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
