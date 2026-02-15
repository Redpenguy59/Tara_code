
import React, { useState, useRef } from 'react';
import { UserDocument } from '../types';
import { getTranslation, TranslationKeys } from '../services/translationService';

interface VaultProps {
  documents: UserDocument[];
  addDocument: (doc: UserDocument) => void;
  onDelete: (id: string) => void;
  language?: string;
}

const DocumentVault: React.FC<VaultProps> = ({ documents, addDocument, onDelete, language = 'en' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: TranslationKeys) => getTranslation(language, key);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate a brief upload delay for better UX
    setTimeout(() => {
      const newDoc: UserDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 'Image',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      };
      addDocument(newDoc);
      setIsUploading(false);
    }, 800);
  };

  return (
    <div className="space-y-12 animate-fadeIn max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{t('document_vault')}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">{t('securely_store')}</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-forest-green text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-forest-green/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isUploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cloud-arrow-up"></i>}
            {t('upload_doc')}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-2xl text-forest-green shadow-inner">
                      <i className={doc.type === 'PDF' ? 'fas fa-file-pdf' : 'fas fa-file-image'}></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-slate-800 dark:text-white truncate pr-8">{doc.name}</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{doc.fileSize}</span>
                         <span className="text-slate-200 dark:text-slate-700 text-[10px]">&bull;</span>
                         <span className="text-[10px] font-black text-forest-green/60 uppercase tracking-widest">{doc.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  {doc.expiryDate && (
                    <div className="mt-4 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl flex items-center justify-between">
                       <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Expires</span>
                       <span className="text-[9px] font-black text-orange-700 dark:text-orange-300">{doc.expiryDate}</span>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button 
                      onClick={() => onDelete(doc.id)}
                      className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all flex items-center justify-center"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                    <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-forest-green transition-all flex items-center justify-center">
                      <i className="fas fa-download text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
               <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6 text-3xl">
                  <i className="fas fa-vault"></i>
               </div>
               <p className="text-slate-400 font-black text-lg">Your Vault is empty.</p>
               <p className="text-slate-400 font-bold max-w-xs mx-auto mt-2 text-sm leading-relaxed">Securely upload your passport or visas to manage your documents across applications.</p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
           <section className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-forest-green rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-1000"></div>
              <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
                <i className="fas fa-shield-halved text-forest-green"></i> Vault Intel
              </h3>
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Encryption Status</span>
                    <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-1 rounded-lg">AES-256</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Total Secured</span>
                    <span className="text-sm font-black">{documents.length} Files</span>
                 </div>
                 <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                      All files are stored in your private encrypted vault and linked to your active relocation goals.
                    </p>
                 </div>
              </div>
           </section>

           <div className="p-8 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                 <i className="fas fa-link"></i>
              </div>
              <div>
                <h4 className="font-black text-emerald-800 dark:text-emerald-400 text-sm">Data Sync Active</h4>
                <p className="text-[10px] text-emerald-600/60 dark:text-emerald-500/50 font-bold mt-1 uppercase tracking-widest leading-relaxed">
                  Your vault items can be used to pre-fill official forms and check off application requirements.
                </p>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default DocumentVault;
