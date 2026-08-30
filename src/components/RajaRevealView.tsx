import React, { useEffect } from 'react';
import { Crown, Sparkles, Clock } from 'lucide-react';
import { Player } from '../types/game';
import { sound } from '../utils/sound';

interface RajaRevealViewProps {
  rajaPlayer?: Player;
  round: number;
  maxRounds: number;
  timer: number;
}

export const RajaRevealView: React.FC<RajaRevealViewProps> = ({
  rajaPlayer,
  round,
  maxRounds,
  timer
}) => {
  useEffect(() => {
    sound.playRoyalFanfare();
  }, []);

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Top Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Round {round} of {maxRounds} • Royal Proclamation</span>
          </div>
          <h2 className="font-serif text-sm uppercase tracking-widest text-amber-400 font-bold">
            The Sovereign has risen
          </h2>
        </div>

        {/* Central King Crown Card */}
        <div className="bg-gradient-to-br from-amber-500/20 via-yellow-600/20 to-slate-900 border-2 border-amber-400/60 rounded-3xl p-8 shadow-2xl shadow-amber-500/20 space-y-6 relative overflow-hidden">
          
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-1 shadow-2xl shadow-amber-500/30 flex items-center justify-center animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center text-5xl">
              👑
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              RAJA REVEALED
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-white">
              {rajaPlayer ? rajaPlayer.name : 'Unknown Monarch'}
            </h1>
            <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-mono font-bold text-xs rounded-full border border-amber-400/40">
              +1,000 BASE POINTS
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
            The King’s identity is now known to all subjects. All other roles remain strictly hidden in the shadows!
          </p>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <span>Interrogation begins in</span>
            <span className="font-mono text-amber-400 text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              00:0{timer}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
