
import React, { useState, useRef } from 'react';
import { UserProfile, UserDocument } from '../types';
import { getTranslation, TranslationKeys } from '../services/translationService';
import { extractDocumentData } from '../services/geminiService';
import CountrySelector from './CountrySelector';
import WalkingLoader from './WalkingLoader';

interface OnboardingProps {
  onComplete: (profile: Partial<UserProfile>, docs: UserDocument[]) => void;
  language: string;
}

const OnboardingWizard: React.FC<OnboardingProps> = ({ onComplete, language }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    displayName: '',
    firstName: '',
    lastName: '',
    currentResidence: '',
    occupation: '',
    language: language,
    pinCode: ''
  });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [docs, setDocs] = useState<UserDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: TranslationKeys) => getTranslation(profile.language || language, key);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await extractDocumentData(base64, file.type);
      
      const newDoc: UserDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 'Image',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        expiryDate: result?.expiryDate || undefined
      };
      
      setDocs(prev => [...prev, newDoc]);
      setIsUploading(false);
      
      if (result) {
        setProfile(prev => ({
          ...prev,
          firstName: prev.firstName || result.firstName,
          lastName: prev.lastName || result.lastName,
          passportNumber: result.documentNumber
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePinInput = (num: string) => {
    if ((profile.pinCode?.length || 0) < 6) {
      setProfile(prev => ({ ...prev, pinCode: (prev.pinCode || '') + num }));
    }
  };

  const clearPin = () => setProfile(prev => ({ ...prev, pinCode: '' }));

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
              <div className="w-20 h-20 bg-forest-green text-white rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl">
                <i className="fas fa-hand-wave"></i>
              </div>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t('welcome')} TARA</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Let's set up your global relocation profile.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('display_name')}</label>
                <input 
                  type="text" 
                  value={profile.displayName} 
                  onChange={e => setProfile({...profile, displayName: e.target.value})}
                  placeholder="Anonymous Wanderer"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-forest-green font-bold transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('language')}</label>
                <select 
                  value={profile.language} 
                  onChange={e => setProfile({...profile, language: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-forest-green font-bold transition-all dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t('relocation_context')}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">{t('onboarding_desc')}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('current_base')}</label>
                <CountrySelector 
                  value={profile.currentResidence || ""}
                  onChange={(val) => setProfile({...profile, currentResidence: val})}
                  placeholder="Where do you live now?"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Occupation</label>
                <input 
                  type="text" 
                  value={profile.occupation} 
                  onChange={e => setProfile({...profile, occupation: e.target.value})}
                  placeholder="e.g. Software Engineer, Designer"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-forest-green font-bold transition-all dark:text-white"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t('identity_vault')}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">{t('onboarding_vault_desc')}</p>
            </div>
            
            <div className="flex flex-col items-center gap-6">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`w-32 h-32 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all ${isUploading ? 'bg-slate-100 dark:bg-slate-800 border-2 border-forest-green/20' : 'bg-forest-green text-white hover:scale-105 shadow-xl shadow-forest-green/20'}`}
              >
                {isUploading ? (
                  <WalkingLoader size="md" color="text-forest-green" />
                ) : (
                  <>
                    <i className="fas fa-cloud-upload text-2xl"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('upload_doc')}</span>
                  </>
                )}
              </button>

              <div className="w-full space-y-3">
                {docs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-file-pdf text-forest-green text-xl"></i>
                      <span className="font-bold text-sm dark:text-white">{doc.name}</span>
                    </div>
                    <i className="fas fa-check-circle text-emerald-500"></i>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-fadeIn">
             <div className="text-center">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Security Lock</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Set a 6-digit PIN to protect your documents.</p>
            </div>

            <div className="flex justify-center gap-4 mb-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    (profile.pinCode?.length || 0) >= i 
                    ? 'bg-forest-green border-forest-green scale-110 shadow-lg shadow-forest-green/20' 
                    : 'bg-transparent border-slate-200 dark:border-slate-700'
                  }`}
                ></div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button 
                  key={n} 
                  onClick={() => handlePinInput(n.toString())}
                  className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-xl font-black text-slate-700 dark:text-slate-200 hover:bg-forest-green hover:text-white transition-all active:scale-90"
                >
                  {n}
                </button>
              ))}
              <button onClick={clearPin} className="w-16 h-16 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                <i className="fas fa-backspace"></i>
              </button>
              <button 
                onClick={() => handlePinInput('0')}
                className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-xl font-black text-slate-700 dark:text-slate-200 hover:bg-forest-green hover:text-white transition-all active:scale-90"
              >
                0
              </button>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
               <button 
                onClick={() => setBiometricEnabled(!biometricEnabled)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${biometricEnabled ? 'bg-forest-green/5 border-forest-green' : 'bg-slate-50 dark:bg-slate-800 border-transparent'}`}
               >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${biometricEnabled ? 'bg-forest-green text-white' : 'bg-white dark:bg-slate-900 text-slate-300'}`}>
                      <i className="fas fa-fingerprint"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black dark:text-white">Sync Biometric Login</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Use Fingerprint/FaceID</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${biometricEnabled ? 'bg-forest-green border-forest-green text-white' : 'border-slate-200'}`}>
                    {biometricEnabled && <i className="fas fa-check text-[10px]"></i>}
                  </div>
               </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-fadeIn text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-4xl mx-auto mb-6">
              <i className="fas fa-check-double"></i>
            </div>
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t('ready_launch')}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xs mx-auto">{t('onboarding_final_desc')}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[300] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.5)] p-12 relative overflow-hidden flex flex-col min-h-[600px] border border-white/10">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-slate-800">
          <div 
            className="bg-forest-green h-full transition-all duration-700 ease-out" 
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {renderStep()}
        </div>

        <div className="mt-12 flex justify-between items-center">
          {step > 1 && step < 5 && (
            <button onClick={handleBack} className="text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
              {t('back')}
            </button>
          )}
          <div className="flex-1"></div>
          {step < 5 ? (
            <button 
              onClick={handleNext}
              disabled={(step === 1 && !profile.displayName) || (step === 4 && (profile.pinCode?.length || 0) < 6)}
              className="bg-forest-green text-white px-10 py-5 rounded-3xl font-black shadow-xl shadow-forest-green/20 hover:scale-105 transition-all disabled:opacity-50"
            >
              {t('continue')}
            </button>
          ) : (
            <button 
              onClick={() => onComplete(profile, docs)}
              className="bg-forest-green text-white px-12 py-5 rounded-3xl font-black shadow-2xl hover:scale-105 transition-all"
            >
              Launch TARA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
