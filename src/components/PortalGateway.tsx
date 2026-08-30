import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Zap, 
  Sparkles, 
  User, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Gamepad2, 
  LogOut, 
  Clock, 
  Users, 
  Flame,
  Globe,
  Lock,
  KeyRound,
  Maximize,
  Minimize,
  HelpCircle,
  Mail,
  Scale,
  FileText,
  Cookie
} from 'lucide-react';
import { UserProfile } from '../types/boost';
import { sound } from '../utils/sound';
import { isAdminUser, ADMIN_EMAIL } from '../utils/admin';
import { GoogleAccountSelectorModal } from './GoogleAccountSelectorModal';
import { MasterAdminLoginModal } from './MasterAdminLoginModal';
import { AdBannerSlot } from './ads/AdBannerSlot';

interface PortalGatewayProps {
  currentUser: UserProfile | null;
  onLoginAsGuest: (name: string, avatar: string) => void;
  onLoginWithGoogle: (email: string, name: string, avatar: string) => void;
  onSelectGame: (gameId: 'raja_rani' | 'stopwatch' | 'bulls_cows' | 'cricket') => void;
  onJoinWithCode?: (gameId: 'raja_rani' | 'stopwatch' | 'bulls_cows' | 'cricket', code: string) => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  onOpenAboutUs?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenTerms?: () => void;
  onOpenContact?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const AVATAR_OPTIONS = ['👑', '👸', '👮', '🥷', '🚀', '🐯', '🦁', '🦅', '⚡', '💎', '🔥', '🌾'];

export const PortalGateway: React.FC<PortalGatewayProps> = ({
  currentUser,
  onLoginAsGuest,
  onLoginWithGoogle,
  onSelectGame,
  onJoinWithCode,
  onLogout,
  onOpenAdmin,
  onOpenAboutUs,
  onOpenPrivacyPolicy,
  onOpenTerms,
  onOpenContact,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [authMode, setAuthMode] = useState<'guest' | 'google'>('guest');
  const [guestName, setGuestName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👑');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showMasterAdminModal, setShowMasterAdminModal] = useState(false);

  // Quick Room Code Joiner State
  const [gatewayRoomCode, setGatewayRoomCode] = useState('');
  const [selectedGameForCode, setSelectedGameForCode] = useState<'stopwatch' | 'raja_rani' | 'bulls_cows' | 'cricket'>('stopwatch');
  
  // Real-time online users counter
  const [onlineCount, setOnlineCount] = useState<number>(1);

  useEffect(() => {
    const fetchPresence = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.onlineUsers) {
            setOnlineCount(data.onlineUsers);
          }
        }
      } catch (e) {
        // quiet fallback
      }
    };
    fetchPresence();
    const interval = setInterval(fetchPresence, 5000);
    return () => clearInterval(interval);
  }, []);

  const isUserAdmin = currentUser ? isAdminUser(currentUser.email) : false;

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = guestName.trim() || 'Player 1';
    sound.playClick();
    onLoginAsGuest(finalName, selectedAvatar);
  };

  const handleGoogleAccountSelected = (email: string, name: string, avatar: string) => {
    setShowGoogleModal(false);
    onLoginWithGoogle(email, name, avatar);
  };

  const handleMasterAdminSuccess = (email: string, name: string) => {
    setShowMasterAdminModal(false);
    onLoginWithGoogle(email, name, '👑');
    if (onOpenAdmin) {
      setTimeout(() => onOpenAdmin(), 250);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none relative overflow-x-hidden pb-16 lg:pb-4">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-7xl flex items-center justify-between py-2 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 text-xl font-black shadow-lg shadow-amber-500/20">
            🎮
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400">
              SMALL PAPER GAME
            </h1>
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Multiplayer Paper Slips & Kingdom Chits</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{onlineCount} Online</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen Button */}
          {onToggleFullscreen && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleFullscreen();
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isFullscreen ? 'Exit Full Screen' : 'Play in Full Screen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-amber-400" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl shadow-md">
              <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-base">
                {currentUser.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-200 truncate max-w-[140px] flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  {isUserAdmin && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-400/40">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-amber-400 font-mono">
                  {isUserAdmin ? '👑 Master Admin (Owner)' : currentUser.isGuest ? 'Guest Player' : 'Google Player'}
                </div>
              </div>
              {isUserAdmin && onOpenAdmin && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenAdmin();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Open Master Admin Control Center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Admin</span>
                </button>
              )}
              <button
                onClick={() => {
                  sound.playClick();
                  onLogout();
                }}
                title="Sign Out / Switch Account"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowMasterAdminModal(true);
                }}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Master Admin Login"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Login</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 1. TOP DESKTOP LEADERBOARD AD BANNER */}
      <AdBannerSlot 
        position="desktop-top-leaderboard"
        onActionClick={() => currentUser && onSelectGame('cricket')}
      />

      {/* 2. TOP MOBILE LEADERBOARD AD BANNER */}
      <AdBannerSlot 
        position="mobile-top-banner"
        onActionClick={() => currentUser && onSelectGame('cricket')}
      />

      {/* Main Container with 6 Surround Ad Layout on Desktop */}
      <div className="w-full max-w-7xl flex items-start justify-center gap-4 flex-1 my-2">
        
        {/* 2. LEFT DESKTOP SKYSCRAPER / TOWER AD (160x600 / 300x600) */}
        <AdBannerSlot 
          position="desktop-left-skyscraper"
          className="shrink-0"
        />

        {/* Center Main Stage (Login or Game Selection Hub) */}
        <main className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full py-1">
          
          {/* Auth / Login Box if not logged in */}
          {!currentUser ? (
            <div className="w-full max-w-md bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/5 backdrop-blur-md space-y-6">
              
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[11px] font-bold border border-amber-400/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>WELCOME TO THE ARCADE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-100">
                  Sign In to Play
                </h2>
                <p className="text-xs text-slate-400">
                  Play instantly as a guest or sign in with your Google account
                </p>
              </div>

              {/* Auth Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMode('guest');
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authMode === 'guest'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  👤 Guest Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMode('google');
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authMode === 'google'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌐 Google Login
                </button>
              </div>

              {/* Guest Form */}
              {authMode === 'guest' ? (
                <form onSubmit={handleGuestSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-300">
                      Your Player Nickname:
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Rahul, Priya, Vikram..."
                      maxLength={16}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-300">
                      Choose Your Avatar:
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSelectedAvatar(emoji);
                          }}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                            selectedAvatar === emoji
                              ? 'bg-amber-500/20 border-2 border-amber-400 scale-110 shadow-md'
                              : 'bg-slate-950 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span>Enter Arcade as Guest</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Touch the Google button below to view all your Google accounts and click to log in instantly!
                  </p>

                  {/* Google Sign-in Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowGoogleModal(true);
                    }}
                    className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-98"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  </button>

                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Choose an account from your saved list or add a new one</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Game Selection Hub */
            <div className="w-full space-y-6 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  SELECT A GAME TO PLAY
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100">
                  The Party Game Collection
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Choose a game below to create or join a real-time room with friends! Games automatically open in Full Screen.
                </p>
              </div>

              {/* Quick Join With Room Code Bar */}
              <div className="max-w-3xl mx-auto w-full bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-indigo-950/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-0.5 bg-indigo-500 text-white font-black text-[10px] rounded-bl-xl uppercase tracking-wider">
                  ⚡ INSTANT MULTIPLAYER JOIN
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-serif font-black text-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <span>Play with a Friend Using Room Code</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Got a 6-character room code from your friend? Select game and enter code below:
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) {
                            const clean = text.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                            if (clean) {
                              setGatewayRoomCode(clean.substring(0, 6));
                              if (clean.startsWith('CRIC') || clean.startsWith('CRK')) {
                                setSelectedGameForCode('cricket');
                              } else if (clean.startsWith('BC')) {
                                setSelectedGameForCode('bulls_cows');
                              }
                              sound.playPop();
                            }
                          }
                        } catch {}
                      }}
                      className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>📋 Paste from Clipboard</span>
                    </button>
                  </div>

                  {/* Game Selector Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'stopwatch' as const, label: 'Stopwatch', icon: '⏱️', border: 'border-cyan-500/50', activeBg: 'bg-cyan-500 text-slate-950 font-black shadow-md' },
                      { id: 'raja_rani' as const, label: 'Kingdom Court', icon: '👑', border: 'border-amber-500/50', activeBg: 'bg-amber-500 text-slate-950 font-black shadow-md' },
                      { id: 'bulls_cows' as const, label: 'Bulls & Cows', icon: '🐂', border: 'border-rose-500/50', activeBg: 'bg-rose-500 text-slate-950 font-black shadow-md' },
                      { id: 'cricket' as const, label: 'Cricket Battle', icon: '🏏', border: 'border-blue-500/50', activeBg: 'bg-blue-500 text-white font-black shadow-md' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSelectedGameForCode(g.id);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedGameForCode === g.id
                            ? g.activeBg
                            : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{g.icon}</span>
                        <span className="truncate">{g.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Input & Join Button */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={gatewayRoomCode}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                          setGatewayRoomCode(val);
                          if (val.startsWith('CRIC') || val.startsWith('CRK')) {
                            setSelectedGameForCode('cricket');
                          } else if (val.startsWith('BC')) {
                            setSelectedGameForCode('bulls_cows');
                          }
                        }}
                        placeholder="ENTER 6-CHAR CODE (e.g. A9K2L1)"
                        className="w-full bg-slate-950 border-2 border-indigo-500/40 focus:border-indigo-400 rounded-2xl py-3 px-4 text-center sm:text-left font-mono font-black text-lg sm:text-xl tracking-widest text-indigo-200 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={gatewayRoomCode.trim().length < 4}
                      onClick={() => {
                        const clean = gatewayRoomCode.trim().toUpperCase();
                        if (clean.length < 4) return;
                        sound.playJoin();
                        if (onJoinWithCode) {
                          onJoinWithCode(selectedGameForCode, clean);
                        } else {
                          onSelectGame(selectedGameForCode);
                        }
                      }}
                      className="py-3 px-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Zap className="w-4 h-4" />
                      <span>JOIN ROOM NOW</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Games Grid (4 Games) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                
                {/* Game 1: STOPWATCH - Precision Target Timer Duel */}
                <div className="group bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/50 hover:border-cyan-400 rounded-3xl p-4 sm:p-5 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all flex flex-col justify-between relative overflow-hidden ring-1 ring-cyan-500/30">
                  <div className="absolute top-0 right-0 px-3 py-0.5 bg-gradient-to-l from-cyan-500 to-teal-500 text-slate-950 font-black text-[10px] rounded-bl-xl shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-slate-950" /> 3 MODES • BOT • FRIENDS • ONLINE
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                        ⏱️
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                          Millisecond Reaction Duel
                        </span>
                        <h3 className="text-xl font-serif font-black text-cyan-300">
                          Stopwatch Precision Duel
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      A target time appears. Stop the clock at the exact millisecond! Hit exact time for <strong className="text-emerald-400">2 Pts</strong>, closest player/team gets <strong className="text-cyan-300">1 Pt</strong>, and ties give equal points!
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-400" /> Single & Team Modes
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> 2 Pts Bullseye
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> 3, 5, 7, 10 Rounds
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectGame('stopwatch');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <span>PLAY STOPWATCH PRECISION</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Game 2: Kingdom Court: King & Thief (Royal Paper Chits) */}
                <div className="group bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-4 sm:p-5 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-0.5 bg-gradient-to-l from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] rounded-bl-xl shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3 h-3" /> ROYAL MYSTERY CHITS
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                        👑
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                          King, Queen, Thief & Cop Chits
                        </span>
                        <h3 className="text-xl font-serif font-black text-amber-300">
                          Kingdom Court (King & Thief)
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      The legendary royal court paper chit game! Draw your secret folded chit (King, Queen, Minister, Police, Thief), the King reveals, and the Police interrogates to catch the Thief!
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-400" /> 4–12 Players
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-purple-400" /> Secret Roles
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectGame('raja_rani');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <span>PLAY KINGDOM COURT (KING & THIEF)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Game 3: BULLS & COWS */}
                <div className="group bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-4 sm:p-5 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-0.5 bg-gradient-to-l from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] rounded-bl-xl shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 1 VS 1 DUEL
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      🐂
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-black text-emerald-300">
                        Bulls & Cows
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Classic Mastermind word deduction! 3 to 7 letters. Get 🐂 Bulls for exact matches and 🐄 Cows for wrong positions!
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-400" /> 1 vs 1 / Bot
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        📏 3–7 Letters
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectGame('bulls_cows');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <span>PLAY BULLS & COWS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Game 4: CRICKET CARD BATTLE */}
                <div className="group bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-yellow-500/50 hover:border-yellow-400 rounded-3xl p-4 sm:p-5 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/15 transition-all flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-0.5 bg-gradient-to-l from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] rounded-bl-xl shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3 h-3" /> NEW 4TH GAME
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      🏏
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400">
                        Cricket Battle
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        1,000 real player cards! 4 batting & 4 bowling stats + Global Rank. Compare stats, outscore rivals, and collect all cards!
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-400" /> 2–8 Players
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                        📚 1,000 Pool
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectGame('cricket');
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <span>PLAY CRICKET BATTLE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* 5 & 6. MID-GRID DESKTOP AD SPOTS (300x250 Medium Rectangles) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <AdBannerSlot position="desktop-mid-left" />
                <AdBannerSlot position="desktop-mid-right" />
              </div>

              {/* Coming Soon Teasers */}
              <div className="pt-2 space-y-2.5 max-w-4xl mx-auto">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    ⏳ Coming Soon to Small Paper Game Arcade
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center space-y-1 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="text-xl">🏏</div>
                    <div className="text-xs font-bold text-slate-200">Hand Cricket</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      6 or Out Duel
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center space-y-1 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="text-xl">📝</div>
                    <div className="text-xs font-bold text-slate-200">Name Place Animal</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Scatter Race
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center space-y-1 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="text-xl">🎟️</div>
                    <div className="text-xs font-bold text-slate-200">Tambola / Housie</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      Number Caller
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center space-y-1 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="text-xl">🎲</div>
                    <div className="text-xs font-bold text-slate-200">Ludo Royale</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      4-Player Board
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* 3. RIGHT DESKTOP SKYSCRAPER / TOWER AD (160x600 / 300x600) */}
        <AdBannerSlot 
          position="desktop-right-skyscraper"
          className="shrink-0"
        />

      </div>

      {/* 4. BOTTOM DESKTOP LEADERBOARD AD BANNER */}
      <AdBannerSlot position="desktop-bottom-leaderboard" />

      {/* 7. MOBILE BOTTOM STICKY BANNER AD BOX (320x50 / 300x50) */}
      <AdBannerSlot position="mobile-bottom-banner" />

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <GoogleAccountSelectorModal
          onSelectAccount={handleGoogleAccountSelected}
          onClose={() => setShowGoogleModal(false)}
        />
      )}

      {/* Master Admin Login Modal */}
      {showMasterAdminModal && (
        <MasterAdminLoginModal
          onSuccess={handleMasterAdminSuccess}
          onClose={() => setShowMasterAdminModal(false)}
        />
      )}

      {/* Comprehensive Google AdSense Compliance Footer */}
      <footer className="w-full max-w-6xl py-4 border-t border-slate-800/80 flex flex-col space-y-3 mt-4 text-xs text-slate-400">
        
        {/* Navigation & Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium">
          <button
            onClick={() => {
              sound.playClick();
              onOpenAboutUs?.();
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenPrivacyPolicy?.();
            }}
            className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Privacy Policy (GDPR / CCPA)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenTerms?.();
            }}
            className="hover:text-purple-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenContact?.();
            }}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Contact Us & Ads Inquiry</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowMasterAdminModal(true);
            }}
            className="text-slate-500 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            <span>Master Portal</span>
          </button>
        </div>

        {/* Legal & Ad Disclosures */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>© 2026 Small Paper Game • Developed by Sakthivel (<span className="text-amber-400/80">sakthivelk1129@gmail.com</span>). All rights reserved.</p>
          <p className="text-[10px] text-slate-600">
            This site uses standard Google Ads / Google AdSense advertising units to support server maintenance and free multiplayer features. Live games switch to immersive distraction-free view.
          </p>
        </div>

      </footer>
    </div>
  );
};
