import React, { useEffect } from 'react';
import { Trophy, Sparkles, Flame, Clock, ArrowRight, Zap, Crown } from 'lucide-react';
import { BoostGameState, BoostRoundWinner } from '../types/boost';
import { sound } from '../utils/sound';

interface BoostRoundResultViewProps {
  gameState: BoostGameState;
  currentSocketId: string;
  onNextRound: () => void;
}

export const BoostRoundResultView: React.FC<BoostRoundResultViewProps> = ({
  gameState,
  currentSocketId,
  onNextRound
}) => {
  const winner = gameState.roundWinner;
  const isHost = gameState.hostId === currentSocketId;
  const isLastRound = gameState.currentRound >= gameState.totalRounds;

  useEffect(() => {
    sound.playBoostWin();
  }, []);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none max-w-xl mx-auto w-full space-y-6 animate-fadeIn">
      
      {/* Celebration Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/40 text-rose-300 text-xs font-black animate-pulse">
          <Flame className="w-4 h-4 text-orange-400" />
          <span>ROUND {gameState.currentRound} CONQUERED!</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-yellow-200">
          🚀 MEGA BOOST VICTORY!
        </h2>
      </div>

      {/* Winner Spotlight Card */}
      {winner && (
        <div className="w-full bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-500/20 text-center space-y-5 relative overflow-hidden backdrop-blur-md">
          
          <div className="relative inline-block">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl mx-auto">
              {winner.avatar}
            </div>
            <Crown className="w-6 h-6 text-amber-400 absolute -top-3 -right-2 drop-shadow-md animate-bounce" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-100">
              {winner.playerName}
            </h3>
            <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">
              Collected 3 Matching Virtual Slips!
            </p>
          </div>

          {/* Winning Word Display */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Winning Word
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tracking-widest">
              3x "{winner.winningWord}"
            </div>
          </div>

          {/* All Player Hands Revealed */}
          {winner.allPlayerHandsRevealed && winner.allPlayerHandsRevealed.length > 0 && (
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2 text-left">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Revealed Hands at Round End:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {winner.allPlayerHandsRevealed.map((hand) => (
                  <div key={hand.playerId} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
                      <span>{hand.avatar}</span>
                      <span className="truncate">{hand.playerName}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                      {hand.cards.map((c, i) => (
                        <span key={i} className={`px-1.5 py-0.5 rounded ${c.word === winner.winningWord ? 'bg-rose-500/30 text-rose-300 font-bold border border-rose-500/40' : 'bg-slate-800 text-slate-300'}`}>
                          {c.word}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Points Breakdown Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Round Win</div>
              <div className="text-sm font-black text-emerald-400 font-mono">+100 pts</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Speed Bonus</div>
              <div className="text-sm font-black text-amber-400 font-mono">
                +{winner.fastestBonus || 0} pts
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Time Taken</div>
              <div className="text-sm font-black text-slate-200 font-mono flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{winner.durationSeconds}s</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Current Match Leaderboard */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left px-1">
          Current Standings After Round {gameState.currentRound}
        </div>

        <div className="space-y-1.5">
          {[...gameState.players]
            .sort((a, b) => b.score - a.score)
            .map((p, idx) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-slate-500 w-4">#{idx + 1}</span>
                  <span className="text-base">{p.avatar}</span>
                  <span className="font-bold text-slate-200 truncate max-w-[120px]">{p.name}</span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[11px] text-slate-400">{p.roundWins} Wins</span>
                  <span className="text-amber-400 font-black text-sm">{p.score} pts</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Host Trigger Action */}
      {isHost ? (
        <button
          onClick={() => {
            sound.playClick();
            onNextRound();
          }}
          className="w-full py-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>{isLastRound ? 'SHOW FINAL TOURNAMENT RESULTS' : `START ROUND ${gameState.currentRound + 1}`}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="text-xs text-slate-400 font-mono animate-pulse">
          ⏳ Waiting for host to advance to the next round...
        </div>
      )}

    </div>
  );
};
