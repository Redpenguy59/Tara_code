
import React, { useState, useEffect } from 'react';
import { findAppointments, getAppointmentChecklist } from '../services/geminiService';
import { Appointment } from '../types';
import { getTranslation, TranslationKeys } from '../services/translationService';
import WalkingLoader from './WalkingLoader';

interface AppointmentCenterProps {
  onBook: (appointment: Appointment) => void;
  language?: string;
}

const AppointmentCenter: React.FC<AppointmentCenterProps> = ({ onBook, language = 'en' }) => {
  const [service, setService] = useState('Visa Biometrics');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ text: string, links: any[] } | null>(null);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  const t = (key: TranslationKeys) => getTranslation(language, key);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => console.log("Location access denied")
      );
    }
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResult(null);
    const result = await findAppointments(service, location);
    setSearchResult(result);
    setIsSearching(false);
    
    const countryMatch = location.match(/[a-zA-Z]+/g);
    const country = countryMatch ? countryMatch[countryMatch.length-1] : "the local country";
    const docs = await getAppointmentChecklist(service, country);
    setChecklist(docs);
  };

  const handleConfirmBooking = () => {
    if (!bookingDate || !bookingTime) return;
    
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      title: service,
      location: location,
      dateTime: `${bookingDate}T${bookingTime}:00`,
      applicationId: 'custom',
      status: 'Confirmed'
    };
    
    onBook(newApt);
    setShowBookingModal(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <i className="fas fa-calendar-check text-forest-green"></i> {t('appointment_scheduler')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('scheduler_desc')}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
            <h3 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <i className="fas fa-search text-forest-green"></i> {t('search_params')}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('service_required')}</label>
                <select 
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-forest-green outline-none font-bold transition-all appearance-none dark:text-white"
                >
                  <option>Visa Biometrics</option>
                  <option>NIF / Tax ID Appointment</option>
                  <option>Social Security Office</option>
                  <option>Driver's License Exchange</option>
                  <option>Residency Interview</option>
                  <option>Citizenship Oath Ceremony</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t('your_location')}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or coordinates..."
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-forest-green outline-none font-bold transition-all pl-12 dark:text-white"
                  />
                  <i className="fas fa-location-arrow absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                </div>
              </div>
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-forest-green text-white py-4 rounded-2xl font-black shadow-xl shadow-forest-green/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
              >
                {isSearching ? <WalkingLoader size="sm" color="text-white" /> : <i className="fas fa-sparkles"></i>}
                {isSearching ? t('scanning_ai') : t('search_slots')}
              </button>
            </div>
          </section>

          {checklist.length > 0 && (
            <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 animate-slideUp">
              <h3 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <i className="fas fa-clipboard-list text-forest-green"></i> {t('required_items')}
              </h3>
              <ul className="space-y-4">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 group">
                    <div className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 group-hover:border-forest-green transition-all flex-shrink-0"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-black">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {isSearching ? (
            <div className="bg-white dark:bg-slate-800 p-20 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-8">
              <WalkingLoader size="lg" />
              <div>
                <h4 className="font-black text-2xl text-slate-800 dark:text-white mb-2">{t('scanning_ai')}</h4>
                <p className="text-slate-400 font-bold max-w-sm">{t('tara_search_desc')}</p>
              </div>
            </div>
          ) : searchResult ? (
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 space-y-10 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white">{t('booking_intel')}</h3>
                  <p className="text-slate-400 font-bold">{t('analysis_resources')}</p>
                </div>
                <button 
                  onClick={() => setShowBookingModal(true)}
                  className="bg-forest-green text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-forest-green/20 hover:scale-105 transition-all flex items-center gap-3"
                >
                  <i className="fas fa-calendar-plus"></i> {t('manual_entry')}
                </button>
              </div>
              
              <div className="prose prose-slate dark:prose-invert max-w-none prose-sm whitespace-pre-wrap text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                {searchResult.text}
              </div>

              {searchResult.links.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-slate-50 dark:border-slate-700">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">{t('portals_links')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResult.links.map((link: any, i: number) => (
                      link.web && (
                        <a 
                          key={i} 
                          href={link.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-50 dark:border-slate-800 hover:border-forest-green/20 hover:bg-forest-green/5 transition-all group"
                        >
                          <i className="fas fa-link text-slate-200 group-hover:text-forest-green transition-colors"></i>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-black text-slate-700 dark:text-slate-300 truncate group-hover:text-forest-green transition-colors">{link.web.title || 'Official Portal'}</p>
                            <p className="text-[10px] text-slate-400 truncate opacity-60">{link.web.uri}</p>
                          </div>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-100/30 dark:bg-slate-900/30 border-4 border-dashed border-slate-200 dark:border-slate-800 p-20 rounded-[3rem] flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 text-4xl mb-6">
                <i className="fas fa-calendar-day"></i>
              </div>
              <h4 className="font-black text-slate-400 text-xl">{t('enter_location_desc')}</h4>
              <p className="text-slate-400 font-bold max-w-xs mt-3">{t('tara_search_desc')}</p>
            </div>
          )}
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-slideUp border border-slate-100 dark:border-slate-700">
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{t('lock_date')}</h3>
            <p className="text-slate-500 font-bold mb-8">Add this slot to your TARA dashboard to get preparation alerts.</p>
            
            <div className="space-y-6 mb-10">
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-[0.2em]">Scheduled Date</label>
                <input 
                  type="date" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-forest-green font-bold transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase block mb-2 tracking-[0.2em]">Time Slot</label>
                <input 
                  type="time" 
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-forest-green font-bold transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-4 text-slate-400 font-black hover:text-slate-600 transition-colors"
              >
                {t('dismiss')}
              </button>
              <button 
                onClick={handleConfirmBooking}
                disabled={!bookingDate || !bookingTime}
                className="flex-1 py-4 bg-forest-green text-white rounded-2xl font-black shadow-2xl shadow-forest-green/20 hover:scale-105 transition-all disabled:opacity-50"
              >
                {t('track_meeting')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCenter;
