import React from 'react';
import { X, Trophy, Sparkles, CheckCircle2, ShieldCheck, Zap, Flame, Clock } from 'lucide-react';
import { sound } from '../../utils/sound';

interface BullsCowsHowToPlayModalProps {
  onClose: () => void;
}

export const BullsCowsHowToPlayModal: React.FC<BullsCowsHowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl shadow-emerald-500/10 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner">
              🐂
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-black text-slate-100 flex items-center gap-2">
                <span>How to Play Bulls & Cows</span>
              </h2>
              <p className="text-xs text-emerald-400 font-mono">
                The Mastermind Word Guessing Game
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Rules Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-200 text-xs sm:text-sm leading-relaxed custom-scrollbar">
          
          {/* Objective */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1 text-emerald-200">
            <div className="font-black text-emerald-300 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4" /> The Objective
            </div>
            <p className="text-xs text-slate-300">
              Figure out the secret English target word (3, 4, 5, 6, or 7 letters) using logical deduction from Bull and Cow feedback in the fewest guesses and shortest time!
            </p>
          </div>

          {/* Clue breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              🎯 The 3 Clue Symbols
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-center">
                <div className="text-2xl">🐂</div>
                <div className="font-bold text-emerald-300 text-xs">BULL</div>
                <div className="text-[11px] text-slate-300">
                  Correct letter <strong>AND</strong> in the exact correct position!
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-center">
                <div className="text-2xl">🐄</div>
                <div className="font-bold text-amber-300 text-xs">COW</div>
                <div className="text-[11px] text-slate-300">
                  Correct letter, but placed in the <strong>WRONG</strong> position!
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1 text-center">
                <div className="text-2xl text-slate-400">✕</div>
                <div className="font-bold text-slate-400 text-xs">ABSENT</div>
                <div className="text-[11px] text-slate-400">
                  This letter is <strong>NOT</strong> present in the secret word at all.
                </div>
              </div>
            </div>
          </div>

          {/* Step by step rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              📋 Rules of Play
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs shrink-0">1</span>
                <div>
                  <strong className="text-slate-100 block font-bold">Unique Letter Rule (No Repeats)</strong>
                  By default, secret target words contain <strong>NO repeated letters</strong> (e.g. <em>TRAIN</em>, <em>PLANT</em>, <em>CLOUD</em>, <em>BRICK</em> are valid; <em>APPLE</em> is invalid).
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs shrink-0">2</span>
                <div>
                  <strong className="text-slate-100 block font-bold">Word Difference Engine</strong>
                  The system calculates a diversity score (0–100) ensuring consecutive secret words share minimal letters and feel fresh every single round!
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs shrink-0">3</span>
                <div>
                  <strong className="text-slate-100 block font-bold">Smart Interactive Keyboard</strong>
                  As you submit guesses, the on-screen keyboard dynamically updates with 🐂 Bull, 🐄 Cow, and ✕ Absent indicators so you don't repeat eliminated letters.
                </div>
              </div>
            </div>
          </div>

          {/* Concrete example */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-xs text-amber-300">💡 Concrete Example (Secret: PLANT)</h4>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span>Guess: <strong className="text-white">PLANE</strong></span>
                <span className="text-emerald-400 font-bold">🐂 4 Bulls • 🐄 0 Cows</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span>Guess: <strong className="text-white">TRAIN</strong></span>
                <span className="text-amber-400 font-bold">🐂 0 Bulls • 🐄 3 Cows (A, N, T)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span>Guess: <strong className="text-white">PLANT</strong></span>
                <span className="text-emerald-300 font-bold">🎉 5 Bulls (SOLVED!)</span>
              </div>
            </div>
          </div>

          {/* Scoring System */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Scoring System (Max 230 Pts)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="font-bold text-emerald-400 block">Guess Efficiency</span>
                <span className="text-slate-400 block">1 Guess: +100 pts</span>
                <span className="text-slate-400 block">2 Guesses: +80 pts</span>
                <span className="text-slate-400 block">3 Guesses: +60 pts</span>
                <span className="text-slate-400 block">4 Guesses: +40 pts</span>
                <span className="text-slate-400 block">5 Guesses: +25 pts</span>
                <span className="text-slate-400 block">6+ Guesses: +10 pts</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="font-bold text-amber-400 block">Speed Bonuses</span>
                <span className="text-slate-400 block">&lt; 20s: +30 pts</span>
                <span className="text-slate-400 block">&lt; 40s: +20 pts</span>
                <span className="text-slate-400 block">&lt; 60s: +10 pts</span>
                <span className="text-slate-400 block font-semibold text-white pt-1">Solve Base: 100 pts</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95"
          >
            I'M READY TO GUESS! 🐂
          </button>
        </div>

      </div>
    </div>
  );
};
