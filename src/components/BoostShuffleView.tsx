import React, { useEffect } from 'react';
import { Sparkles, Shuffle } from 'lucide-react';
import { BoostGameState } from '../types/boost';
import { sound } from '../utils/sound';

interface BoostShuffleViewProps {
  gameState: BoostGameState;
}

export const BoostShuffleView: React.FC<BoostShuffleViewProps> = ({ gameState }) => {
  useEffect(() => {
    sound.playShuffle();
  }, []);

  const totalSlips = gameState.players.length * 3 + 1;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 select-none animate-fadeIn space-y-6 max-w-lg mx-auto text-center">
      
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold animate-pulse">
          <Shuffle className="w-4 h-4" />
          <span>SHUFFLING & DEALING PAPER SLIPS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100">
          Dealing Paper Slips...
        </h2>
        <p className="text-xs text-slate-400">
          Shuffling <strong>{totalSlips} virtual slips</strong>: 4 dealt to starter and 3 to all other players!
        </p>
      </div>

      {/* Dynamic Animated Paper Swirl */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        
        {/* Swirling glow circle */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-rose-500/30 animate-spin duration-3000" />
        
        {/* Floating Paper Slips */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * 2 * Math.PI;
          const x = Math.cos(angle) * 75;
          const y = Math.sin(angle) * 75;

          return (
            <div
              key={i}
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${i * 45}deg)`,
                animationDelay: `${i * 0.15}s`
              }}
              className="absolute w-12 h-16 rounded-xl bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-400 text-slate-900 flex flex-col items-center justify-center shadow-xl animate-bounce"
            >
              <span className="text-lg">📜</span>
              <div className="w-6 h-1 bg-amber-400/60 rounded-full mt-1" />
            </div>
          );
        })}

        {/* Center Sparkle */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-3xl shadow-2xl shadow-rose-500/30 animate-pulse">
          🚀
        </div>

      </div>

      <div className="text-xs font-mono text-amber-300 font-bold bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
        🎲 Seating circular table order: clockwise turns!
      </div>

    </div>
  );
};
