import React, { useState } from 'react';
import { 
  Play, 
  Users, 
  PlusCircle, 
  LogIn, 
  HelpCircle, 
  Sparkles, 
  Zap, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  ArrowRight,
  Target
} from 'lucide-react';
import { UserProfile } from '../../types/game';
import { WordLength, GameDifficulty, BullsCowsGameMode, BullsCowsRoomSettings } from '../../types/bullsCows';
import { sound } from '../../utils/sound';

interface BullsCowsHomeHubProps {
  user: UserProfile;
  onCreateRoom: (settings: Partial<BullsCowsRoomSettings>, isSinglePlayer?: boolean) => void;
  onJoinRoom: (roomCode: string) => void;
  onOpenRules: () => void;
}

export const BullsCowsHomeHub: React.FC<BullsCowsHomeHubProps> = ({
  user,
  onCreateRoom,
  onJoinRoom,
  onOpenRules
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'create' | 'join'>('quick');
  
  // Quick play / single player settings
  const [singleLength, setSingleLength] = useState<WordLength>(5);
  const [singleDifficulty, setSingleDifficulty] = useState<GameDifficulty>('MEDIUM');

  // Multiplayer create settings
  const [multiLength, setMultiLength] = useState<WordLength>(5);
  const [multiDifficulty, setMultiDifficulty] = useState<GameDifficulty>('MEDIUM');
  const [multiRounds, setMultiRounds] = useState<number>(3);
  const [multiMode, setMultiMode] = useState<BullsCowsGameMode>('SAME_TARGET');

  // Join Room Code
  const [joinCode, setJoinCode] = useState('');

  const handleStartSinglePlayer = () => {
    sound.playClick();
    onCreateRoom(
      {
        wordLength: singleLength,
        difficulty: singleDifficulty,
        gameMode: 'SAME_TARGET',
        maxRounds: 1,
        timeLimit: 0,
        allowRepeatedLetters: false
      },
      true // isSinglePlayer
    );
  };

  const handleCreateMultiplayer = () => {
    sound.playClick();
    onCreateRoom(
      {
        wordLength: multiLength,
        difficulty: multiDifficulty,
        gameMode: multiMode,
        maxRounds: multiRounds,
        timeLimit: 0,
        allowRepeatedLetters: false,
        maxPlayers: 2
      },
      false
    );
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCode.trim().toUpperCase();
    if (!clean) return;
    sound.playClick();
    onJoinRoom(clean);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-8 select-none animate-fadeIn flex flex-col justify-center min-h-[85vh]">
      
      {/* Title & Brand Hero */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-sm">
          <Target className="w-3.5 h-3.5" />
          <span>CLASSIC MASTERMIND WORD DEDUCTION</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-emerald-400">
          BULLS & COWS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Secret English words, unique-letter logic, 🐂 Bulls, 🐄 Cows, and real-time multiplayer duels!
        </p>
      </div>

      {/* Main Mode Switcher Tabs */}
      <div className="max-w-md mx-auto w-full grid grid-cols-3 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-bold shadow-lg">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('quick');
          }}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'quick'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Quick Play</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('create');
          }}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'create'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Create Room</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('join');
          }}
          className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'join'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Join Room</span>
        </button>
      </div>

      {/* Card Content Area */}
      <div className="max-w-md mx-auto w-full bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/5 backdrop-blur-md">
        
        {/* 1. QUICK PLAY / SINGLE PLAYER */}
        {activeTab === 'quick' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="text-2xl">🎯</div>
              <h2 className="text-lg font-bold text-slate-100">Solo Word Challenge</h2>
              <p className="text-xs text-slate-400">Guess the secret word against the clock!</p>
            </div>

            {/* Word Length Picker */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Select Word Length:</span>
                <span className="text-emerald-400 font-mono font-black">{singleLength} LETTERS</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([3, 4, 5, 6, 7] as WordLength[]).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      sound.playCardClick();
                      setSingleLength(len);
                    }}
                    className={`py-2 rounded-xl font-black text-xs transition-all ${
                      singleLength === len
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {len}L
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Picker */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-300">
                Difficulty Level:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'MEDIUM', 'HARD'] as GameDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      sound.playCardClick();
                      setSingleDifficulty(diff);
                    }}
                    className={`py-2 rounded-xl font-bold text-xs transition-all ${
                      singleDifficulty === diff
                        ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartSinglePlayer}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>START SOLO GAME</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2. CREATE MULTIPLAYER ROOM */}
        {activeTab === 'create' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="text-2xl">👥</div>
              <h2 className="text-lg font-bold text-slate-100">Host Multiplayer Room</h2>
              <p className="text-xs text-slate-400">Play with 2–7 friends or AI bots in real time!</p>
            </div>

            {/* Game Mode Picker */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300">
                Game Mode:
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'SAME_TARGET', label: 'Mode A: Same Target', desc: 'Everyone guesses the exact same word' },
                  { id: 'SECRET_TARGET', label: 'Mode B: Secret Targets', desc: 'Each player receives a unique secret word' },
                  { id: 'SPEED_BULLS', label: 'Mode C: First to Solve', desc: 'Untimed race - first player to crack the code wins' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      sound.playCardClick();
                      setMultiMode(mode.id as BullsCowsGameMode);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all ${
                      multiMode === mode.id
                        ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{mode.label}</div>
                    <div className="text-[10px] text-slate-400">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Word Length */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 flex justify-between">
                <span>Word Length:</span>
                <span className="text-emerald-400 font-mono">{multiLength} Letters</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([3, 4, 5, 6, 7] as WordLength[]).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      sound.playCardClick();
                      setMultiLength(len);
                    }}
                    className={`py-1.5 rounded-xl font-black text-xs transition-all ${
                      multiLength === len
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {len}L
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300">
                Number of Rounds:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 10].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      sound.playCardClick();
                      setMultiRounds(r);
                    }}
                    className={`py-1.5 rounded-xl font-bold text-xs transition-all ${
                      multiRounds === r
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {r} {r === 1 ? 'Round' : 'Rounds'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateMultiplayer}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>CREATE MULTIPLAYER LOBBY</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. JOIN ROOM */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="text-2xl">🔑</div>
              <h2 className="text-lg font-bold text-slate-100">Join a Room</h2>
              <p className="text-xs text-slate-400">Enter the room code shared by your friend</p>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-300">
                Room Code (e.g. BC7X9):
              </label>
              <input
                type="text"
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                maxLength={6}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-center text-xl font-mono font-black text-emerald-300 tracking-widest focus:outline-none focus:border-emerald-400 transition-colors uppercase placeholder-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={!joinCode.trim()}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>JOIN GAME ROOM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>

      {/* Bottom How-To-Play Button */}
      <div className="text-center">
        <button
          onClick={() => {
            sound.playClick();
            onOpenRules();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-emerald-300 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Learn Bulls & Cows Rules (🐂 Bulls vs 🐄 Cows)</span>
        </button>
      </div>

    </div>
  );
};
