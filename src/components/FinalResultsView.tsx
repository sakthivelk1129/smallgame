import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  RotateCcw, 
  PlusCircle, 
  Home, 
  Award, 
  ShieldCheck, 
  Zap, 
  Users 
} from 'lucide-react';
import { GameState, UserProfile } from '../types/game';
import { sound } from '../utils/sound';

interface FinalResultsViewProps {
  gameState: GameState;
  currentUserId: string;
  user: UserProfile;
  onRestartGame: () => void;
  onCreateNewRoom: () => void;
  onReturnToHub: () => void;
}

export const FinalResultsView: React.FC<FinalResultsViewProps> = ({
  gameState,
  currentUserId,
  user,
  onRestartGame,
  onCreateNewRoom,
  onReturnToHub
}) => {
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  const localPlayer = gameState.players.find(p => p.id === currentUserId);
  const isHost = localPlayer?.isHost || false;
  const myRank = sortedPlayers.findIndex(p => p.id === currentUserId) + 1;

  useEffect(() => {
    sound.playRoyalFanfare();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6 animate-fadeIn">
      
      {/* Grand Title Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Match Complete • {gameState.maxRounds} Rounds Played</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
          👑 Royal Champion: <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">{winner?.name}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Honored sovereign of the court with <strong className="text-amber-400 font-mono">{winner?.score} points</strong>
        </p>
      </div>

      {/* Podium Display (Top 3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-lg mx-auto w-full pt-4">
        
        {/* 2nd Place (Silver) */}
        {second && (
          <div className="flex flex-col items-center text-center">
            <div className="text-3xl mb-1">{second.avatar}</div>
            <div className="font-bold text-xs text-slate-200 truncate w-full">{second.name}</div>
            <div className="text-xs font-mono text-slate-400 font-bold mb-2">{second.score} pts</div>
            <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl border-t-2 border-slate-400 flex flex-col items-center justify-center p-2 shadow-lg">
              <span className="text-2xl">🥈</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase">2nd Place</span>
            </div>
          </div>
        )}

        {/* 1st Place (Gold) */}
        {winner && (
          <div className="flex flex-col items-center text-center -mt-4">
            <div className="text-4xl sm:text-5xl mb-1 animate-bounce">{winner.avatar}</div>
            <div className="font-bold text-sm text-amber-300 truncate w-full">{winner.name}</div>
            <div className="text-sm font-mono text-amber-400 font-black mb-2">{winner.score} pts</div>
            <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-400 rounded-t-2xl border-t-2 border-amber-200 flex flex-col items-center justify-center p-2 shadow-2xl shadow-amber-500/20 text-slate-950 font-black">
              <Crown className="w-7 h-7 fill-current mb-0.5 text-slate-950 animate-pulse" />
              <span className="text-xs uppercase tracking-wider">CHAMPION</span>
            </div>
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {third && (
          <div className="flex flex-col items-center text-center">
            <div className="text-3xl mb-1">{third.avatar}</div>
            <div className="font-bold text-xs text-slate-200 truncate w-full">{third.name}</div>
            <div className="text-xs font-mono text-slate-400 font-bold mb-2">{third.score} pts</div>
            <div className="w-full h-18 sm:h-20 bg-gradient-to-t from-amber-950/80 to-amber-900/60 rounded-t-2xl border-t-2 border-amber-700 flex flex-col items-center justify-center p-2 shadow-lg">
              <span className="text-2xl">🥉</span>
              <span className="text-[10px] font-bold text-amber-500 uppercase">3rd Place</span>
            </div>
          </div>
        )}

      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Final Court Leaderboard</span>
        </h3>

        <div className="divide-y divide-slate-800">
          {sortedPlayers.map((p, idx) => {
            const isMe = p.id === currentUserId;
            return (
              <div
                key={p.id}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-between text-xs transition-colors ${
                  isMe ? 'bg-amber-500/10 border border-amber-500/30' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono font-black text-slate-400 w-5">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                  </span>
                  <span className="text-lg">{p.avatar}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {isMe && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="font-mono font-black text-sm text-amber-400">
                  {p.score} pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Rewards & XP Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Match Rewards Claimed!</div>
            <div className="text-[11px] text-slate-400">
              You finished rank #{myRank} • Gained <strong className="text-amber-400 font-mono">+{myRank === 1 ? '100' : myRank <= 3 ? '50' : '20'} XP</strong>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold text-purple-300">Level {user.level}</div>
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {isHost && (
          <button
            onClick={() => {
              sound.playRoyalFanfare();
              onRestartGame();
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN (SAME ROOM)</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.playClick();
            onCreateNewRoom();
          }}
          className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>NEW ROOM</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onReturnToHub();
          }}
          className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-slate-800 transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>GAMES HUB</span>
        </button>
      </div>

    </div>
  );
};
