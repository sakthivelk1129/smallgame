import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  HelpCircle, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Flame, 
  AlertCircle,
  Hash,
  Users,
  Delete,
  CornerDownLeft,
  Infinity as InfinityIcon,
  RotateCcw
} from 'lucide-react';
import { BullsCowsGameState, WordLength } from '../../types/bullsCows';
import { BullsCowsKeyboard } from './BullsCowsKeyboard';
import { sound } from '../../utils/sound';

interface BullsCowsGameViewProps {
  gameState: BullsCowsGameState;
  currentUserId: string;
  onSubmitGuess: (guess: string) => void;
  onOpenRules: () => void;
  onLeaveGame: () => void;
}

export const BullsCowsGameView: React.FC<BullsCowsGameViewProps> = ({
  gameState,
  currentUserId,
  onSubmitGuess,
  onOpenRules,
  onLeaveGame
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const wordLength = gameState.settings?.wordLength || 5;
  const me = gameState.players.find(p => p.id === currentUserId) || gameState.players[0];
  const myGuesses = me?.guessHistory || [];
  const hasSolved = me?.hasSolved || false;

  // Auto-focus input on mount or when round starts
  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, [gameState.currentRound, gameState.phase]);

  // Build letter statuses for the on-screen keyboard
  const keyboardLetterStatuses = new Map<string, 'BULL' | 'COW' | 'ABSENT'>();
  myGuesses.forEach(rec => {
    rec.letterStatuses.forEach(ls => {
      const existing = keyboardLetterStatuses.get(ls.letter);
      // BULL takes precedence over COW, COW takes precedence over ABSENT
      if (ls.type === 'BULL') {
        keyboardLetterStatuses.set(ls.letter, 'BULL');
      } else if (ls.type === 'COW' && existing !== 'BULL') {
        keyboardLetterStatuses.set(ls.letter, 'COW');
      } else if (ls.type === 'ABSENT' && !existing) {
        keyboardLetterStatuses.set(ls.letter, 'ABSENT');
      }
    });
  });

  const handleKeyPress = useCallback((char: string) => {
    if (hasSolved) return;
    setInputError(null);
    const upper = char.toUpperCase();
    if (!/^[A-Z]$/.test(upper)) return;

    setCurrentInput(prev => {
      if (prev.length < wordLength) {
        return prev + upper;
      }
      return prev;
    });
  }, [wordLength, hasSolved]);

  const handleBackspace = useCallback(() => {
    if (hasSolved) return;
    setInputError(null);
    setCurrentInput(prev => prev.slice(0, -1));
  }, [hasSolved]);

  const handleClear = useCallback(() => {
    if (hasSolved) return;
    setInputError(null);
    setCurrentInput('');
    hiddenInputRef.current?.focus();
  }, [hasSolved]);

  const handleEnter = useCallback(() => {
    if (hasSolved) return;
    if (currentInput.length !== wordLength) {
      sound.playPenalty();
      setInputError(`Word must be exactly ${wordLength} letters.`);
      hiddenInputRef.current?.focus();
      return;
    }

    sound.playWordSubmit();
    onSubmitGuess(currentInput);
    setCurrentInput('');
    setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 50);
  }, [currentInput, wordLength, onSubmitGuess, hasSolved]);

  // Handle direct text typing from physical or virtual keyboard
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasSolved) return;
    setInputError(null);
    const rawVal = e.target.value.toUpperCase();
    const cleanLetters = rawVal.replace(/[^A-Z]/g, '').slice(0, wordLength);
    setCurrentInput(cleanLetters);
  };

  // Physical keyboard keydown support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasSolved) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        sound.playCardClick();
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleBackspace, handleEnter, hasSolved]);

  return (
    <div 
      className="w-full max-w-4xl mx-auto p-3 sm:p-5 space-y-4 select-none animate-fadeIn flex flex-col justify-between min-h-[90vh]"
      onClick={() => hiddenInputRef.current?.focus()}
    >
      
      {/* Hidden real input for mobile keyboards and seamless focus */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={currentInput}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleEnter();
          }
        }}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="opacity-0 absolute pointer-events-none -top-96 left-0"
        maxLength={wordLength}
        aria-label="Word guess input"
      />

      {/* Top Header Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-xl flex items-center justify-between gap-3">
        
        {/* Left: Round and Guesses info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono block leading-none">ROUND</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
              {gameState.currentRound}/{gameState.maxRounds}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono block leading-none">GUESSES</span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
              {myGuesses.length}
            </span>
          </div>

          <div className="hidden sm:block px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono block leading-none">TOTAL SCORE</span>
            <span className="text-xs sm:text-sm font-black text-purple-400 font-mono">
              {me?.score || 0} pts
            </span>
          </div>
        </div>

        {/* Center: Untimed Relaxed Mode Badge (Timer Removed) */}
        <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2">
          <InfinityIcon className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">UNTIMED DEDUCTION</span>
          <span className="sm:hidden">NO TIMER</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onOpenRules();
            }}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Help / Rules"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              onLeaveGame();
            }}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Leave Game"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Multiplayer Live Opponents Feed */}
      {gameState.players.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-950/60 border border-slate-800 rounded-2xl no-scrollbar">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1 shrink-0">
            <Users className="w-3 h-3" /> Opponents:
          </div>
          {gameState.players.map((p) => {
            const isMe = p.id === currentUserId;
            return (
              <div
                key={p.id}
                className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 shrink-0 border ${
                  p.hasSolved
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                    : isMe
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span>{p.avatar}</span>
                <span className="truncate max-w-[80px]">{p.name}</span>
                {p.hasSolved ? (
                  <span className="text-[10px] px-1 bg-emerald-500 text-slate-950 rounded font-black">SOLVED!</span>
                ) : (
                  <span className="text-[10px] text-slate-500">({p.guessHistory?.length || p.guessesCount || 0}g)</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Active Word Slots (Interactive Input Display) */}
      <div 
        onClick={() => hiddenInputRef.current?.focus()}
        className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-xl text-center space-y-4 cursor-pointer"
      >
        
        {hasSolved ? (
          <div className="py-4 space-y-2 animate-bounce">
            <div className="text-3xl">🎉</div>
            <h3 className="text-lg sm:text-xl font-black text-emerald-300">
              YOU SOLVED THE SECRET WORD!
            </h3>
            <p className="text-xs text-slate-400">
              {gameState.players.length > 1
                ? 'Waiting for remaining players to finish...'
                : 'Great deduction skills! Preparing next round...'}
            </p>
          </div>
        ) : (
          <>
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-2">
              <span>GUESS THE {wordLength}-LETTER WORD</span>
              <span className="text-emerald-400">• UNIQUE LETTERS</span>
            </div>

            {/* Letter Slots */}
            <div className="flex justify-center gap-2 sm:gap-3 my-2">
              {Array.from({ length: wordLength }).map((_, idx) => {
                const char = currentInput[idx] || '';
                const isCurrent = idx === currentInput.length;

                return (
                  <div
                    key={idx}
                    onClick={() => hiddenInputRef.current?.focus()}
                    className={`w-12 h-14 sm:w-16 sm:h-18 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-xl sm:text-3xl transition-all select-none ${
                      char
                        ? 'bg-slate-800 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20 scale-105'
                        : isCurrent
                        ? 'bg-slate-950 border-emerald-500 text-emerald-400 ring-4 ring-emerald-500/20 animate-pulse'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    {char ? char : isCurrent ? <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> : ''}
                  </div>
                );
              })}
            </div>

            {/* Quick Action Control Bar */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  handleClear();
                }}
                disabled={currentInput.length === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>CLEAR</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  handleBackspace();
                }}
                disabled={currentInput.length === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Delete className="w-3.5 h-3.5" />
                <span>BACKSPACE</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnter();
                }}
                disabled={currentInput.length !== wordLength}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>SUBMIT GUESS</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Error message */}
            {inputError && (
              <div className="text-rose-400 text-xs font-bold flex items-center justify-center gap-1 animate-shake">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{inputError}</span>
              </div>
            )}
          </>
        )}

      </div>

      {/* Live Guess History Log */}
      <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-3.5 sm:p-5 min-h-[160px] max-h-[240px] overflow-y-auto space-y-2.5 custom-scrollbar shadow-inner">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex flex-wrap items-center justify-between gap-1 px-1 border-b border-slate-800/80 pb-2">
          <span className="text-slate-200">GUESS HISTORY ({myGuesses.length})</span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span>🐂</span> BULL = Right Letter & Spot
            </span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span>🐄</span> COW = Right Letter, Wrong Spot
            </span>
          </div>
        </div>

        {/* Latest Guess Highlight Banner */}
        {myGuesses.length > 0 && (
          <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold">
              Latest: <span className="text-white font-black tracking-widest">{myGuesses[0].guess}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                🐂 {myGuesses[0].bulls} {myGuesses[0].bulls === 1 ? 'Bull' : 'Bulls'}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                🐄 {myGuesses[0].cows} {myGuesses[0].cows === 1 ? 'Cow' : 'Cows'}
              </span>
            </div>
          </div>
        )}

        {myGuesses.length === 0 ? (
          <div className="h-24 flex flex-col items-center justify-center text-slate-500 text-center space-y-1.5 py-4">
            <span className="text-3xl animate-pulse">🐂 🐄</span>
            <p className="text-xs text-slate-400 font-medium">
              No guesses submitted yet.<br/>
              Type a <strong className="text-emerald-400">{wordLength}-letter word</strong> to get your Bulls & Cows!
            </p>
          </div>
        ) : (
          myGuesses.map((record, index) => (
            <div
              key={record.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                record.solved
                  ? 'bg-emerald-950/50 border-emerald-400/80 shadow-lg shadow-emerald-500/10'
                  : index === 0
                  ? 'bg-slate-900 border-slate-700 shadow-md'
                  : 'bg-slate-950/90 border-slate-800/80'
              }`}
            >
              {/* Guess number & Letters */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="w-7 text-center font-mono text-xs font-bold text-slate-500">
                  #{myGuesses.length - index}
                </span>

                <div className="flex items-center gap-1 sm:gap-1.5">
                  {record.letterStatuses.map((ls, lIdx) => {
                    let badgeColor = 'bg-slate-800/80 text-slate-400 border-slate-700';
                    let label = '✕';
                    if (ls.type === 'BULL') {
                      badgeColor = 'bg-emerald-600 text-white border-emerald-400 shadow-sm shadow-emerald-500/30';
                      label = '🐂';
                    } else if (ls.type === 'COW') {
                      badgeColor = 'bg-amber-600 text-white border-amber-400 shadow-sm shadow-amber-500/30';
                      label = '🐄';
                    }

                    return (
                      <div
                        key={lIdx}
                        className={`w-8 h-9 sm:w-10 sm:h-11 rounded-xl border-2 flex flex-col items-center justify-center font-black text-xs sm:text-base font-mono ${badgeColor}`}
                      >
                        <span className="leading-tight">{ls.letter}</span>
                        <span className="text-[8px] sm:text-[9px] leading-none opacity-90">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bulls & Cows Counter Pill */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-black text-xs sm:text-sm flex items-center gap-1.5 font-mono shadow-sm">
                  <span>🐂</span>
                  <span className="text-white">{record.bulls}</span>
                  <span className="text-[10px] hidden sm:inline text-emerald-400 font-bold">BULLS</span>
                </div>

                <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm flex items-center gap-1.5 font-mono shadow-sm">
                  <span>🐄</span>
                  <span className="text-white">{record.cows}</span>
                  <span className="text-[10px] hidden sm:inline text-amber-400 font-bold">COWS</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* On-Screen Keyboard */}
      <div className="pt-1">
        <BullsCowsKeyboard
          onKeyPress={handleKeyPress}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
          letterStatuses={keyboardLetterStatuses}
          disabled={hasSolved}
        />
      </div>

    </div>
  );
};

