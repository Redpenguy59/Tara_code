
import React, { useState, useRef, useEffect } from 'react';
import { getTranslation, TranslationKeys } from '../services/translationService';

interface SecurityLockProps {
  displayName: string;
  expectedPin?: string;
  onUnlock: () => void;
  language?: string;
}

const SecurityLock: React.FC<SecurityLockProps> = ({ displayName, expectedPin, onUnlock, language = 'en' }) => {
  const [pin, setPin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const t = (key: TranslationKeys) => getTranslation(language, key);

  const handlePinInput = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        const target = expectedPin || '123456';
        if (newPin === target) {
          setTimeout(onUnlock, 300);
        } else {
          setPin('');
        }
      }
    }
  };

  const handleBiometricAuth = () => {
    setIsScanning(true);
    setScanProgress(0);
  };

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(onUnlock, 500);
            return 100;
          }
          return prev + 4;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [isScanning, onUnlock]);

  const clearPin = () => setPin('');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.1)] p-12 text-center relative z-10 animate-slideUp border border-slate-100 dark:border-slate-800">
        
        {isScanning ? (
          <div className="py-10 space-y-8 animate-fadeIn">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-50 dark:border-slate-800 rounded-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center text-forest-green">
                 <i className="fas fa-face-viewfinder text-4xl animate-pulse"></i>
              </div>
              <div 
                className="absolute top-0 left-0 w-full bg-forest-green/10 border-b-2 border-forest-green transition-all"
                style={{ height: `${scanProgress}%` }}
              ></div>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.3em]">Authenticating</h3>
              <p className="text-xs text-slate-400 font-bold mt-2">Biometric Verification in progress</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-3xl mx-auto mb-8 shadow-inner border border-slate-100 dark:border-slate-800">
              <i className="fas fa-user-shield"></i>
            </div>

            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">{t('vault_locked')}</h2>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-sm mb-12">{displayName}</p>

            <div className="flex justify-center gap-4 mb-14">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                    pin.length >= i 
                    ? 'bg-forest-green border-forest-green scale-110' 
                    : 'bg-transparent border-slate-200 dark:border-slate-700'
                  }`}
                ></div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button 
                  key={n} 
                  onClick={() => handlePinInput(n.toString())}
                  className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-xl font-black text-slate-700 dark:text-slate-200 hover:bg-forest-green hover:text-white transition-all active:scale-90 shadow-sm border border-transparent hover:shadow-lg"
                >
                  {n}
                </button>
              ))}
              <button onClick={clearPin} className="w-16 h-16 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                <i className="fas fa-backspace"></i>
              </button>
              <button 
                onClick={() => handlePinInput('0')}
                className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-xl font-black text-slate-700 dark:text-slate-200 hover:bg-forest-green hover:text-white transition-all active:scale-90 shadow-sm border border-transparent hover:shadow-lg"
              >
                0
              </button>
              <button 
                onClick={handleBiometricAuth}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl text-forest-green hover:bg-forest-green/5 transition-all"
              >
                <i className="fas fa-face-viewfinder"></i>
              </button>
            </div>
            
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-forest-green" onClick={onUnlock}>Forgot PIN?</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SecurityLock;
