import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../services/translationService';

type AuthView = 'pin' | 'signup' | 'forgot';

export default function Auth({ language = 'en' }: { language?: string }) {
  const [view, setView] = useState<AuthView>('pin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  
  // Data for New Profile (Addresses Issue #1 & #4)
  const [regData, setRegData] = useState({ name: '', email: '', citizenship: '' });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Helper for Translation (Issue #2)
  const t = (key: any) => getTranslation(language, key) || key;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.citizenship) {
      setError("Citizenship is required.");
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      displayName: regData.name || regData.email.split('@')[0],
      email: regData.email,
      // Sets the origin country so the Goal Steps know which visas to check
      citizenship: [{ country: regData.citizenship, status: 'citizen' }]
    };

    login(newUser);
    navigate('/'); 
  };

  const handlePinInput = (digit: string) => {
    setError('');
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      
      if (nextPin.length === 6) {
        if (nextPin === '123456') { // Mock bypass for user: patrick
          login({ 
            id: 'patrick-1', 
            displayName: 'patrick', 
            email: 'patrick@tara.ai', 
            citizenship: [{country: 'USA', status: 'citizen'}] 
          });
          navigate('/');
        } else {
          setPin('');
          setError('Invalid Vault Key');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] bg-white rounded-[3.5rem] shadow-2xl p-12 border border-slate-100 relative overflow-hidden">
        
        {/* VIEW 1: PIN PAD */}
        {view === 'pin' && (
          <div className="text-center animate-fadeIn">
            <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto mb-6 flex items-center justify-center text-slate-200">
              <i className="fas fa-user-shield text-3xl"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-1">Vault Locked</h1>
            <p className="text-slate-400 font-bold text-xs mb-8 uppercase tracking-[0.3em]">patrick</p>
            
            <div className="flex justify-center gap-4 mb-10">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border-2 
                    ${pin.length > i ? 'bg-emerald-500 border-emerald-500 scale-110' : 'bg-transparent border-slate-100'}`} 
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-[10px] font-black uppercase mb-4">{error}</p>}

            <div className="grid grid-cols-3 gap-5 mb-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num} 
                  type="button"
                  onClick={() => handlePinInput(num.toString())}
                  className="h-16 w-16 mx-auto rounded-2xl bg-slate-50 text-xl font-bold text-slate-700 hover:bg-slate-100 active:scale-90 transition-all flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <div />
              <button 
                type="button"
                onClick={() => handlePinInput('0')}
                className="h-16 w-16 mx-auto rounded-2xl bg-slate-50 text-xl font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                0
              </button>
              <button 
                type="button"
                onClick={() => setPin(pin.slice(0, -1))}
                className="h-16 w-16 mx-auto flex items-center justify-center text-slate-300 hover:text-slate-500"
              >
                <i className="fas fa-backspace text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-emerald-600">
                Forgot Pin?
              </button>
              <div className="h-px bg-slate-50 w-full" />
              <button type="button" onClick={() => setView('signup')} className="text-sm font-bold text-emerald-600 hover:underline">
                Create New Profile
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: SIGNUP */}
        {view === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5 animate-fadeIn">
            <h2 className="text-2xl font-black text-slate-800">Create Profile</h2>
            <input 
              required
              placeholder="Full Name" 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-emerald-500"
              onChange={e => setRegData({...regData, name: e.target.value})}
            />
            <input 
              required
              type="email"
              placeholder="Email Address" 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-emerald-500"
              onChange={e => setRegData({...regData, email: e.target.value})}
            />
            <select 
              required
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-emerald-500"
              onChange={e => setRegData({...regData, citizenship: e.target.value})}
            >
              <option value="">Select Citizenship</option>
              <option value="USA">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CAN">Canada</option>
            </select>
            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg">
              Create & Secure Vault
            </button>
            <button type="button" onClick={() => setView('pin')} className="w-full text-xs font-bold text-slate-400">
              Back to Login
            </button>
          </form>
        )}

        {/* VIEW 3: FORGOT */}
        {view === 'forgot' && (
          <div className="text-center space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-black">Reset Access</h2>
            <p className="text-sm text-slate-500 leading-relaxed">We will send a recovery key to your registered email.</p>
            <input 
              placeholder="Enter registered email" 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-emerald-500" 
            />
            <button type="button" onClick={() => setView('pin')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">
              Request Key
            </button>
            <button type="button" onClick={() => setView('pin')} className="text-xs font-bold text-slate-400 block w-full">
              Back to Vault
            </button>
          </div>
        )}

      </div>
    </div>
  );
}