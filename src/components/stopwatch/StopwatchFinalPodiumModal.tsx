import React from 'react';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  RotateCcw, 
  LogOut, 
  Award, 
  Target, 
  Flame, 
  Users, 
  CheckCircle2,
  Share2
} from 'lucide-react';
import { StopwatchGameState } from '../../types/stopwatch';
import { sound } from '../../utils/sound';

interface StopwatchFinalPodiumModalProps {
  gameState: StopwatchGameState;
  currentUserId: string;
  onRematch: () => void;
  onExit: () => void;
}

export const StopwatchFinalPodiumModal: React.FC<StopwatchFinalPodiumModalProps> = ({
  gameState,
  currentUserId,
  onRematch,
  onExit
}) => {
  const localPlayer = gameState.players.find(p => p.id === currentUserId);
  const isHost = localPlayer?.isHost || false;
  const isTeamFormat = gameState.settings.format === 'team';

  // Sort players by total score
  const rankedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const winner = rankedPlayers[0];

  const redScore = gameState.teamScores.red;
  const blueScore = gameState.teamScores.blue;
  const winningTeam = redScore > blueScore ? 'red' : blueScore > redScore ? 'blue' : 'draw';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl max-w-2xl w-full max-h-[95vh] flex flex-col shadow-2xl shadow-cyan-500/20 overflow-hidden">
        
        {/* Top Celebration Header */}
        <div className="p-6 bg-gradient-to-b from-cyan-950 via-slate-900 to-slate-900 border-b border-cyan-500/30 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/10 blur-2xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-widest mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>MATCH CHAMPIONSHIP PODIUM</span>
          </div>

          {!isTeamFormat ? (
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                🎉 {winner?.name || 'Player'} Wins the Duel!
              </h2>
              <p className="text-xs text-slate-300">
                Supreme stopwatch reflex & rhythm champion after {gameState.maxRounds} rounds!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-100 to-cyan-400">
                {winningTeam === 'draw'
                  ? '🤝 It is an Epic Team Tie!'
                  : winningTeam === 'red'
                  ? '🔴 TEAM RED IS VICTORIOUS!'
                  : '🔵 TEAM BLUE IS VICTORIOUS!'}
              </h2>
              <div className="text-sm font-bold font-mono text-slate-300 mt-1">
                🔴 RED {redScore} PTS &nbsp;|&nbsp; 🔵 BLUE {blueScore} PTS
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content: Podium & Stats */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Top 3 Podium Visual (for Single Mode) */}
          {!isTeamFormat && rankedPlayers.length >= 2 && (
            <div className="flex items-end justify-center gap-3 pt-4 pb-2">
              
              {/* Rank 2 (Silver) */}
              {rankedPlayers[1] && (
                <div className="flex flex-col items-center flex-1 max-w-[120px]">
                  <div className="text-2xl mb-1">{rankedPlayers[1].avatar}</div>
                  <div className="text-xs font-bold text-slate-200 truncate w-full text-center">
                    {rankedPlayers[1].name}
                  </div>
                  <div className="font-mono text-xs font-black text-slate-400">
                    {rankedPlayers[1].score} pts
                  </div>
                  <div className="w-full h-20 mt-2 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl border-t-2 border-slate-400 flex items-center justify-center font-black text-slate-300 text-lg shadow-lg">
                    🥈 2nd
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold Champion) */}
              {rankedPlayers[0] && (
                <div className="flex flex-col items-center flex-1 max-w-[140px] -mt-4">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mb-1">
                    <Crown className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl mb-1">{rankedPlayers[0].avatar}</div>
                  <div className="text-xs font-black text-amber-300 truncate w-full text-center">
                    {rankedPlayers[0].name}
                  </div>
                  <div className="font-mono text-sm font-black text-amber-400">
                    {rankedPlayers[0].score} pts
                  </div>
                  <div className="w-full h-28 mt-2 bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-2xl border-t-2 border-amber-200 flex items-center justify-center font-black text-slate-950 text-xl shadow-xl shadow-amber-500/30">
                    👑 1st
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {rankedPlayers[2] && (
                <div className="flex flex-col items-center flex-1 max-w-[120px]">
                  <div className="text-2xl mb-1">{rankedPlayers[2].avatar}</div>
                  <div className="text-xs font-bold text-slate-200 truncate w-full text-center">
                    {rankedPlayers[2].name}
                  </div>
                  <div className="font-mono text-xs font-black text-amber-600">
                    {rankedPlayers[2].score} pts
                  </div>
                  <div className="w-full h-14 mt-2 bg-gradient-to-t from-amber-950 to-amber-900 rounded-t-2xl border-t-2 border-amber-700 flex items-center justify-center font-black text-amber-400 text-base shadow-lg">
                    🥉 3rd
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Full Player Standings List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Final Scoreboard & Accuracy
            </h3>

            <div className="space-y-2">
              {rankedPlayers.map((p, index) => {
                const isMe = p.id === currentUserId;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      index === 0
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : isMe
                        ? 'bg-cyan-950/30 border-cyan-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-slate-500 w-5 text-center">
                        #{index + 1}
                      </span>
                      <span className="text-2xl">{p.avatar}</span>
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isMe && <span className="text-[10px] text-cyan-400">(You)</span>}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Best Diff: <span className="font-mono text-cyan-300 font-bold">{p.bestDiff !== undefined ? `${p.bestDiff.toFixed(2)}s` : 'N/A'}</span>
                          {p.exactMatchesCount ? ` • 🎯 ${p.exactMatchesCount} Bullseyes` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono text-lg font-black text-amber-400">
                      {p.score} <span className="text-xs font-normal text-slate-400">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onExit();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Main Menu</span>
          </button>

          {isHost ? (
            <button
              onClick={() => {
                sound.playRoyalFanfare();
                onRematch();
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN (REMATCH)</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Waiting for host to trigger rematch...
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
