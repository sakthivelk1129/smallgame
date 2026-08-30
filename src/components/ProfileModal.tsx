import React, { useState } from 'react';
import { X, Trophy, Shield, Sparkles, Check, LogIn, Award, Zap, Edit3, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types/game';
import { sound } from '../utils/sound';
import { isAdminUser, ADMIN_EMAIL } from '../utils/admin';

interface ProfileModalProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
  onOpenAdmin?: () => void;
}

const AVATAR_OPTIONS = [
  '👑', '👸', '🧙', '👮', '🕵️', '💰', '🌾', '👨‍🍳', 
  '🧹', '🎭', '🤡', '🥷', '🦁', '🐯', '🦅', '🐺'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  onOpenAdmin
}) => {
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [isEditingName, setIsEditingName] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isUserAdmin = isAdminUser(user.email);

  const xpNeeded = user.level * 200;
  const currentLevelXp = user.xp % 200;
  const xpPercent = Math.min(100, Math.round((currentLevelXp / 200) * 100));

  const getRankTitle = (lvl: number) => {
    if (isUserAdmin) return '👑 Master Administrator & Sovereign';
    if (lvl >= 20) return '👑 Emperor Sovereign';
    if (lvl >= 15) return '⚜️ Royal Grandmaster';
    if (lvl >= 10) return '🕵️ Supreme Detective';
    if (lvl >= 5) return '🛡️ Court Counselor';
    return '🗡️ Royal Novice';
  };

  const handleSaveName = () => {
    if (name.trim()) {
      onUpdateUser({ name: name.trim() });
      setIsEditingName(false);
      sound.playClick();
    }
  };

  const handleSelectAvatar = (av: string) => {
    setSelectedAvatar(av);
    onUpdateUser({ avatar: av });
    sound.playPop();
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    sound.playClick();
    // Quick Google sign-in
    setTimeout(() => {
      onUpdateUser({
        name: user.isGuest ? (name.includes('Guest') ? 'Sakthivel K' : name) : name,
        isGuest: false,
        email: ADMIN_EMAIL,
        xp: user.xp + 100 // Bonus XP for Google link
      });
      setGoogleLoading(false);
      sound.playSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif font-bold text-lg text-amber-200">Royal Player Dossier</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Main User Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-4xl">
                  {selectedAvatar}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-xs rounded-full border border-slate-900 shadow">
                Lv.{user.level}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={18}
                    className="px-3 py-1 text-sm bg-slate-800 border border-amber-500/50 rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold text-slate-100">{user.name}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                    title="Edit Name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="text-xs font-semibold text-amber-400 flex items-center justify-center sm:justify-start gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{getRankTitle(user.level)}</span>
              </div>

              <div className="text-xs text-slate-400">
                {isUserAdmin ? (
                  <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold">
                    👑 Master Admin ({user.email})
                  </span>
                ) : user.isGuest ? (
                  <span className="inline-flex items-center gap-1 text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Guest Account (Standard Player)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Google Connected • Standard Player ({user.email})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Admin Quick Launch Banner if Admin */}
          {isUserAdmin && onOpenAdmin && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-500/40 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Master Admin Privileges Active
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  You have full authority to modify game rules, broadcast banners, and boost card collections.
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onOpenAdmin();
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0"
              >
                Open Admin Panel
              </button>
            </div>
          )}

          {/* XP & Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Level Progression
              </span>
              <span className="text-amber-400 font-mono font-bold">
                {user.xp} Total XP ({currentLevelXp} / 200 to Lv.{user.level + 1})
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Avatar Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Choose Royal Avatar
            </label>
            <div className="grid grid-cols-8 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  onClick={() => handleSelectAvatar(av)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xl hover:scale-110 transition-all ${
                    selectedAvatar === av
                      ? 'bg-amber-500/20 border-2 border-amber-400 shadow-md shadow-amber-500/30'
                      : 'bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Career Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Games Played</div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {user.gamesPlayed || 0}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
              <div className="text-xs text-slate-400">Games Won</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {user.gamesWon || 0}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-400">Win Rate</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {user.gamesPlayed ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Google Login Section */}
          {user.isGuest && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-blue-200">Connect with Google</div>
                <div className="text-[11px] text-slate-400">
                  Save your stats, unlock exclusive royal badges, and get +100 bonus XP.
                </div>
              </div>
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {googleLoading ? (
                  <Zap className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

