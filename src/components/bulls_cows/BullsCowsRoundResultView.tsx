import React from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Sparkles, 
  RotateCcw, 
  LogOut, 
  Clock, 
  Hash, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { BullsCowsGameState } from '../../types/bullsCows';
import { sound } from '../../utils/sound';

interface BullsCowsRoundResultViewProps {
  gameState: BullsCowsGameState;
  currentUserId: string;
  onRestartGame: () => void;
  onLeaveGame: () => void;
}

export const BullsCowsRoundResultView: React.FC<BullsCowsRoundResultViewProps> = ({
  gameState,
  currentUserId,
  onRestartGame,
  onLeaveGame
}) => {
  const isFinalPodium = gameState.phase === 'FINAL_PODIUM';
  const me = gameState.players.find(p => p.id === currentUserId);
  const isHost = me?.isHost || false;

  // Sorted players
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    if (isFinalPodium) {
      return b.score - a.score;
    }
    // Round score first, then guesses count, then solve time
    if (b.roundScore !== a.roundScore) return b.roundScore - a.roundScore;
    if (a.hasSolved && !b.hasSolved) return -1;
    if (!a.hasSolved && b.hasSolved) return 1;
    return a.guessesCount - b.guessesCount;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 select-none animate-fadeIn flex flex-col justify-between min-h-[85vh]">
      
      {/* Top Banner / Celebration */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-sm">
          {isFinalPodium ? <Crown className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
          <span>{isFinalPodium ? 'MATCH CHAMPIONSHIP PODIUM' : `ROUND ${gameState.currentRound} COMPLETE`}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-emerald-400">
          {isFinalPodium ? 'VICTORY CELEBRATION' : 'ROUND RESULTS'}
        </h1>

        {/* Revealed Secret Target Word */}
        {gameState.roundWinningWord && (
          <div className="inline-block p-4 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 shadow-2xl">
            <span className="text-[11px] font-mono font-bold text-slate-400 block mb-1 uppercase tracking-widest">
              SECRET TARGET WORD WAS
            </span>
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {gameState.roundWinningWord.split('').map((char, idx) => (
                <div
                  key={idx}
                  className="w-10 h-12 sm:w-12 sm:h-14 rounded-2xl bg-emerald-600 border-2 border-emerald-400 text-white font-mono font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30"
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between px-2">
          <span>PLAYER RANKINGS</span>
          <span>{isFinalPodium ? 'TOTAL SCORE' : 'ROUND SCORE'}</span>
        </div>

        <div className="space-y-2.5">
          {sortedPlayers.map((p, idx) => {
            const isMe = p.id === currentUserId;
            let rankBadge = `${idx + 1}`;
            let rankColor = 'bg-slate-800 text-slate-300 border-slate-700';

            if (idx === 0) {
              rankBadge = '🥇';
              rankColor = 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20';
            } else if (idx === 1) {
              rankBadge = '🥈';
              rankColor = 'bg-slate-300/20 text-slate-200 border-slate-300/50';
            } else if (idx === 2) {
              rankBadge = '🥉';
              rankColor = 'bg-amber-800/20 text-amber-500 border-amber-800/50';
            }

            return (
              <div
                key={p.id}
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isMe
                    ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm font-mono ${rankColor}`}>
                    {rankBadge}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                    {p.avatar}
                  </div>

                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {p.isBot && <span className="text-[9px] text-slate-500 font-mono">(BOT)</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      {p.hasSolved ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          ✓ Solved in {p.guessesCount} {p.guessesCount === 1 ? 'guess' : 'guesses'}
                        </span>
                      ) : (
                        <span className="text-slate-500">Did not solve</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Scores */}
                <div className="text-right">
                  <div className="text-base sm:text-xl font-black font-mono text-emerald-400">
                    {isFinalPodium ? `${p.score} pts` : `+${p.roundScore} pts`}
                  </div>
                  {!isFinalPodium && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Total: {p.score} pts
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <button
          onClick={() => {
            sound.playClick();
            onLeaveGame();
          }}
          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit to Lobby</span>
        </button>

        {isFinalPodium ? (
          isHost && (
            <button
              onClick={() => {
                sound.playVictory();
                onRestartGame();
              }}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          )
        ) : (
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Next round starts in {gameState.timeRemaining}s...</span>
          </div>
        )}
      </div>

    </div>
  );
};
