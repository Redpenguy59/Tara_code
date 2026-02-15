
import React, { useState, useEffect } from 'react';
import { UserProfile, Application, FormField } from '../types';
import { FORM_TEMPLATES } from '../services/formTemplates';
import { getTranslation, TranslationKeys } from '../services/translationService';

interface FormSmartFillProps {
  formName: string;
  profile: UserProfile;
  application: Application;
  onClose: () => void;
  language: string;
}

const FormSmartFill: React.FC<FormSmartFillProps> = ({ formName, profile, application, onClose, language }) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const t = (key: TranslationKeys) => getTranslation(language, key);

  useEffect(() => {
    // Attempt to find a template or generate a generic one based on application type
    const templateFields = FORM_TEMPLATES[formName] || FORM_TEMPLATES[Object.keys(FORM_TEMPLATES)[0]];
    
    const mappedFields = templateFields.map(field => {
      const label = field.label.toLowerCase();
      let value = '';

      // Mapping Logic: Profile -> Form
      if (label.includes('full name')) value = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
      else if (label.includes('first name')) value = profile.firstName || '';
      else if (label.includes('last name')) value = profile.lastName || '';
      else if (label.includes('passport number')) value = profile.passportNumber || '';
      else if (label.includes('nationality')) value = profile.nationalities[0]?.country || '';
      else if (label.includes('date of birth') || label.includes('dob')) value = profile.dateOfBirth || '';
      else if (label.includes('occupation')) value = profile.occupation || '';
      else if (label.includes('residence')) value = profile.currentResidence || '';
      else if (label.includes('email')) value = profile.email || '';
      else if (label.includes('phone')) value = profile.phoneNumber || '';
      
      // Mapping Logic: Travel Context (Wizard Answers) -> Form
      if (!value && application.travelContext) {
        const contextKey = Object.keys(application.travelContext).find(k => label.includes(k.toLowerCase()));
        if (contextKey) value = application.travelContext[contextKey] || '';
      }

      return { ...field, value };
    });

    setFields(mappedFields);
  }, [formName, profile, application]);

  const handleFieldChange = (label: string, val: string) => {
    setFields(prev => prev.map(f => f.label === label ? { ...f, value: val } : f));
  };

  const copyAll = () => {
    const text = fields.map(f => `${f.label}: ${f.value}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Form data copied to clipboard for easy pasting into the official portal.');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative border border-white/10 animate-slideUp">
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-400 hover:text-red-500 transition-colors">
          <i className="fas fa-times text-xl"></i>
        </button>

        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-forest-green/10 text-forest-green rounded-2xl flex items-center justify-center text-xl">
              <i className="fas fa-wand-magic-sparkles"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t('form_review')}</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold">{formName}</p>
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-3">
             <i className="fas fa-info-circle text-emerald-500"></i>
             <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">TARA has auto-filled these fields using your Vault and Profile data.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {fields.map((field, idx) => (
            <div key={idx} className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{field.label}</label>
              {field.type === 'select' ? (
                <select 
                  value={field.value} 
                  onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-forest-green font-bold dark:text-white"
                >
                  <option value="">Select...</option>
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input 
                  type={field.type} 
                  value={field.value} 
                  onChange={(e) => handleFieldChange(field.label, e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-forest-green font-bold dark:text-white"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={copyAll}
            className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 py-4 rounded-2xl font-black text-slate-600 dark:text-slate-300 uppercase text-xs tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-copy"></i> {t('copy_content')}
          </button>
          <button 
            onClick={() => {
              window.open(application.forms?.find(f => f.name === formName)?.url, '_blank');
            }}
            className="flex-1 bg-forest-green text-white py-4 rounded-2xl font-black shadow-xl shadow-forest-green/20 uppercase text-xs tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-external-link-alt"></i> {t('finalize_submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormSmartFill;
