import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, Shield, Zap, Clock, Check, Lock, Scroll } from 'lucide-react';
import { RoleDefinition, RoleType, GameMode } from '../types/game';
import { sound } from '../utils/sound';

interface RoleRevealViewProps {
  round: number;
  maxRounds: number;
  role: RoleType;
  definition: RoleDefinition;
  mode: GameMode;
  timer: number;
  onAcknowledge: () => void;
}

export const RoleRevealView: React.FC<RoleRevealViewProps> = ({
  round,
  maxRounds,
  role,
  definition,
  mode,
  timer,
  onAcknowledge
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);

  const toggleReveal = () => {
    sound.playCardFlip();
    setIsRevealed(prev => !prev);
  };

  const handleGotIt = () => {
    sound.playClick();
    setAcknowledged(true);
    onAcknowledge();
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn select-none">
      <div className="max-w-md w-full text-center space-y-4">
        
        {/* Top Header & Privacy Warning */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Round {round} of {maxRounds} • Secret Slip Reveal ({timer}s)</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-100">
            Secret Royal Chit
          </h2>
          <div className="flex items-center justify-center gap-1 text-xs text-amber-300/90 font-medium">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Anti-Peep Shield: Cover your screen from nearby friends!</span>
          </div>
        </div>

        {/* Folded Parchment Chit Card */}
        <div 
          onClick={toggleReveal}
          className={`w-full aspect-[3/4] max-h-[390px] rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-between border-2 transition-all duration-300 shadow-2xl cursor-pointer relative overflow-hidden ${
            isRevealed
              ? stealthMode
                ? 'bg-slate-900 border-slate-700 shadow-amber-500/5'
                : `${definition.bgGradient} shadow-amber-500/20 scale-[1.01]`
              : 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/40 shadow-black'
          }`}
        >
          {/* Watermark Crest */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 text-9xl">
            👑
          </div>

          {isRevealed ? (
            <>
              {/* Top Bar of Open Slip */}
              <div className="flex items-center justify-between w-full z-10">
                <span className="text-[11px] font-mono font-black tracking-wider uppercase text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  {definition.basePoints} PTS
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStealthMode(!stealthMode);
                  }}
                  className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <EyeOff className="w-3 h-3 text-amber-400" />
                  <span>{stealthMode ? 'Normal Colors' : 'Stealth Colors'}</span>
                </button>
              </div>

              {/* Center Role Display */}
              <div className="space-y-2.5 my-auto z-10">
                <div className="text-6xl sm:text-7xl filter drop-shadow-2xl animate-bounce">
                  {definition.emoji}
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                    CONFIDENTIAL ROLE
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl font-black tracking-wide text-white drop-shadow">
                    {definition.name}
                  </h3>
                  <p className="text-xs text-slate-200 font-medium max-w-[280px] mx-auto mt-1 leading-snug">
                    {definition.mission}
                  </p>
                </div>
              </div>

              {/* Special Mode Ability Details */}
              {mode === 'special' && definition.specialAbilityName && (
                <div className="w-full p-2.5 rounded-xl bg-slate-950/85 border border-amber-500/30 text-left space-y-0.5 z-10">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ability: {definition.specialAbilityName}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 leading-tight">
                    {definition.specialAbilityDesc}
                  </div>
                </div>
              )}

              {/* Footer Click to Conceal Hint */}
              <div className="text-[11px] text-slate-300 flex items-center justify-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-700/60 z-10">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Tap slip to fold back & hide</span>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-3.5 my-auto z-10">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center text-4xl shadow-inner animate-pulse">
                📜
              </div>
              <div className="space-y-1">
                <div className="font-serif font-black text-xl text-amber-300 flex items-center justify-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Folded Royal Slip</span>
                </div>
                <p className="text-xs text-slate-400 max-w-[220px] mx-auto">
                  Click or tap to unfold and secretly view your identity
                </p>
              </div>
              <div className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[11px] font-bold rounded-full border border-amber-400/30">
                👉 TAP TO PEEK
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            onClick={handleGotIt}
            className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
              acknowledged
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            {acknowledged ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>ROLE MEMORIZED • WAITING FOR COURT ({timer}s)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>I MEMORIZED MY ROLE ({timer}s)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
