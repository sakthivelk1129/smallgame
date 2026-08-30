import React, { useEffect, useState } from 'react';
import { Crown, CheckCircle2, XCircle, Clock, Award, Shield, AlertTriangle, Sparkles } from 'lucide-react';
import { GameState, AccusationData } from '../types/game';
import { ROLE_DEFINITIONS } from '../data/roles';
import { sound } from '../utils/sound';

interface RevealResultViewProps {
  gameState: GameState;
  accusation?: AccusationData | null;
  timer: number;
}

export const RevealResultView: React.FC<RevealResultViewProps> = ({
  gameState,
  accusation,
  timer
}) => {
  const [cardRevealed, setCardRevealed] = useState(false);

  const targetRoleDef = accusation?.targetRole ? ROLE_DEFINITIONS[accusation.targetRole] : null;
  const isThief = accusation?.isCorrect || false;
  const isJokerEscaped = accusation?.jokerEscaped || false;

  useEffect(() => {
    sound.playSuspense();
    const t = setTimeout(() => {
      setCardRevealed(true);
      if (isThief) {
        sound.playSuccess();
      } else {
        sound.playDefeat();
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [isThief]);

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Round {gameState.currentRound} of {gameState.maxRounds} • Accusation Judgment</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-100">
          The Royal Verdict
        </h2>
      </div>

      {/* Dramatic Center Reveal Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        
        {accusation ? (
          <>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              👮 Police <strong className="text-blue-400">{accusation.policePlayerName}</strong> Accused:
            </div>

            {/* Target Card Flip */}
            <div className="max-w-xs mx-auto">
              <div
                className={`aspect-[4/3] rounded-3xl p-6 flex flex-col items-center justify-center border-2 transition-all duration-700 shadow-2xl ${
                  cardRevealed
                    ? targetRoleDef
                      ? `${targetRoleDef.bgGradient} scale-100 shadow-amber-500/20`
                      : 'bg-slate-800 border-slate-600'
                    : 'bg-slate-950 border-amber-500/40 animate-pulse'
                }`}
              >
                {cardRevealed ? (
                  <div className="space-y-2 animate-fadeIn">
                    <div className="text-6xl filter drop-shadow-2xl">
                      {targetRoleDef?.emoji || '🥷'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-400 uppercase tracking-widest">
                        {accusation.targetPlayerName}
                      </div>
                      <div className="font-serif text-2xl font-black text-white">
                        {targetRoleDef?.name || 'Thief'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl animate-spin">🌀</div>
                    <div className="text-sm font-bold text-amber-300">Unmasking Suspect...</div>
                  </div>
                )}
              </div>
            </div>

            {/* Verdict Announcement */}
            {cardRevealed && (
              <div className="animate-fadeIn space-y-2">
                {isThief ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-400 text-emerald-200">
                    <div className="flex items-center justify-center gap-2 font-black text-lg sm:text-xl text-emerald-300">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span>POLICE WON! THIEF CAUGHT!</span>
                    </div>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      Police scored +300 points! The thief was captured red-handed.
                    </p>
                  </div>
                ) : isJokerEscaped ? (
                  <div className="p-4 rounded-2xl bg-fuchsia-950/40 border border-fuchsia-400 text-fuchsia-200">
                    <div className="flex items-center justify-center gap-2 font-black text-lg sm:text-xl text-fuchsia-300">
                      <span>🤡 JOKER ESCAPED!</span>
                    </div>
                    <p className="text-xs text-fuchsia-300/80 mt-1">
                      The court jester tricked the Police! Police gains 0 points.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-400 text-rose-200">
                    <div className="flex items-center justify-center gap-2 font-black text-lg sm:text-xl text-rose-300">
                      <XCircle className="w-6 h-6 text-rose-400" />
                      <span>WRONG ACCUSATION! THIEF ESCAPED!</span>
                    </div>
                    <p className="text-xs text-rose-300/80 mt-1">
                      {accusation.targetPlayerName} was innocent (+50 compensation). The true Thief scored +100 bonus points!
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-slate-400">Calculating round scores...</div>
        )}

      </div>

      {/* Round Score Table */}
      {gameState.roundResults && gameState.roundResults.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Round {gameState.currentRound} Score Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Next round in <strong className="text-amber-400">{timer}s</strong>
            </span>
          </div>

          <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto">
            {gameState.roundResults.map((res) => (
              <div key={res.playerId} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{ROLE_DEFINITIONS[res.role]?.emoji || '👤'}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">{res.playerName}</div>
                    <div className="text-[10px] text-slate-400">{res.breakdown}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-mono font-bold ${res.pointsGained > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    +{res.pointsGained} pts
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold">
                    Total: {res.totalScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
