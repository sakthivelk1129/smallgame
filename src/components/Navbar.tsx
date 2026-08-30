import React, { useState } from 'react';
import { Crown, Volume2, VolumeX, User, Sparkles, HelpCircle, Gamepad2, Maximize, Minimize, Home, ShieldCheck } from 'lucide-react';
import { UserProfile, GameState } from '../types/game';
import { sound } from '../utils/sound';
import { isAdminUser } from '../utils/admin';

interface NavbarProps {
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenRules: () => void;
  onOpenAdmin?: () => void;
  onGoHome?: () => void;
  onExitToPortal?: () => void;
  gameState?: GameState | null;
  activeScreen: 'portal' | 'raja_rani' | 'boost' | 'bulls_cows' | 'cricket';
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenProfile,
  onOpenRules,
  onOpenAdmin,
  onGoHome,
  onExitToPortal,
  gameState,
  activeScreen,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isUserAdmin = isAdminUser(user.email);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-40 px-3 sm:px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Arcade Portal Link / Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onExitToPortal && activeScreen !== 'portal' && (
            <button
              onClick={() => {
                sound.playClick();
                onExitToPortal();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors text-xs font-bold"
              title="Return to Small Paper Game Hub"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Game Hub</span>
            </button>
          )}

          <div 
            onClick={onGoHome}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
            id="nav-brand"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-base">
                {activeScreen === 'cricket' ? '🏏' : activeScreen === 'bulls_cows' ? '🐂' : activeScreen === 'boost' ? '📜' : <Crown className="w-4 h-4 text-amber-400 animate-pulse" />}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-black tracking-wider text-base sm:text-lg bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  {activeScreen === 'cricket' ? 'CRICKET TRUMP' : activeScreen === 'bulls_cows' ? 'BULLS & COWS' : activeScreen === 'boost' ? 'SMALL PAPER (BOOST)' : 'KINGDOM COURT'}
                </h1>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-widest hidden xs:inline-block">
                  {activeScreen === 'cricket' ? '1,000 Cards' : activeScreen === 'bulls_cows' ? 'Word Mastermind' : activeScreen === 'boost' ? 'Paper Slip' : 'King & Thief'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Room / Mode Indicator (if in Raja Rani game) */}
        {activeScreen === 'raja_rani' && gameState && (
          <div className="hidden md:flex items-center gap-3 bg-slate-950/80 px-4 py-1.5 rounded-full border border-amber-500/30">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">ROOM:</span>
              <span className="font-mono text-sm font-black text-amber-400 tracking-widest">
                {gameState.roomId}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${gameState.mode === 'special' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {gameState.mode === 'special' ? 'Special Mode' : 'Normal Mode'}
              </span>
            </div>
            {gameState.phase !== 'LOBBY' && (
              <>
                <div className="h-3 w-px bg-slate-700" />
                <span className="text-xs text-amber-300/90 font-medium">
                  Round {gameState.currentRound}/{gameState.maxRounds}
                </span>
              </>
            )}
          </div>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Admin Control Button if user is Admin */}
          {isUserAdmin && onOpenAdmin && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAdmin();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/50 shadow-sm transition-all text-xs font-black"
              title="Open Master Admin Control Center"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Fullscreen Toggle Button */}
          {onToggleFullscreen && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleFullscreen();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title={isFullscreen ? 'Exit Full Screen' : 'Play in Full Screen'}
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Maximize className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Rules Guide Button */}
          <button
            id="nav-btn-rules"
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs font-medium"
            title="How to Play"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="nav-btn-sound"
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            )}
          </button>

          {/* User Profile Button */}
          <button
            id="nav-btn-profile"
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-950/80 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-400/60 transition-all group"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xs shadow-sm">
              {user.avatar || '👑'}
            </div>
            <div className="text-left hidden xs:block">
              <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors max-w-[80px] sm:max-w-[110px] truncate">
                {user.name}
              </div>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
