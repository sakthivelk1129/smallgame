import React from 'react';
import { 
  CricketGameState, 
  CricketPlayerState, 
  StatKey, 
  CricketTableCard 
} from '../../types/cricket';
import { CricketPlayerCard } from './CricketPlayerCard';
import { 
  Trophy, 
  Flame, 
  Clock, 
  Zap, 
  Sparkles, 
  Shuffle, 
  Swords, 
  Crown, 
  ShieldAlert,
  Award,
  Layers
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface CricketVirtualTableProps {
  gameState: CricketGameState;
  currentUserId: string;
  onSelectStat: (statKey: StatKey) => void;
  onPlayCard: () => void;
  onShuffleDeck: () => void;
}

export const CricketVirtualTable: React.FC<CricketVirtualTableProps> = ({
  gameState,
  currentUserId,
  onSelectStat,
  onPlayCard,
  onShuffleDeck
}) => {
  const me = gameState.players.find(p => p.id === currentUserId);
  const isStarter = gameState.starterId === currentUserId;
  const isMyTurnToSelect = isStarter && gameState.phase === 'STAT_SELECTION' && !gameState.statLocked;
  const hasPlayedCard = gameState.tableCards.some(tc => tc.playerId === currentUserId);
  const canPlayCard = gameState.phase === 'REVEAL_COMPARE' && !hasPlayedCard && !me?.eliminated;

  const activePlayers = gameState.players.filter(p => !p.eliminated);
  const isFinalDuel = activePlayers.length === 2 && gameState.settings.gameMode === 'ELIMINATION';
  const isFinalThree = activePlayers.length === 3 && gameState.settings.gameMode === 'ELIMINATION';

  // Opponents list (other players positioned around table)
  const opponents = gameState.players.filter(p => p.id !== currentUserId);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-between min-h-[85vh] p-2 sm:p-4 space-y-4 select-none relative animate-fadeIn">
      
      {/* 1. TOP HEADER HUD: Round Counter, Game Mode & Elimination alerts */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 border border-amber-500/20 backdrop-blur shadow-lg">
        
        {/* Left: Round info & Mode */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg font-black text-amber-400">
            🏏
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-wider">
                ROUND {gameState.currentRound}
              </span>
              {gameState.settings.gameMode === 'FIXED_ROUNDS' && (
                <span className="text-xs font-mono text-slate-400">
                  / {gameState.maxRounds}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {gameState.settings.gameMode === 'ELIMINATION' ? '⚡ Elimination Duel' : '🏆 Fixed Rounds Battle'}
            </div>
          </div>
        </div>

        {/* Center: Dynamic Status Banner */}
        <div className="flex items-center gap-2">
          {isFinalDuel && (
            <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-1.5 animate-pulse">
              <Swords className="w-3.5 h-3.5" />
              <span>FINAL DUEL (1 VS 1)</span>
            </div>
          )}

          {isFinalThree && (
            <div className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-1.5 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>FINAL 3 SURVIVORS</span>
            </div>
          )}

          {gameState.isTie && (
            <div className="px-3 py-1 rounded-xl bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-1.5 animate-bounce">
              <Zap className="w-3.5 h-3.5" />
              <span>TIE-BREAKER SUDDEN DEATH!</span>
            </div>
          )}

          {/* Pot cards counter if ties accumulated */}
          {gameState.accumulatedPotCardsCount > 0 && (
            <div className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>POT: {gameState.accumulatedPotCardsCount} CARDS</span>
            </div>
          )}
        </div>

        {/* Right: Turn Timer */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold ${
            gameState.timeRemaining <= 3 
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-ping' 
              : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{gameState.timeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* 2. OPPONENTS SEATING STRIP (Top of table) */}
      <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-1">
        {opponents.map((opp) => {
          const isOppStarter = gameState.starterId === opp.id;
          const oppPlayed = gameState.tableCards.find(tc => tc.playerId === opp.id);

          return (
            <div 
              key={opp.id}
              className={`p-2 px-3 rounded-2xl border transition-all flex items-center gap-2 shadow-md ${
                opp.eliminated
                  ? 'bg-slate-950/50 border-slate-900 opacity-40 grayscale'
                  : isOppStarter
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-amber-500/10 ring-2 ring-amber-400/20'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base">
                  {opp.avatar}
                </div>
                {isOppStarter && (
                  <span className="absolute -top-1.5 -right-1.5 text-xs" title="Starting Player">
                    👑
                  </span>
                )}
              </div>

              {/* Name & Deck count */}
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-200 max-w-[90px] truncate">
                    {opp.name}
                  </span>
                  {opp.isBot && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      BOT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono">
                  {opp.eliminated ? (
                    <span className="text-rose-400 font-bold">ELIMINATED</span>
                  ) : (
                    <>
                      <span className="text-amber-400 font-bold">{opp.deckCount}</span>
                      <span className="text-slate-500">cards</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status pill: Has played card or choosing */}
              <div>
                {opp.eliminated ? (
                  <span className="text-xs">💀</span>
                ) : oppPlayed ? (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold">
                    READY
                  </span>
                ) : isOppStarter && gameState.phase === 'STAT_SELECTION' ? (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold animate-pulse">
                    CHOOSING
                  </span>
                ) : (
                  <span className="text-slate-600 text-xs">⏳</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. CENTER PITCH ARENA / BATTLE TABLE */}
      <div className="w-full flex-1 min-h-[320px] rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/30 p-4 sm:p-6 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden">
        
        {/* Cricket Pitch Oval Turf Design */}
        <div className="absolute inset-4 rounded-[40px] border-2 border-dashed border-emerald-500/20 pointer-events-none" />
        <div className="absolute inset-10 rounded-[60px] bg-emerald-950/10 pointer-events-none" />

        {/* Phase Announcement Banner */}
        <div className="z-10 mb-4 text-center space-y-1">
          {gameState.phase === 'PRE_GAME_SHUFFLE' && (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
                <Shuffle className="w-3.5 h-3.5" />
                <span>PRE-MATCH SHUFFLE (OPTIONAL)</span>
              </div>
              <p className="text-xs text-slate-400">You may shuffle your starting hand before Round 1 begins!</p>
            </div>
          )}

          {gameState.phase === 'STAT_SELECTION' && (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isStarter ? '👑 YOUR TURN TO SELECT A STAT!' : `👑 ${gameState.starterName} IS CHOOSING A STAT...`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isStarter ? 'Click any stat on your card below to initiate the challenge!' : 'Wait for starter to choose...'}
              </p>
            </div>
          )}

          {gameState.phase === 'REVEAL_COMPARE' && gameState.selectedStat && (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs sm:text-sm font-black tracking-widest shadow-lg animate-pulse">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>LOCKED STAT: {gameState.selectedStat.toUpperCase()}</span>
              </div>
              <p className="text-xs text-slate-300">
                {hasPlayedCard ? 'Waiting for remaining players to reveal...' : '👉 Reveal your top card to compare!'}
              </p>
            </div>
          )}

          {gameState.phase === 'ROUND_SUMMARY' && (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-amber-500 text-slate-950 text-xs sm:text-sm font-black tracking-widest shadow-xl animate-bounce">
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>{gameState.roundWinnerName} WINS ROUND {gameState.currentRound}!</span>
              </div>
            </div>
          )}
        </div>

        {/* Revealed Cards Battle Grid */}
        <div className="z-10 w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-2 overflow-x-auto">
          {gameState.tableCards.map((tc) => {
            const isMe = tc.playerId === currentUserId;
            return (
              <div key={tc.playerId} className="flex flex-col items-center gap-2 animate-scaleUp">
                {/* Player Tag with distinct Your Card vs Opponent/Bot Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-lg ${
                  isMe
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/90 border-indigo-500/60 text-indigo-200'
                }`}>
                  <span>{tc.avatar}</span>
                  <span className="max-w-[110px] truncate">{tc.playerName} {isMe ? '(YOU)' : ''}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-black ${
                    isMe ? 'bg-emerald-500/30 text-emerald-300' : 'bg-indigo-500/30 text-indigo-300'
                  }`}>
                    {isMe ? 'YOU' : 'OPPONENT'}
                  </span>
                  {tc.isWinner && (
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      👑 <span>WINNER</span>
                    </span>
                  )}
                </div>

                {/* Card */}
                <CricketPlayerCard
                  card={tc.card}
                  isInteractive={false}
                  selectedStat={gameState.selectedStat}
                  highlightStat={gameState.selectedStat}
                  isWinnerCard={tc.isWinner}
                  isTiedCard={gameState.isTie}
                  size="sm"
                />
              </div>
            );
          })}
        </div>

        {/* Play Card Action Button on Pitch if not yet revealed */}
        {canPlayCard && (
          <div className="z-20 mt-4">
            <button
              onClick={() => {
                sound.playClick();
                onPlayCard();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm tracking-wider shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2 animate-bounce"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>REVEAL & PLAY TOP CARD</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. BOTTOM USER SECTION: My Deck, Top Card & Interactive Stat Selection */}
      <div className="w-full bg-slate-900/90 border-2 border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Player Profile & Deck status */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-3xl shadow-inner">
              {me?.avatar || '🏏'}
            </div>
            {isStarter && (
              <span className="absolute -top-2 -right-2 text-base" title="Starter">
                👑
              </span>
            )}
          </div>

          <div className="text-left space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-100 text-base">
                {me?.name || 'You'} (You)
              </h4>
              {me?.currentStreak && me.currentStreak > 1 ? (
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-black flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>{me.currentStreak}x STREAK</span>
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">
                Cards Remaining: <strong className="text-amber-400 text-sm">{me?.deckCount || 0}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                Rounds Won: <strong className="text-emerald-400 text-sm">{me?.roundsWon || 0}</strong>
              </span>
            </div>

            {/* Pre-game shuffle button */}
            {gameState.phase === 'PRE_GAME_SHUFFLE' && !me?.hasShuffled && (
              <button
                onClick={() => {
                  sound.playClick();
                  onShuffleDeck();
                }}
                className="mt-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle Starting Hand</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Active Top Card with Interactive Selection if starter */}
        {me?.topCard ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center justify-end gap-1">
                <span>YOUR HAND CARD</span>
                {gameState.tableCards.some(tc => tc.playerId === currentUserId) && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">IN BATTLE</span>
                )}
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                {isMyTurnToSelect 
                  ? '👉 Click any stat on card to challenge' 
                  : gameState.tableCards.some(tc => tc.playerId === currentUserId)
                  ? 'Card is on the battle pitch'
                  : 'Ready for round comparison'}
              </div>
            </div>

            <CricketPlayerCard
              card={me.topCard}
              isInteractive={isMyTurnToSelect}
              selectedStat={gameState.selectedStat}
              highlightStat={gameState.selectedStat}
              onSelectStat={(key) => {
                if (isMyTurnToSelect) {
                  onSelectStat(key);
                }
              }}
              size="md"
            />
          </div>
        ) : me?.eliminated ? (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
            ❌ You have been eliminated from the battle! Spectating remaining rounds...
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono">
            No card available
          </div>
        )}

      </div>

    </div>
  );
};
