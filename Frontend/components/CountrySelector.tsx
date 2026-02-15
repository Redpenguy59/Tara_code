import React, { useState, useRef, useEffect } from 'react';
import { GLOBAL_REPOSITORY } from '../services/repositoryService';

interface CountrySelectorProps {
  value: string;
  onChange: (countryName: string) => void;
  placeholder?: string;
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ value, onChange, placeholder = "Select a country...", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = GLOBAL_REPOSITORY.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.continent.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = GLOBAL_REPOSITORY.find(c => c.name === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl cursor-pointer flex items-center justify-between hover:border-forest-green transition-all"
      >
        <div className="flex items-center gap-3">
          {selectedCountry ? (
            <>
              <span className="text-xl">{selectedCountry.flag}</span>
              <span className="font-black dark:text-white">{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-slate-400 font-bold">{placeholder}</span>
          )}
        </div>
        <i className={`fas fa-chevron-down text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 z-[110] overflow-hidden animate-slideUp">
          <div className="p-4 border-b border-slate-50 dark:border-slate-800">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries or continents..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none dark:text-white font-bold text-sm"
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
            {filteredCountries.length > 0 ? filteredCountries.map(country => (
              <div 
                key={country.code}
                onClick={() => {
                  onChange(country.name);
                  setIsOpen(false);
                  setSearch("");
                }}
                className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer group transition-all"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{country.flag}</span>
                <div className="flex-1">
                  <p className="font-black text-slate-800 dark:text-white text-sm">{country.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{country.continent}</p>
                </div>
                {value === country.name && <i className="fas fa-check text-forest-green"></i>}
              </div>
            )) : (
              <div className="p-8 text-center">
                <p className="text-slate-400 font-bold text-sm">No destination found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;