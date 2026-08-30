import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, Trash2, ArrowRight, Sparkles, Mail, User as UserIcon } from 'lucide-react';
import { 
  getSavedGoogleAccounts, 
  saveGoogleAccount, 
  removeSavedGoogleAccount, 
  SavedGoogleAccount 
} from '../utils/admin';
import { sound } from '../utils/sound';

interface GoogleAccountSelectorModalProps {
  onSelectAccount: (email: string, name: string, avatar: string) => void;
  onClose: () => void;
}

const AVATAR_PRESETS = ['🚀', '🦁', '👑', '🏏', '🐯', '⚡', '💎', '🔥', '🌟', '🦅', '🎯', '🌾'];

export const GoogleAccountSelectorModal: React.FC<GoogleAccountSelectorModalProps> = ({
  onSelectAccount,
  onClose
}) => {
  const [accounts, setAccounts] = useState<SavedGoogleAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'custom'>('saved');
  
  // Custom email entry form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const saved = getSavedGoogleAccounts();
    setAccounts(saved);
    if (saved.length === 0) {
      setActiveTab('custom');
    } else {
      setActiveTab('saved');
    }
  }, []);

  const handleAccountClick = (acc: SavedGoogleAccount) => {
    sound.playSuccess();
    // Update last used timestamp and save
    saveGoogleAccount({
      email: acc.email,
      name: acc.name,
      avatar: acc.avatar
    });
    onSelectAccount(acc.email, acc.name, acc.avatar);
  };

  const handleEmailChange = (val: string) => {
    setNewEmail(val);
    if (!newName.trim() && val.includes('@')) {
      const prefix = val.split('@')[0];
      const cleanName = prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[0-9._-]/g, ' ').trim();
      setNewName(cleanName || prefix);
    }
  };

  const handleAddNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid Google email address (e.g. yourname@gmail.com)');
      return;
    }

    const cleanName = newName.trim() || cleanEmail.split('@')[0];

    sound.playSuccess();
    const updated = saveGoogleAccount({
      email: cleanEmail,
      name: cleanName,
      avatar: selectedAvatar
    });
    setAccounts(updated);
    onSelectAccount(cleanEmail, cleanName, selectedAvatar);
  };

  const handleDeleteAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    sound.playPop();
    const updated = removeSavedGoogleAccount(email);
    setAccounts(updated);
    if (updated.length === 0) {
      setActiveTab('custom');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Google Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {/* Google G SVG */}
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Sign in with Google
              </h3>
              <p className="text-xs text-slate-500">
                {activeTab === 'saved' && accounts.length > 0 
                  ? 'Click your account to sign in instantly'
                  : 'Enter your email to sign in'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher if accounts exist */}
        {accounts.length > 0 && (
          <div className="px-5 pt-3">
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('saved');
                }}
                className={`py-2 rounded-xl transition-all ${
                  activeTab === 'saved'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Saved Accounts ({accounts.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('custom');
                }}
                className={`py-2 rounded-xl transition-all ${
                  activeTab === 'custom'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                + Enter Email by Own
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {activeTab === 'saved' && accounts.length > 0 ? (
            /* Saved Accounts List */
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Click an account to sign in:
              </div>

              <div className="space-y-2">
                {accounts.map((account) => (
                  <div
                    key={account.email}
                    onClick={() => handleAccountClick(account)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 flex items-center justify-between transition-all cursor-pointer group shadow-sm hover:shadow"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform shrink-0">
                        {account.avatar || '🚀'}
                      </div>
                      <div className="text-left truncate">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                          {account.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">
                          {account.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleDeleteAccount(e, account.email)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove from saved list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <span>Sign In</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enter email button */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('custom');
                  setErrorMsg('');
                }}
                className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign in with another Google Email</span>
              </button>
            </div>
          ) : (
            /* Custom Email Entry Form */
            <form onSubmit={handleAddNewAccount} className="space-y-3.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Enter your Google Email:</span>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Google Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 bg-white shadow-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Player / Display Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul, Sakthivel, Priya..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 bg-white shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">
                  Choose Profile Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setSelectedAvatar(av);
                      }}
                      className={`p-2 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                        selectedAvatar === av
                          ? 'bg-blue-100 border-2 border-blue-500 scale-110 shadow-sm'
                          : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                {accounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActiveTab('saved');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Back to Saved Accounts
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>Sign In & Remember</span>
                </button>
              </div>
            </form>
          )}

          {/* Footnote */}
          <div className="pt-2 text-center text-[11px] text-slate-400 leading-relaxed border-t border-slate-100">
            Accounts you sign in with are saved on your browser so you can log in with 1-click anytime.
          </div>
        </div>

      </div>
    </div>
  );
};
