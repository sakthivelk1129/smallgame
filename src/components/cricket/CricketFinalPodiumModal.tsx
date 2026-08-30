import React from 'react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  RotateCcw, 
  LogOut, 
  Sparkles, 
  Award,
  Layers,
  Zap
} from 'lucide-react';
import { CricketGameState } from '../../types/cricket';
import { sound } from '../../utils/sound';

interface CricketFinalPodiumModalProps {
  gameState: CricketGameState;
  currentUserId: string;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export const CricketFinalPodiumModal: React.FC<CricketFinalPodiumModalProps> = ({
  gameState,
  currentUserId,
  onPlayAgain,
  onLeave
}) => {
  const isHost = gameState.hostId === currentUserId;
  const rankings = gameState.finalRankings || [];
  const champion = rankings[0];
  const isMeChampion = champion?.playerId === currentUserId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center text-slate-100">
        
        {/* Trophy & Champion Crown */}
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 animate-bounce">
            🏆
          </div>
          <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            MATCH CONCLUSION • {gameState.settings.gameMode === 'ELIMINATION' ? 'ELIMINATION' : `${gameState.maxRounds} ROUNDS`}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            {champion ? `${champion.name} IS THE CHAMPION!` : 'MATCH OVER!'}
          </h2>
          <p className="text-xs text-slate-400">
            {isMeChampion 
              ? '👑 Congratulations! You conquered the cricket pitch!' 
              : `Well fought! ${champion?.name || 'Winner'} takes the championship trophy.`}
          </p>
        </div>

        {/* Podium Standings List */}
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
          {rankings.map((rankEntry, idx) => {
            const isMe = rankEntry.playerId === currentUserId;
            const isFirst = idx === 0;

            return (
              <div
                key={rankEntry.playerId}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                    : isMe
                    ? 'bg-sky-500/10 border-sky-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {/* Left: Rank & Avatar */}
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-sm font-black font-mono ${
                    idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>

                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                    {rankEntry.avatar}
                  </div>

                  <div className="text-left">
                    <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      <span>{rankEntry.name}</span>
                      {isMe && <span className="text-[10px] text-sky-400 font-normal">(You)</span>}
                    </div>
                    {rankEntry.bestStat && (
                      <div className="text-[10px] text-slate-400">
                        Fav Stat: <strong className="text-amber-300">{rankEntry.bestStat.toUpperCase()}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Cards Left & Rounds Won */}
                <div className="text-right text-xs font-mono">
                  <div className="font-bold text-amber-400">
                    {rankEntry.cardsLeft} Cards
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {rankEntry.roundsWon} Rounds Won
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onLeave();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>EXIT TO HUB</span>
          </button>

          {isHost && (
            <button
              onClick={() => {
                sound.playClick();
                onPlayAgain();
              }}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
