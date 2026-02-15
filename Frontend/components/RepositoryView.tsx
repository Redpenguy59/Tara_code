import React, { useState } from 'react';
import { GLOBAL_REPOSITORY } from '../services/repositoryService';
import { UserProfile } from '../types';
import { getTranslation, TranslationKeys } from '../services/translationService';

interface RepositoryViewProps {
  profile: UserProfile;
  language?: string;
}

const RepositoryView: React.FC<RepositoryViewProps> = ({ profile, language = 'en' }) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const t = (key: TranslationKeys) => getTranslation(language, key);

  const filteredCountries = GLOBAL_REPOSITORY.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.continent.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = GLOBAL_REPOSITORY.find(c => c.code === selectedCountryCode);

  return (
    <div className="space-y-12 animate-fadeIn max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Intelligence Repository</h2>
          <p className="text-slate-500 font-bold mt-2">Official government portals and documents curated by TARA.</p>
        </div>
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter destination..."
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-forest-green transition-all dark:text-white font-bold"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCountries.map(country => {
          // Check if any resource in this country matches the user profile
          const hasMatches = country.resources.some(r => 
            profile.occupation && r.matchCriteria?.occupations?.some(occ => 
              profile.occupation?.toLowerCase().includes(occ.toLowerCase())
            )
          );

          return (
            <div 
              key={country.code}
              onClick={() => setSelectedCountryCode(country.code)}
              className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-transparent hover:border-forest-green cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-5xl group-hover:scale-110 transition-transform">{country.flag}</span>
                {hasMatches && (
                  <span className="px-4 py-1.5 bg-forest-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-forest-green/20">
                    Matches Profile
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{country.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{country.continent}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 flex-1">
                {country.summary}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                <span className="text-xs font-black text-slate-400">{country.resources.length} Official Links</span>
                <i className="fas fa-arrow-right text-forest-green opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCountry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-white/10 custom-scrollbar">
            <button 
              onClick={() => setSelectedCountryCode(null)}
              className="absolute right-10 top-10 w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>

            <div className="flex items-center gap-8 mb-12">
              <span className="text-7xl">{selectedCountry.flag}</span>
              <div>
                <h3 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">{selectedCountry.name}</h3>
                <p className="text-forest-green font-black uppercase tracking-[0.3em] text-sm mt-2">{selectedCountry.continent} Resources</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCountry.resources.map(resource => {
                const isMatch = profile.occupation && resource.matchCriteria?.occupations?.some(occ => 
                  profile.occupation?.toLowerCase().includes(occ.toLowerCase())
                );

                return (
                  <a 
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] flex flex-col gap-4 relative overflow-hidden group ${
                      isMatch ? 'bg-forest-green/5 border-forest-green' : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {isMatch && (
                      <div className="absolute top-0 right-0 p-3">
                         <i className="fas fa-star text-forest-green animate-pulse"></i>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                        resource.type === 'Portal' ? 'bg-blue-100 text-blue-600' : 
                        resource.type === 'Document' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        <i className={`fas ${
                          resource.type === 'Portal' ? 'fa-globe' : 
                          resource.type === 'Document' ? 'fa-file-pdf' : 'fa-book-open'
                        }`}></i>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 dark:text-white group-hover:text-forest-green transition-colors">{resource.title}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.category} &bull; {resource.type}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {resource.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-forest-green font-black text-xs uppercase tracking-widest">
                      Open Official Link <i className="fas fa-external-link-alt text-[10px]"></i>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryView;