
import React from 'react';
import { Application, Appointment, UserProfile } from '../types';
import { getTranslation, TranslationKeys } from '../services/translationService';

interface DashboardProps {
  applications: Application[];
  appointments: Appointment[];
  profile: UserProfile;
  onAddApp?: () => void;
  onSelectApplication: (id: string) => void;
  onSyncCalendar?: () => void;
  language?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  applications, 
  appointments, 
  profile,
  onAddApp, 
  onSelectApplication, 
  onSyncCalendar,
  language = 'en'
}) => {
  const t = (key: TranslationKeys) => getTranslation(language, key);

  return (
    <div className="space-y-12 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t('welcome')}, {profile.displayName || 'User'}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">
            {t('dashboard_subtitle')}
          </p>
        </div>
        <button 
          onClick={onAddApp}
          className="bg-forest-green text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-forest-green/20 hover:scale-105 transition-all flex items-center gap-3"
        >
          <i className="fas fa-plus"></i> {t('new_goal')}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col justify-between hover:shadow-2xl transition-all group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('days_to_deadline')}</span>
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div className="text-6xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter">
            {appointments.length > 0 ? t('tba') : '--'}
          </div>
          <p className="text-sm text-slate-400 font-bold truncate">
            {appointments.length > 0 ? appointments[0].title : t('no_deadlines')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col justify-between hover:shadow-2xl transition-all group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('docs_verified')}</span>
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="text-6xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter">
            {applications.length > 0 ? applications[0].completedDocs?.length || 0 : 0}/{applications.length > 0 ? applications[0].requiredDocs.length : 0}
          </div>
          <p className="text-sm text-slate-400 font-bold">{t('primary_goal_progress')}</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col justify-center items-center text-center space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-forest-green rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:scale-110 transition-transform"></div>
          <i className="fas fa-shield-halved text-4xl text-forest-green mb-2"></i>
          <h4 className="text-xl font-black">{t('identity_guard')}</h4>
          <p className="text-xs text-white/40 font-bold leading-relaxed uppercase tracking-widest">{t('identity_guard_desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4">
              <i className="fas fa-tasks text-forest-green"></i> {t('active_pathways')}
            </h3>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{applications.length} {t('goals_label')}</span>
          </div>
          <div className="space-y-8">
            {applications.length > 0 ? applications.map((app) => (
              <div 
                key={app.id} 
                onClick={() => onSelectApplication(app.id)}
                className="group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-forest-green font-black text-xl group-hover:bg-forest-green group-hover:text-white transition-all shadow-sm">
                      {app.country.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white group-hover:text-forest-green transition-colors tracking-tight">{app.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{app.country} &bull; {app.type}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-forest-green">{app.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-forest-green h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${app.progress}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                <i className="fas fa-flag-checkered text-4xl text-slate-200 mb-4 block"></i>
                <p className="text-slate-400 font-bold mb-4">{t('no_pathways')}</p>
                <button 
                  onClick={onAddApp} 
                  className="text-forest-green font-black text-sm uppercase tracking-widest hover:underline underline-offset-8"
                >
                  {t('new_goal')}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4">
              <i className="fas fa-calendar-check text-forest-green"></i> {t('upcoming_meetings')}
            </h3>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-300">
               <i className="fas fa-calendar-day"></i>
            </div>
          </div>
          <div className="space-y-6">
            {appointments.length > 0 ? [...appointments].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).map((apt) => {
              const date = new Date(apt.dateTime);
              return (
                <div key={apt.id} className="flex gap-6 p-6 rounded-3xl border border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-forest-green text-white flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{date.toLocaleDateString(undefined, {month: 'short'})}</span>
                    <span className="text-2xl font-black leading-none">{date.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-800 dark:text-white truncate tracking-tight">{apt.title}</h4>
                    <p className="text-sm text-slate-400 font-bold flex items-center gap-2 mt-1 truncate">
                      <i className="fas fa-map-marker-alt text-forest-green opacity-50"></i> {apt.location}
                    </p>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 flex items-center gap-2">
                      <i className="fas fa-clock opacity-50"></i> {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      apt.status === 'Confirmed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                <i className="fas fa-calendar-xmark text-4xl text-slate-200 mb-4 block"></i>
                <p className="text-slate-400 font-bold">{t('empty_schedule')}</p>
              </div>
            )}
            <button 
              onClick={onSyncCalendar}
              className="w-full mt-6 py-5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-forest-green hover:text-forest-green transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <i className="fas fa-plus-circle"></i> {t('sync_calendar')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
