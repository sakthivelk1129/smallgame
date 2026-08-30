import React from 'react';
import { X, Timer, Target, Award, Users, Bot, Zap, Flame, ShieldAlert, Sparkles, Scale } from 'lucide-react';
import { sound } from '../../utils/sound';

interface StopwatchHowToPlayModalProps {
  onClose: () => void;
}

export const StopwatchHowToPlayModal: React.FC<StopwatchHowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-500/10 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl shadow-inner">
              ⏱️
            </div>
            <div>
              <h2 className="text-lg font-serif font-black text-cyan-300">
                Stopwatch Precision Duel — How to Play
              </h2>
              <p className="text-xs text-slate-400">
                Test your split-second reflex and internal clock precision!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* Objective */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
              <Target className="w-5 h-5" />
              <span>The Main Objective</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-200">
              Each round, a <strong>Target Time</strong> is announced (e.g. <span className="font-mono text-cyan-300 font-bold">5.000s</span>, <span className="font-mono text-cyan-300 font-bold">7.250s</span>, <span className="font-mono text-cyan-300 font-bold">10.000s</span>). When the 3-2-1 countdown ends, the stopwatch ticks. Your mission is to press <strong>STOP</strong> at the exact target moment!
            </p>
          </div>

          {/* Scoring Rules Grid */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Official Scoring System</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                    Exact Match
                  </span>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    +2 Points
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Stop the timer with <strong className="text-emerald-300 font-mono">0.000s</strong> difference to land a Bullseye!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase">
                    Nearest Time
                  </span>
                  <div className="text-xl font-black text-cyan-400 mt-1">
                    +1 Point
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    If no exact match, the player/team closest to the target wins the round!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                    Draw / Tie
                  </span>
                  <div className="text-xl font-black text-amber-400 mt-1">
                    +1 Point Each
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    If two or more players/teams tie with equal closest difference, both receive equal points!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Game Modes */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>3 Play Modes Available</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" /> 1. Play vs Bot
                </div>
                <p className="text-[11px] text-slate-400">
                  Solo practice against smart AI with Easy, Medium, Hard, and Expert reaction curves.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> 2. Play with Friends
                </div>
                <p className="text-[11px] text-slate-400">
                  Private room with 6-character code, invite link, QR code, and WhatsApp share.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" /> 3. Online Random
                </div>
                <p className="text-[11px] text-slate-400">
                  Instant quick matchmaking against online players across the web.
                </p>
              </div>
            </div>
          </div>

          {/* Formats: Single vs Team */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Single vs Team Format</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-200">👤 Single (1v1 / Free-For-All)</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Individual scoreboard where every courtier competes for themselves.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-bold text-slate-200">🔴 Team Red vs 🔵 Team Blue</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Join teams! Team scores combine to decide which squad has superior timing.
                </p>
              </div>
            </div>
          </div>

          {/* Pro-Tips */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Pro Gamer Tip:
            </div>
            <p className="text-[11px] leading-relaxed">
              You can press the big on-screen <strong className="text-white">STOP</strong> button or hit the <strong className="text-white">SPACEBAR</strong> key on desktop keyboard for hyper-fast response!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            I Got It — Let's Play!
          </button>
        </div>

      </div>
    </div>
  );
};
