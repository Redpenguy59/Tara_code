
import React, { useState, useEffect } from 'react';
import { getAppointmentChecklist } from '../services/geminiService';
import { getTranslation, TranslationKeys } from '../services/translationService';
import WalkingLoader from './WalkingLoader';

interface AssistantProps {
  prefill?: { country: string, purpose: string } | null;
  onAskGuidance?: (country: string, purpose: string) => Promise<{ text: string, links: any[] }>;
  onSaveChecklist?: (country: string, purpose: string, docs: string[]) => void;
  onBookAppointment?: () => void;
  language?: string;
}

const Assistant: React.FC<AssistantProps> = ({ prefill, onAskGuidance, onSaveChecklist, onBookAppointment, language = 'en' }) => {
  const [country, setCountry] = useState(prefill?.country || '');
  const [purpose, setPurpose] = useState(prefill?.purpose || '');
  const [response, setResponse] = useState<{ text: string, links: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = (key: TranslationKeys) => getTranslation(language, key);

  useEffect(() => {
    if (prefill) {
      setCountry(prefill.country);
      setPurpose(prefill.purpose);
    }
  }, [prefill]);

  const handleAsk = async () => {
    if (!country || !purpose || !onAskGuidance) return;
    setIsLoading(true);
    setResponse(null);
    const guidance = await onAskGuidance(country, purpose);
    setResponse(guidance);
    setIsLoading(false);
  };

  const handleSaveChecklist = async () => {
    if (!country || !purpose || !onSaveChecklist) return;
    setIsLoading(true);
    const docs = await getAppointmentChecklist(purpose, country);
    onSaveChecklist(country, purpose, docs.length > 0 ? docs : ['Passport', 'Local ID', 'Proof of Address']);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <header className="text-center">
        <div className="w-16 h-16 bg-forest-green rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-xl">
          <i className="fas fa-robot"></i>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{t('ask_tara')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('instant_advice')}</p>
      </header>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('dest_country')}</label>
            <input 
              type="text" 
              placeholder="e.g., Portugal, Spain, Thailand..."
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-green transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('want_apply')}</label>
            <select 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-green transition-all"
            >
              <option value="">Select Purpose</option>
              <option value="Digital Nomad Visa">Digital Nomad Visa</option>
              <option value="Family Reunification">Family Reunification</option>
              <option value="Temporary Residency">Temporary Residency</option>
              <option value="Work Permit">Work Permit</option>
              <option value="Asylum/Refugee Status">Asylum / Refugee Status</option>
              <option value="Self-Employed Residency">Self-Employed Residency</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleAsk}
          disabled={isLoading || !country || !purpose}
          className="w-full bg-forest-green text-white py-4 rounded-xl font-bold text-lg hover-forest-green shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative"
        >
          {isLoading ? (
            <div className="flex items-center gap-4">
              <WalkingLoader size="sm" color="text-white" />
              <span>{t('scanning_ai')}</span>
            </div>
          ) : (
            <>
              <i className="fas fa-sparkles"></i>
              {t('generate_plan')}
            </>
          )}
        </button>
      </div>

      {response && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Guidance for {country}</h3>
            <button onClick={() => setResponse(null)} className="text-slate-400 hover:text-slate-600">
              <i className="fas fa-redo"></i> New Search
            </button>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap text-slate-600 dark:text-slate-300 leading-relaxed">
            {response.text}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-4">
            <button 
              onClick={handleSaveChecklist}
              className="bg-forest-green/10 text-forest-green px-4 py-2 rounded-lg font-bold text-sm hover:bg-forest-green/20 transition-all flex items-center gap-2"
            >
              <i className="fas fa-save"></i> {t('save_checklist')}
            </button>
            <button 
              onClick={onBookAppointment}
              className="bg-forest-green/10 text-forest-green px-4 py-2 rounded-lg font-bold text-sm hover:bg-forest-green/20 transition-all flex items-center gap-2"
            >
              <i className="fas fa-calendar-plus"></i> {t('search_slots')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistant;
