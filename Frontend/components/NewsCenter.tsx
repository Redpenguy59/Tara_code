
import React, { useState } from 'react';
import { NewsItem } from '../types';
import { getTranslation, TranslationKeys } from '../services/translationService';
import WalkingLoader from './WalkingLoader';

interface NewsCenterProps {
  news: NewsItem[];
  isLoading: boolean;
  onRefresh: () => void;
  language?: string;
}

const NewsCenter: React.FC<NewsCenterProps> = ({ news, isLoading, onRefresh, language = 'en' }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const t = (key: TranslationKeys) => getTranslation(language, key);

  const categories = ['All', 'Visa Update', 'Citizenship', 'Safety', 'Policy'];

  const filteredNews = activeCategory === 'All' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-12 animate-fadeIn max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t('mobility_updates')}</h2>
          <p className="text-slate-500 font-bold mt-2">{t('news_desc')}</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-white dark:bg-slate-800 text-forest-green px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
          {t('refresh_feed')}
        </button>
      </header>

      {/* Category Filter Bar */}
      {!isLoading && news.length > 0 && (
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide w-fit mx-auto md:mx-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-white dark:bg-slate-800 text-forest-green shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-8 bg-white dark:bg-slate-800 rounded-[3.5rem] border border-slate-50 dark:border-slate-800">
           <WalkingLoader size="lg" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Aggregating Global Feeds...</p>
        </div>
      ) : filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-transparent hover:border-forest-green shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                  item.category === 'Visa Update' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                  item.category === 'Citizenship' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                  item.category === 'Safety' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 
                  'bg-slate-50 text-slate-500 dark:bg-slate-700/50'
                }`}>
                  {item.category}
                </span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.date}</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4 group-hover:text-forest-green transition-colors leading-tight">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 flex-1 line-clamp-4">
                {item.excerpt}
              </p>
              <div className="pt-6 border-t border-slate-50 dark:border-slate-700">
                 <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs font-black text-forest-green uppercase tracking-widest flex items-center justify-between group/link"
                 >
                   {t('read_official')}
                   <i className="fas fa-arrow-right group-hover/link:translate-x-1 transition-transform"></i>
                 </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6 text-3xl">
            <i className="fas fa-newspaper"></i>
          </div>
          <p className="text-slate-400 font-black text-lg">
            {activeCategory === 'All' ? t('no_updates') : `No updates found for ${activeCategory}.`}
          </p>
          {activeCategory !== 'All' && (
            <button 
              onClick={() => setActiveCategory('All')}
              className="mt-4 text-forest-green font-black uppercase text-[10px] tracking-widest hover:underline"
            >
              Show all categories
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsCenter;
