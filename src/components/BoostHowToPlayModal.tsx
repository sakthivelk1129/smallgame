import React from 'react';
import { X, Sparkles, Zap, CheckCircle2, Clock, Trophy, Flame } from 'lucide-react';
import { sound } from '../utils/sound';

interface BoostHowToPlayModalProps {
  onClose: () => void;
}

export const BoostHowToPlayModal: React.FC<BoostHowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-5 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl shadow-inner">
              🚀
            </div>
            <div>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-slate-100 flex items-center gap-2">
                <span>How to Play BOOST</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-sans font-bold">
                  Party Game
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Traditional Tamil Nadu Paper Slip Game • 2 to 6 Players
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8 Core Rules Cards */}
        <div className="space-y-3.5 text-xs text-slate-300">
          
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">
              1
            </div>
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">Enter UNIQUE Secret Words</strong>
              At the start of each round, every player submits ONE secret word (e.g. <em>TIGER</em>, <em>APPLE</em>, <em>MANGO</em>). No two players in the room can submit the same word!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">
              2
            </div>
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">4-Card Starter Deal (3N + 1 Slips)</strong>
              The game creates 3 slips for every word plus 1 bonus slip. The starting player is dealt <strong>4 slips</strong> and every other player receives <strong>3 slips</strong>.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">
              3
            </div>
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">Only YOUR Words Are Visible</strong>
              On your screen, you see the words on your own sheets. All opponents' sheets are displayed face-down with words hidden until the round ends!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">
              4
            </div>
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">Rearrange & Shuffle Hand Order</strong>
              Whenever you want, click <strong>Shuffle Order</strong> or tap two cards to swap their positions (Slot 1, 2, 3, 4) so opponents can't memorize which card you just drew!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">
              5
            </div>
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">Rotating 4-Card Pick Cycle</strong>
              On your turn, click 1 of the face-down cards from the player currently holding 4 slips. You draw that card into your hand, and the 4-card role rotates to you!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/30 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-black shrink-0">
              6
            </div>
            <div>
              <strong className="text-rose-300 font-bold block mb-0.5">Collect 3 Matching Words & Hit BOOST!</strong>
              As soon as 3 of your sheets contain the SAME word (e.g. 3x <em>TIGER</em>), smash the glowing <strong>🚨 BOOST!</strong> button to win the round!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/20 text-emerald-300 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black shrink-0">
              7
            </div>
            <div>
              <strong className="text-emerald-300 font-bold block mb-0.5">Points & Speed Bonus</strong>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-300 mt-1">
                <li>🏆 <strong>Round Winner</strong>: +100 pts</li>
                <li>⚡ <strong>Speed Bonus</strong>: +25 pts (&lt;30s) • +15 pts (&lt;60s) • +10 pts (&lt;90s)</li>
                <li>🤝 <strong>Participation</strong>: +10 pts for all other players</li>
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black shrink-0">
              8
            </div>
            <div>
              <strong className="text-purple-300 font-bold block mb-0.5">Special Abilities (Special Mode)</strong>
              In Special Mode, players can activate:
              <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-[10px] text-slate-300">
                <span className="bg-slate-900 px-2 py-1 rounded">🔮 <strong>PEEK</strong>: Look at 1 rival sheet for 3s</span>
                <span className="bg-slate-900 px-2 py-1 rounded">⏱️ <strong>EXTRA TIME</strong>: +5s on your turn</span>
                <span className="bg-slate-900 px-2 py-1 rounded">🌪️ <strong>SHUFFLE</strong>: Reshuffle rivals' hands</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-500/20 transition-all cursor-pointer"
        >
          GOT IT! LET'S PLAY BOOST
        </button>

      </div>
    </div>
  );
};
