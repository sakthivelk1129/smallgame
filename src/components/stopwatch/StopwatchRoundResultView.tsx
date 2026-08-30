import React from 'react';
import { 
  Award, 
  Timer, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Crown, 
  TrendingUp, 
  Scale, 
  ArrowRight,
  Zap,
  Flame
} from 'lucide-react';
import { StopwatchGameState, StopwatchPlayerRoundResult } from '../../types/stopwatch';

interface StopwatchRoundResultViewProps {
  gameState: StopwatchGameState;
  currentUserId: string;
}

export const StopwatchRoundResultView: React.FC<StopwatchRoundResultViewProps> = ({
  gameState,
  currentUserId
}) => {
  const currentResult = gameState.roundHistory[gameState.roundHistory.length - 1];
  const isTeamFormat = gameState.settings.format === 'team';
  const targetTime = gameState.targetTime;

  // Sort players by best difference (closest first)
  const sortedPlayers = [...(currentResult?.playerResults || [])].sort((a, b) => a.difference - b.difference);

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 py-2 px-3 sm:px-4 animate-fadeIn select-none">
      
      {/* Top Banner: Round Winner / Result Summary */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border-2 border-cyan-500/40 shadow-2xl text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider">
          <Timer className="w-3.5 h-3.5" />
          <span>ROUND {gameState.currentRound} OF {gameState.maxRounds} COMPLETED</span>
        </div>

        <h2 className="text-xl sm:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-100 to-cyan-400">
          {currentResult?.summaryText || 'Round Concluded!'}
        </h2>

        <div className="text-xs text-slate-300 flex items-center justify-center gap-3">
          <span>Target: <strong className="font-mono text-cyan-300 text-sm">{targetTime.toFixed(2)}s</strong></span>
          <span>•</span>
          <span className="text-amber-400 font-bold">Next round starting in {gameState.countdownTimer}s...</span>
        </div>
      </div>

      {/* Target Comparison & Accuracy Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Player Precision Breakdown</span>
        </h3>

        <div className="space-y-2.5">
          {sortedPlayers.map((res, index) => {
            const isMe = res.playerId === currentUserId;
            const delta = res.stoppedTime - targetTime;
            const deltaSign = delta > 0 ? `+${delta.toFixed(2)}s` : `${delta.toFixed(2)}s`;

            return (
              <div
                key={res.playerId}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  res.isExactMatch
                    ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : res.isWinner
                    ? 'bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 border-cyan-400/80 shadow-md'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                {/* Player identity & Rank */}
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
                    index === 0
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{index + 1}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shadow-inner">
                    {res.avatar}
                  </div>

                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span>{res.playerName}</span>
                      {isMe && <span className="text-[10px] text-cyan-400 font-mono font-bold">(You)</span>}
                      {res.team !== 'none' && (
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          res.team === 'red' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {res.team.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Stopped at: <strong className="font-mono text-slate-200">{res.stoppedTime.toFixed(2)}s</strong></span>
                      <span>•</span>
                      <span>Diff: <strong className="font-mono text-amber-300">{res.difference.toFixed(2)}s</strong></span>
                    </div>
                  </div>
                </div>

                {/* Score & Badge Award */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Delta tag */}
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                    res.isExactMatch
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : delta > 0
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {res.isExactMatch ? '🎯 BULLSEYE 0.00s' : deltaSign}
                  </span>

                  {/* Points earned */}
                  <div className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1 ${
                    res.pointsGained === 2
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : res.pointsGained === 1
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {res.pointsGained > 0 ? `+${res.pointsGained} PTS` : '0 PTS'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Summary Table */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Match Standings (After Round {gameState.currentRound}/{gameState.maxRounds})</span>
        </h3>

        {/* Team Score Bar if Team Format */}
        {isTeamFormat && (
          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between">
              <span className="font-bold text-rose-300 text-sm">🔴 TEAM RED</span>
              <span className="font-mono text-2xl font-black text-rose-400">{gameState.teamScores.red} PTS</span>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-sm">🔵 TEAM BLUE</span>
              <span className="font-mono text-2xl font-black text-cyan-400">{gameState.teamScores.blue} PTS</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[...gameState.players]
            .sort((a, b) => b.score - a.score)
            .map((p, idx) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                  <span className="text-base">{p.avatar}</span>
                  <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                </div>
                <div className="font-mono font-black text-amber-400 text-sm">
                  {p.score} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
};
