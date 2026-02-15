
import React, { useState } from 'react';
import { getCitizenshipRoadmap } from '../services/geminiService';
import { getTranslation, TranslationKeys } from '../services/translationService';
import WalkingLoader from './WalkingLoader';

interface CitizenshipRoadmapProps {
  onSaveRoadmap?: (roadmap: any) => void;
  language?: string;
}

const CitizenshipRoadmap: React.FC<CitizenshipRoadmapProps> = ({ onSaveRoadmap, language = 'en' }) => {
  const [country, setCountry] = useState('');
  const [currentStatus, setCurrentStatus] = useState('Resident');
  const [details, setDetails] = useState('');
  const [roadmap, setRoadmap] = useState<{ text: string, links: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const t = (key: TranslationKeys) => getTranslation(language, key);

  const handleGenerate = async () => {
    if (!country) return;
    setLoading(true);
    setRoadmap(null);
    const result = await getCitizenshipRoadmap(country, currentStatus, details);
    setRoadmap(result);
    setLoading(false);
  };

  const handleSave = () => {
    if (roadmap && onSaveRoadmap) {
      onSaveRoadmap({
        country,
        status: currentStatus,
        text: roadmap.text,
        date: new Date().toISOString()
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
          <i className="fas fa-passport text-forest-green"></i> {t('citizenship')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400">{t('roadmap_desc')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('dest_country')}</label>
              <input 
                type="text" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Italy, Japan, Canada"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-forest-green outline-none dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('current_base')}</label>
              <select 
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-forest-green outline-none dark:text-white"
              >
                <option value="Tourist / Digital Nomad">Tourist / Digital Nomad</option>
                <option value="Temporary Resident">Temporary Resident</option>
                <option value="Permanent Resident">Permanent Resident</option>
                <option value="Ancestry Seeker">{t('ancestry_seeker')}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('context_details')}</label>
              <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Any ancestry? How many years have you lived there?"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-forest-green outline-none h-24 resize-none dark:text-white"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading || !country}
              className="w-full bg-forest-green text-white py-3 rounded-xl font-bold hover-forest-green shadow-md disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <WalkingLoader size="sm" color="text-white" /> : t('generate_roadmap')}
            </button>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white dark:bg-slate-800 p-20 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
              <WalkingLoader size="lg" />
              <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-8">{t('calculating_pathway')}</h4>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">Checking latest citizenship laws and naturalization requirements for {country}.</p>
            </div>
          ) : roadmap ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-fadeIn space-y-6">
              <div className="flex justify-between items-start">
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-forest-green prose-strong:text-slate-900 dark:prose-strong:text-white whitespace-pre-wrap text-slate-600 dark:text-slate-300 leading-relaxed">
                  {roadmap.text}
                </div>
                <button 
                  onClick={handleSave}
                  className="bg-forest-green text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-all flex items-center gap-2"
                >
                  <i className="fas fa-save"></i> {t('save')}
                </button>
              </div>

              {roadmap.links && roadmap.links.length > 0 && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('citizenship_resources')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roadmap.links.map((link: any, i: number) => (
                      link.web && (
                        <a 
                          key={i} 
                          href={link.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-forest-green hover:bg-forest-green/5 transition-all group overflow-hidden"
                        >
                          <i className="fas fa-shield-alt text-slate-300 group-hover:text-forest-green"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{link.web.title || 'Official Source'}</p>
                            <p className="text-[10px] text-slate-400 truncate">{link.web.uri}</p>
                          </div>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 rounded-2xl flex flex-col items-center text-center opacity-60">
              <i className="fas fa-map-marked-alt text-4xl text-slate-300 mb-4"></i>
              <h4 className="font-bold text-slate-400">{t('roadmap_placeholder')}</h4>
              <p className="text-slate-400 text-sm max-w-xs mt-2">{t('roadmap_instruction')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenshipRoadmap;
