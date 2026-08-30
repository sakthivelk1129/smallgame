import React from 'react';
import { 
  X, 
  Crown, 
  Gamepad2, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Globe, 
  Mail, 
  Layers, 
  Award,
  Zap
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface AboutUsModalProps {
  onClose: () => void;
  onOpenContact?: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ onClose, onOpenContact }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 text-xl font-black shadow-md">
              👑
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-black text-slate-100 flex items-center gap-2">
                <span>About Small Paper Game</span>
              </h2>
              <p className="text-xs text-amber-400">Authentic Multiplayer Paper Slips & Kingdom Chit Games Online</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          {/* Mission */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Our Vision & Mission</span>
            </div>
            <p className="text-slate-300 text-xs">
              <strong>Small Paper Game</strong> was built to bring timeless classroom memories, traditional paper slip games, royal court deduction chits, and sports card classics into the modern digital age. We provide seamless, low-latency, zero-install multiplayer paper gaming that runs effortlessly on all mobile and desktop web browsers.
            </p>
          </div>

          {/* Games in the Arcade */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-400 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-indigo-400" />
              <span>Featured Game Portfolio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>👑 Kingdom Court (King & Thief Chits)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  The legendary royal court deduction paper chit game (historically Raja Rani) with 4 to 12 players, secret roles, Police interrogation, alibis, and special character abilities.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <span>📜 Small Paper Game (BOOST Slips)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  The viral paper slip game (சீட்டு ஆட்டம்). Enter secret words, draw folded paper chits on your turn, and shout BOOST when you hold 3 matching slips!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>🐂 Bulls & Cows (Word Mastermind)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Classic 1v1 and solo duel deduction game across 3 to 7 letters with Bulls for exact matches and Cows for position mismatches.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-yellow-300 flex items-center gap-1.5">
                  <span>🏏 Cricket Card Battle (1,000 Cards)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Extensive 1,000 international cricket card database with 8 authentic batting & bowling statistics, fast trump card rounds, and public matchmaking.
                </p>
              </div>
            </div>
          </div>

          {/* Technological Craft & Anti-Cheat */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Technology & Fair Play Standards</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Every round is executed with a 100% server-authoritative WebSocket engine. Secret roles, dealt paper pools, and trump cards are computed server-side to ensure zero client modification, cheat prevention, and synchronized real-time audio/visual game loops.
            </p>
          </div>

          {/* Creator & Contact Info */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-200">Developed with ❤️ by Sakthivel & the Arcade Team</div>
              <div className="text-[11px] text-slate-400">Official Contact: sakthivelk1129@gmail.com</div>
            </div>

            {onOpenContact && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenContact();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                Contact & Feedback
              </button>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
