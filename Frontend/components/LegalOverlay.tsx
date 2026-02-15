import React from 'react';
import { getTranslation, TranslationKeys } from '../services/translationService';

interface LegalOverlayProps {
  type: 'privacy' | 'terms' | 'support' | null;
  onClose: () => void;
  language: string;
}

const LegalOverlay: React.FC<LegalOverlayProps> = ({ type, onClose, language }) => {
  if (!type) return null;

  const t = (key: TranslationKeys) => getTranslation(language, key);

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">{t('privacy_policy')}</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none font-medium text-slate-600 dark:text-slate-400">
              <p>Your privacy is TARA's highest priority. As a tool designed for digital nomads, expats, and those in vulnerable global situations, we maintain strict security protocols.</p>
              
              <h3 className="text-forest-green">Data Encryption</h3>
              <p>All sensitive documents uploaded to the Identity Vault are encrypted using AES-256 standards. TARA uses industry-leading encryption to ensure your data remains your own.</p>
              
              <h3 className="text-forest-green">Zero-Knowledge Principles</h3>
              <p>We do not sell your data. Document extraction performed by our AI models is ephemeral; once processed for your dashboard, raw data is handled in accordance with global privacy regulations (GDPR, CCPA).</p>
              
              <h3 className="text-forest-green">Biometric Integrity</h3>
              <p>Biometric data used for Face-ID login never leaves your device. We leverage native hardware security modules to verify your identity locally.</p>
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">{t('terms_of_service')}</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none font-medium text-slate-600 dark:text-slate-400">
              <p>By using TARA, you agree to the following terms regarding global mobility intelligence.</p>
              
              <h3 className="text-forest-green">Not Legal Advice</h3>
              <p>TARA provides intelligence based on official resources and AI analysis. However, TARA is not a law firm. Information provided should be verified with official government channels or qualified immigration legal counsel.</p>
              
              <h3 className="text-forest-green">Data Accuracy</h3>
              <p>Users are responsible for the accuracy of documents uploaded. AI extraction may occasionally misinterpret text; always verify your profile data before submitting official government applications.</p>
              
              <h3 className="text-forest-green">Fair Use</h3>
              <p>TARA is intended for personal relocation and travel assistance. Automated scraping or commercial resale of TARA's intelligence repository is strictly prohibited.</p>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{t('support_centre')}</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">How can we help your journey?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-3">
                <i className="fas fa-life-ring text-2xl text-forest-green"></i>
                <h4 className="font-black text-slate-800 dark:text-white">Relocation Support</h4>
                <p className="text-xs text-slate-500 font-bold">Issues with a specific pathway or document extraction? Our technical team is ready.</p>
                <button className="text-xs font-black text-forest-green uppercase tracking-widest hover:underline">Open Ticket</button>
              </div>
              
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-3">
                <i className="fas fa-handshake-angle text-2xl text-forest-green"></i>
                <h4 className="font-black text-slate-800 dark:text-white">Refugee Assistance</h4>
                <p className="text-xs text-slate-500 font-bold">Urgent humanitarian resources, UNHCR links, and emergency local authority contacts.</p>
                <button className="text-xs font-black text-forest-green uppercase tracking-widest hover:underline">Access Toolkit</button>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-3">
                <i className="fas fa-users text-2xl text-forest-green"></i>
                <h4 className="font-black text-slate-800 dark:text-white">Nomad Community</h4>
                <p className="text-xs text-slate-500 font-bold">Join 50k+ nomads sharing real-time border updates and bureaucracy hacks.</p>
                <button className="text-xs font-black text-forest-green uppercase tracking-widest hover:underline">Join Discord</button>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-3">
                <i className="fas fa-bug text-2xl text-forest-green"></i>
                <h4 className="font-black text-slate-800 dark:text-white">Bug Report</h4>
                <p className="text-xs text-slate-500 font-bold">Found an error in our repository or a UI glitch? Help us improve TARA.</p>
                <button className="text-xs font-black text-forest-green uppercase tracking-widest hover:underline">Report Issue</button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Urgent Inquiries</p>
              <a href="mailto:sos@tara.ai" className="text-xl font-black text-forest-green hover:scale-105 transition-transform inline-block">sos@tara.ai</a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden animate-slideUp border border-white/10 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-forest-green text-white rounded-xl flex items-center justify-center text-sm shadow-lg">
              <i className="fas fa-shield-halved"></i>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">TARA Repository</span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar">
          {getContent()}
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 text-center border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-forest-green text-white rounded-2xl font-black shadow-xl shadow-forest-green/20 hover:scale-[1.02] transition-all text-xs uppercase tracking-widest"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalOverlay;