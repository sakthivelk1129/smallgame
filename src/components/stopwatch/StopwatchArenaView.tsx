import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Target, 
  Sparkles, 
  Zap, 
  Hand, 
  CheckCircle2, 
  Flame, 
  EyeOff, 
  HelpCircle,
  Clock,
  Shield,
  Volume2
} from 'lucide-react';
import { StopwatchGameState, StopwatchPlayer } from '../../types/stopwatch';
import { sound } from '../../utils/sound';

interface StopwatchArenaViewProps {
  gameState: StopwatchGameState;
  currentUserId: string;
  onStopTimer: (clientElapsed?: number) => void;
}

export const StopwatchArenaView: React.FC<StopwatchArenaViewProps> = ({
  gameState,
  currentUserId,
  onStopTimer
}) => {
  const localPlayer = gameState.players.find(p => p.id === currentUserId);
  const isTeamFormat = gameState.settings.format === 'team';
  const hasStoppedServer = localPlayer?.hasStopped || false;

  // Local millisecond timer for ultra-smooth 60fps rendering
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isLocallyStopped, setIsLocallyStopped] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const stoppedTimeRef = useRef<number | null>(null);

  // Reset local stopped state when phase or round changes
  useEffect(() => {
    if (gameState.phase === 'TARGET_ANNOUNCEMENT') {
      setIsLocallyStopped(false);
      stoppedTimeRef.current = null;
      setElapsedSec(0);
    }
  }, [gameState.phase, gameState.currentRound]);

  const hasStopped = hasStoppedServer || isLocallyStopped;

  // Instant zero-delay Stop Trigger Handler
  const triggerStop = () => {
    if (gameState.phase !== 'ACTIVE_STOPWATCH' || hasStopped || stoppedTimeRef.current !== null) return;
    
    // Calculate precise millisecond timestamp at the exact moment of pointer/key trigger
    const now = Date.now();
    const start = gameState.timerStartedAt || now;
    const exactElapsed = Math.round(Math.max(0, now - start)) / 1000;
    
    stoppedTimeRef.current = exactElapsed;
    setIsLocallyStopped(true);
    setElapsedSec(exactElapsed);
    
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    sound.playClick();
    onStopTimer(exactElapsed);
  };

  useEffect(() => {
    if (gameState.phase === 'ACTIVE_STOPWATCH' && gameState.timerStartedAt && !hasStopped) {
      const updateTimer = () => {
        if (stoppedTimeRef.current !== null) return;
        const now = Date.now();
        const diffMs = Math.max(0, now - (gameState.timerStartedAt || now));
        setElapsedSec(diffMs / 1000);
        animFrameRef.current = requestAnimationFrame(updateTimer);
      };
      animFrameRef.current = requestAnimationFrame(updateTimer);
    } else if (hasStopped && (localPlayer?.stoppedTime !== null && localPlayer?.stoppedTime !== undefined)) {
      setElapsedSec(localPlayer.stoppedTime);
    } else if (stoppedTimeRef.current !== null) {
      setElapsedSec(stoppedTimeRef.current);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gameState.phase, gameState.timerStartedAt, hasStopped, localPlayer?.stoppedTime]);

  // Spacebar and Enter trigger support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') && gameState.phase === 'ACTIVE_STOPWATCH' && !hasStopped) {
        e.preventDefault();
        triggerStop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.phase, hasStopped]);

  const targetTime = gameState.targetTime;
  const isBlindfold = gameState.settings.blindfoldMode && gameState.phase === 'ACTIVE_STOPWATCH' && elapsedSec > 2.0 && !hasStopped;

  // Format seconds and hundredths (2 decimal places: SS.cc)
  const elapsedFixed = elapsedSec.toFixed(2);
  const [secondsFormatted, millisFormatted] = elapsedFixed.split('.');

  const targetFixed = targetTime.toFixed(2);
  const [targetSecFormatted, targetMillisFormatted] = targetFixed.split('.');

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 py-2 px-3 sm:px-4 animate-fadeIn select-none">
      
      {/* Round & Target Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-sm font-black flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span>ROUND {gameState.currentRound} OF {gameState.maxRounds}</span>
          </div>
          {isTeamFormat && (
            <div className="flex items-center gap-2 text-xs font-bold font-mono">
              <span className="px-2 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                🔴 RED: {gameState.teamScores.red}
              </span>
              <span className="text-slate-500">vs</span>
              <span className="px-2 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                🔵 BLUE: {gameState.teamScores.blue}
              </span>
            </div>
          )}
        </div>

        {/* Scoring Reminder */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
            🎯 Exact: +2 Pts
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
            🥇 Closest: +1 Pt
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
            🤝 Tie: Equal +1 Pt
          </span>
        </div>
      </div>

      {/* Target Time Announcement Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden">
        
        {/* Ambient glow rings */}
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <span className="text-xs font-mono font-black tracking-widest text-cyan-400 uppercase">
          🎯 TARGET TIME TO HIT:
        </span>

        <div className="flex items-baseline gap-1 my-2">
          <span className="font-mono text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-100 to-cyan-400 tracking-tight drop-shadow-md">
            {targetSecFormatted}.{targetMillisFormatted}
          </span>
          <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
            SEC
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md">
          {gameState.phase === 'TARGET_ANNOUNCEMENT' 
            ? 'Timer will begin immediately when countdown reaches zero!' 
            : 'Press STOP when the stopwatch matches the target time exactly!'}
        </p>
      </div>

      {/* COUNTDOWN PHASE DISPLAY */}
      {gameState.phase === 'TARGET_ANNOUNCEMENT' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4 animate-fadeIn">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            GET READY TO STOP!
          </div>
          <div className="font-mono text-7xl sm:text-9xl font-black text-amber-300 animate-bounce">
            {gameState.countdownTimer > 0 ? gameState.countdownTimer : 'START!'}
          </div>
          <p className="text-xs text-slate-400">
            Keep your finger ready on the STOP button or SPACEBAR!
          </p>
        </div>
      )}

      {/* ACTIVE STOPWATCH RUNNING PHASE */}
      {gameState.phase === 'ACTIVE_STOPWATCH' && (
        <div className="space-y-6">
          
          {/* Glowing Digital Chronometer Bezel */}
          <div 
            onPointerDown={(e) => {
              if (!hasStopped) {
                e.preventDefault();
                triggerStop();
              }
            }}
            className={`p-8 sm:p-12 rounded-3xl bg-slate-950 border-4 ${!hasStopped ? 'border-cyan-500/60 shadow-2xl shadow-cyan-500/20 cursor-pointer active:border-rose-500 active:bg-slate-900' : 'border-emerald-500/60 shadow-2xl shadow-emerald-500/20'} text-center relative overflow-hidden flex flex-col items-center justify-center transition-all`}
          >
            
            {/* Blindfold Indicator */}
            {gameState.settings.blindfoldMode && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Blindfold Mode</span>
              </div>
            )}

            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>LIVE DIGITAL CHRONOMETER</span>
              {!hasStopped && <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800 animate-pulse">TAP ANYWHERE TO STOP</span>}
            </div>

            {/* LCD Digits */}
            {isBlindfold ? (
              <div className="py-6 space-y-2">
                <div className="font-mono text-6xl sm:text-8xl font-black text-amber-400 tracking-widest animate-pulse">
                  ?? : ??
                </div>
                <div className="text-xs text-amber-300 font-bold">
                  🙈 BLINDFOLD ACTIVE: Trust your internal rhythm!
                </div>
              </div>
            ) : (
              <div className="flex items-baseline justify-center font-mono font-black text-6xl sm:text-8xl md:text-9xl tracking-tight text-cyan-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                <span>{secondsFormatted}</span>
                <span className="text-cyan-500 mx-1">:</span>
                <span className="text-cyan-200 text-5xl sm:text-7xl md:text-8xl">{millisFormatted}</span>
              </div>
            )}

            {/* Stopped Status Feedback */}
            {hasStopped && (
              <div className="mt-4 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Locked at {(localPlayer?.stoppedTime ?? stoppedTimeRef.current ?? elapsedSec).toFixed(2)}s! (Diff: ±{Math.abs((localPlayer?.stoppedTime ?? stoppedTimeRef.current ?? elapsedSec) - targetTime).toFixed(2)}s)</span>
              </div>
            )}
          </div>

          {/* GIANT ACTION BUTTON */}
          <div className="flex justify-center">
            {!hasStopped ? (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  triggerStop();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  triggerStop();
                }}
                className="w-full sm:w-3/4 py-6 sm:py-8 bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 active:scale-95 text-white font-black text-2xl sm:text-3xl rounded-3xl shadow-2xl shadow-rose-600/40 border-4 border-rose-400 transition-all flex items-center justify-center gap-3 cursor-pointer ring-4 ring-rose-500/30 touch-manipulation"
              >
                <Hand className="w-8 h-8 sm:w-10 sm:h-10 fill-current animate-pulse" />
                <span>STOP TIMER! (SPACEBAR)</span>
              </button>
            ) : (
              <div className="w-full sm:w-3/4 py-5 bg-slate-900 border-2 border-emerald-500/40 rounded-3xl text-center text-emerald-400 font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>LOCKED IN: {(localPlayer?.stoppedTime ?? stoppedTimeRef.current ?? elapsedSec).toFixed(3)}s</span>
              </div>
            )}
          </div>

          {/* Competitors Status Bar */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Competitor Status:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {gameState.players.map((p) => {
                const isMe = p.id === currentUserId;
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      p.hasStopped
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.avatar}</span>
                      <div className="text-xs font-bold truncate max-w-[80px]">
                        {p.name} {isMe ? '(You)' : ''}
                      </div>
                    </div>
                    <div>
                      {p.hasStopped ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          STOPPED
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 animate-pulse font-mono font-bold">
                          TICKING...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
