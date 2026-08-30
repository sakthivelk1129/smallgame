import React from 'react';
import { 
  X, 
  Trophy, 
  Crown, 
  Zap, 
  Swords, 
  ShieldCheck, 
  Layers, 
  HelpCircle,
  Shuffle
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface CricketHowToPlayModalProps {
  onClose: () => void;
}

export const CricketHowToPlayModal: React.FC<CricketHowToPlayModalProps> = ({
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-2xl max-h-[85vh] bg-slate-950 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              🏏
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-300">
                HOW TO PLAY CRICKET CARD BATTLE
              </h2>
              <p className="text-xs text-slate-400">
                Official Rules & Comparison Mechanics (2–8 Players)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-300 leading-relaxed">
          
          {/* Rule 1: The 1,000 Cards Pool */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
              <Layers className="w-4 h-4" />
              <span>1. 1,000 UNIQUE PLAYERS POOL</span>
            </div>
            <p>
              Each match deals random cards from a global pool of 1,000 unique international cricket players. 
              <strong> No two players can ever receive the same card in the same match!</strong>
            </p>
          </div>

          {/* Rule 2: 9 Battle Stats & Rank Rule */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
              <Crown className="w-4 h-4" />
              <span>2. 9 BATTLE STATS (CRITICAL RANK RULE)</span>
            </div>
            <p>
              Every player card features 4 Batting Stats and 4 Bowling Stats (1–100, where <strong>highest wins</strong>):
            </p>
            <div className="grid grid-cols-2 gap-2 my-2 font-mono text-[11px]">
              <div className="p-2 rounded-xl bg-slate-950 border border-sky-500/20 text-sky-300">
                🏏 <strong>Batting:</strong> Average, Strike Rate, Power, Consistency
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-rose-500/20 text-rose-300">
                🎯 <strong>Bowling:</strong> Average, Pace, Accuracy, Wicket Ability
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              ⚠️ <strong>RANK INVERSION:</strong> For Global Rank (#1 to #1000), <strong>lowest number wins!</strong> (Rank #1 Sachin/Bradman beats Rank #2 Virat).
            </div>
          </div>

          {/* Rule 3: Gameplay Cycle */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
              <Swords className="w-4 h-4" />
              <span>3. TURN-BASED COMBAT LOOP</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
              <li><strong>Stat Selection:</strong> The starting player examines their top card and picks their strongest stat (15s timer).</li>
              <li><strong>Reveal & Compare:</strong> All other players reveal their top card for that locked stat.</li>
              <li><strong>Winner Takes All:</strong> The player with the highest stat (or lowest rank) collects all played cards to the bottom of their deck!</li>
              <li><strong>Starter Momentum:</strong> The round winner starts the next round and chooses the next stat!</li>
            </ol>
          </div>

          {/* Rule 4: Tie-Breaker Sudden Death */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-yellow-400">
              <Zap className="w-4 h-4" />
              <span>4. TIE-BREAKER SUDDEN DEATH</span>
            </div>
            <p>
              If two or more players tie with the exact same highest stat value:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>All cards from the tied round stay in the <strong>Accumulated Pot</strong>.</li>
              <li>Tied players immediately reveal their <strong>next card</strong> comparing the same locked stat.</li>
              <li>The ultimate winner collects the entire pot!</li>
            </ul>
          </div>

          {/* Rule 5: Game Modes */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-400">
              <Trophy className="w-4 h-4" />
              <span>5. GAME MODES</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>Fixed Rounds:</strong> Play for a set number of rounds (10, 20, 30). The player with the most cards at the end wins!</li>
              <li><strong>Elimination:</strong> Players who run out of cards are eliminated. Last standing player is crowned Cricket Champion!</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 text-center">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
          >
            LET'S PLAY CRICKET CARD BATTLE
          </button>
        </div>

      </div>
    </div>
  );
};
