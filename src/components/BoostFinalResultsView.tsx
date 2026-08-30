import React, { useEffect } from 'react';
import { Trophy, Medal, Sparkles, RefreshCw, Home, Flame, Clock } from 'lucide-react';
import { BoostGameState, BoostLeaderboardEntry } from '../types/boost';
import { sound } from '../utils/sound';

interface BoostFinalResultsViewProps {
  gameState: BoostGameState;
  currentSocketId: string;
  onRestart: () => void;
  onBackToArcade: () => void;
}

export const BoostFinalResultsView: React.FC<BoostFinalResultsViewProps> = ({
  gameState,
  currentSocketId,
  onRestart,
  onBackToArcade
}) => {
  const leaderboard = gameState.finalLeaderboard || [];
  const champion = leaderboard[0];
  const isHost = gameState.hostId === currentSocketId;

  useEffect(() => {
    sound.playBoostWin();
  }, []);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none max-w-2xl mx-auto w-full space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>TOURNAMENT COMPLETE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
          🏆 BOOST CHAMPIONSHIP
        </h2>
        <p className="text-xs text-slate-400">
          Completed {gameState.totalRounds} Rounds of High-Speed Slip Battles
        </p>
      </div>

      {/* Champion Podium Spotlight */}
      {champion && (
        <div className="w-full bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl shadow-amber-500/20 relative">
          
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-2xl mx-auto animate-bounce">
              {champion.avatar}
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
              👑 1
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono font-black uppercase tracking-widest text-amber-400">
              GRAND CHAMPION
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-slate-100">
              {champion.playerName}
            </h3>
          </div>

          <div className="inline-flex items-center gap-3 bg-slate-950 border border-amber-500/40 px-5 py-2 rounded-2xl">
            <span className="text-xs text-slate-400 font-bold uppercase">Total Score:</span>
            <span className="text-xl font-mono font-black text-amber-300">{champion.totalScore} PTS</span>
          </div>

        </div>
      )}

      {/* Full Leaderboard Table with Tiebreaker columns */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left px-1">
          Final Rankings & Tiebreakers
        </div>

        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.playerId}
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                entry.rank === 1
                  ? 'bg-amber-950/30 border-amber-400/50 text-amber-200'
                  : entry.rank === 2
                  ? 'bg-slate-950 border-slate-700 text-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-sm w-5 text-center">
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </span>
                <span className="text-xl">{entry.avatar}</span>
                <div>
                  <div className="font-bold text-slate-100">{entry.playerName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {entry.roundWins} Wins • Fastest: {entry.fastestBoostSeconds ? `${entry.fastestBoostSeconds}s` : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="font-mono font-black text-base text-amber-400">
                {entry.totalScore} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={() => {
            sound.playClick();
            onBackToArcade();
          }}
          className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Exit to Arcade</span>
        </button>

        {isHost && (
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="flex-1 py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rematch (Play Again)</span>
          </button>
        )}
      </div>

    </div>
  );
};
