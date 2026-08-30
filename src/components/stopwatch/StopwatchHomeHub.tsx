import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { 
  Timer, 
  Users, 
  Sparkles, 
  Zap, 
  Bot, 
  Globe, 
  Key, 
  ArrowRight, 
  HelpCircle, 
  Flame, 
  Check, 
  EyeOff, 
  ShieldCheck,
  PlusCircle,
  Copy,
  Layers,
  RotateCcw,
  Target
} from 'lucide-react';
import { StopwatchFormat, StopwatchPlayMode, StopwatchSettings } from '../../types/stopwatch';
import { UserProfile } from '../../types/game';
import { sound } from '../../utils/sound';

interface StopwatchHomeHubProps {
  user: UserProfile | null;
  socket: Socket | null;
  onCreateRoom: (settings: Partial<StopwatchSettings>) => void;
  onJoinRoom: (roomCode: string) => void;
  onOpenRules: () => void;
  initialRoomCode?: string;
}

export const StopwatchHomeHub: React.FC<StopwatchHomeHubProps> = ({
  user,
  socket,
  onCreateRoom,
  onJoinRoom,
  onOpenRules,
  initialRoomCode = ''
}) => {
  // 3 Primary Mode Tabs: 'bot' | 'friends' | 'online_random'
  const [activeTab, setActiveTab] = useState<StopwatchPlayMode>('friends');

  // Friends Sub-tab: 'create' | 'join'
  const [friendsSubTab, setFriendsSubTab] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState(initialRoomCode);
  const [joinError, setJoinError] = useState('');

  // Game configuration
  const [rounds, setRounds] = useState<number>(5);
  const [format, setFormat] = useState<StopwatchFormat>('single');
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [blindfoldMode, setBlindfoldMode] = useState<boolean>(false);
  const [targetRangePreset, setTargetRangePreset] = useState<'1_10' | '1_4' | '3_7' | '5_10'>('1_10');

  const getMinMaxTarget = () => {
    switch (targetRangePreset) {
      case '1_4': return { min: 1.0, max: 4.0 };
      case '3_7': return { min: 3.0, max: 7.0 };
      case '5_10': return { min: 5.0, max: 10.0 };
      case '1_10':
      default: return { min: 1.0, max: 10.0 };
    }
  };

  useEffect(() => {
    if (initialRoomCode) {
      setJoinCode(initialRoomCode.toUpperCase());
      setActiveTab('friends');
      setFriendsSubTab('join');
    }
  }, [initialRoomCode]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCode.trim().toUpperCase();
    if (clean.length < 4) {
      setJoinError('Please enter a valid 6-character room code');
      sound.playDefeat();
      return;
    }
    setJoinError('');
    sound.playClick();
    onJoinRoom(clean);
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const match = text.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (match.length >= 4) {
          setJoinCode(match.substring(0, 6));
          sound.playPop();
        }
      }
    } catch {
      // clipboard fallback
    }
  };

  // 1. Play with Bot Handler
  const handleStartBotGame = () => {
    sound.playClick();
    const { min, max } = getMinMaxTarget();
    if (socket) {
      socket.emit('stopwatch:createSoloBot', {
        playerName: user?.name || 'Player 1',
        avatar: user?.avatar || '👑',
        rounds,
        format,
        difficulty: botDifficulty,
        blindfoldMode,
        minTarget: min,
        maxTarget: max
      });
    } else {
      onCreateRoom({
        rounds,
        format,
        playMode: 'bot',
        blindfoldMode,
        minTarget: min,
        maxTarget: max,
        isPrivate: true
      });
    }
  };

  // 2. Play with Friends (Create Room)
  const handleCreateFriendsRoom = () => {
    sound.playRoyalFanfare();
    const { min, max } = getMinMaxTarget();
    onCreateRoom({
      rounds,
      format,
      playMode: 'friends',
      blindfoldMode,
      minTarget: min,
      maxTarget: max,
      isPrivate: true,
      maxPlayers: format === 'team' ? 8 : 6
    });
  };

  // 3. Online Random Matchmaking
  const handleStartQuickMatch = () => {
    sound.playClick();
    if (socket) {
      socket.emit('stopwatch:quickMatch', {
        playerName: user?.name || 'Player 1',
        avatar: user?.avatar || '⏱️',
        format
      });
    } else {
      onCreateRoom({
        rounds: 5,
        format,
        playMode: 'online_random',
        isPrivate: false
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 py-2 px-3 sm:px-4 animate-fadeIn">
      
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/10 overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <Timer className="w-3.5 h-3.5 animate-spin" />
              <span>ULTRA-PRECISION TARGET TIMER</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-cyan-400">
              Stopwatch Precision Duel
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Match the target time down to the exact millisecond! Exact match earns <strong className="text-emerald-400 font-bold">2 Points</strong>, closest timing earns <strong className="text-cyan-300 font-bold">1 Point</strong>, and ties result in an equal draw!
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400/50 flex items-center justify-center text-4xl shadow-xl shadow-cyan-500/20 animate-pulse">
              ⏱️
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onOpenRules();
              }}
              className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to Play</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Primary Modes Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('bot');
          }}
          className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'bot'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Play with Bot</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('friends');
          }}
          className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'friends'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Play with Friends</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('online_random');
          }}
          className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'online_random'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Online Random</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
        
        {/* MODE 1: PLAY WITH BOT (SOLO VS AI) */}
        {activeTab === 'bot' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-cyan-300">
                  Bot Match (Solo Practice)
                </h3>
                <p className="text-xs text-slate-400">
                  Hone your reaction and target timing against realistic AI chronometer bots!
                </p>
              </div>
            </div>

            {/* Config: Format (Single vs Team) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Format:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setFormat('single');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    format === 'single'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">👤 1v1 Single Duel</div>
                    <div className="text-[11px] text-slate-400">You vs Chronos AI Bot</div>
                  </div>
                  {format === 'single' && <Check className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setFormat('team');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    format === 'team'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">🔴 Team Red vs 🔵 Team Blue</div>
                    <div className="text-[11px] text-slate-400">2v2 Squad Timing Battle</div>
                  </div>
                  {format === 'team' && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Config: Bot Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Bot Precision Level:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'easy', label: 'Casual (±0.4s)', desc: 'Friendly rhythm' },
                  { id: 'medium', label: 'Normal (±0.15s)', desc: 'Standard reflex' },
                  { id: 'hard', label: 'Pro (±0.05s)', desc: 'Precise timer' },
                  { id: 'expert', label: 'Master (±0.01s)', desc: 'Near Bullseye' }
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setBotDifficulty(d.id as any);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      botDifficulty === d.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{d.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Config: Target Time Range */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target Time Range:</span>
                </label>
                <span className="text-[11px] font-mono text-cyan-300 font-bold">
                  {targetRangePreset === '1_10' && '1.000s – 10.000s'}
                  {targetRangePreset === '1_4' && '1.000s – 4.000s'}
                  {targetRangePreset === '3_7' && '3.000s – 7.000s'}
                  {targetRangePreset === '5_10' && '5.000s – 10.000s'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: '1_10', label: '1.0s – 10.0s', sub: 'Full Spectrum (Default)' },
                  { id: '1_4', label: '1.0s – 4.0s', sub: '⚡ Fast Reflexes' },
                  { id: '3_7', label: '3.0s – 7.0s', sub: '⏱️ Mid Rhythm' },
                  { id: '5_10', label: '5.0s – 10.0s', sub: '⏳ Long Focus' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setTargetRangePreset(preset.id as any);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      targetRangePreset === preset.id
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-black shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{preset.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{preset.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Config: Number of Rounds */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Number of Rounds:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRounds(r);
                    }}
                    className={`py-2 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${
                      rounds === r
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {r} Rounds
                  </button>
                ))}
              </div>
            </div>

            {/* Blindfold Challenge Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Blindfold Rhythm Mode</div>
                  <div className="text-[11px] text-slate-400">Timer digits hide after 2 seconds to test pure internal clock!</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={blindfoldMode}
                onChange={(e) => setBlindfoldMode(e.target.checked)}
                className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartBotGame}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span>START BOT MATCH NOW</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* MODE 2: PLAY WITH FRIENDS (PRIVATE ROOM) */}
        {activeTab === 'friends' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Sub Tabs: Create vs Join */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <button
                onClick={() => {
                  sound.playClick();
                  setFriendsSubTab('create');
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  friendsSubTab === 'create'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Private Room</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setFriendsSubTab('join');
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  friendsSubTab === 'join'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Join with Code</span>
              </button>
            </div>

            {/* Create Room View */}
            {friendsSubTab === 'create' ? (
              <div className="space-y-5">
                {/* Format selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Game Format:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setFormat('single');
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        format === 'single'
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">👤 Single Free-For-All</div>
                        <div className="text-[11px] text-slate-400">Individual scores (2–6 Players)</div>
                      </div>
                      {format === 'single' && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setFormat('team');
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        format === 'team'
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">🔴 Team Red vs 🔵 Team Blue</div>
                        <div className="text-[11px] text-slate-400">Team match (2–8 Players)</div>
                      </div>
                      {format === 'team' && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  </div>
                </div>

                {/* Target Time Range selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Target Time Range:</span>
                    </label>
                    <span className="text-[11px] font-mono text-cyan-300 font-bold">
                      {targetRangePreset === '1_10' && '1.000s – 10.000s'}
                      {targetRangePreset === '1_4' && '1.000s – 4.000s'}
                      {targetRangePreset === '3_7' && '3.000s – 7.000s'}
                      {targetRangePreset === '5_10' && '5.000s – 10.000s'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: '1_10', label: '1.0s – 10.0s', sub: 'Full Range (Default)' },
                      { id: '1_4', label: '1.0s – 4.0s', sub: '⚡ Quick Blitz' },
                      { id: '3_7', label: '3.0s – 7.0s', sub: '⏱️ Mid Tempo' },
                      { id: '5_10', label: '5.0s – 10.0s', sub: '⏳ Long Focus' }
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setTargetRangePreset(preset.id as any);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          targetRangePreset === preset.id
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-black shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{preset.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{preset.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Round selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Number of Rounds:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 10].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setRounds(r);
                        }}
                        className={`py-2 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${
                          rounds === r
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {r} Rounds
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blindfold Mode Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      <EyeOff className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Blindfold Mode (Hardcore)</div>
                      <div className="text-[11px] text-slate-400">Numbers vanish after 2s to test true internal timing!</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={blindfoldMode}
                    onChange={(e) => setBlindfoldMode(e.target.checked)}
                    className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
                  />
                </div>

                {/* Create Room Button */}
                <button
                  onClick={handleCreateFriendsRoom}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <span>CREATE ROOM & GET CODE</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* Join Room View */
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Enter 6-Character Room Code:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase());
                        setJoinError('');
                      }}
                      placeholder="e.g. A7K92P"
                      className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 text-cyan-300 font-mono text-center text-xl font-black tracking-widest uppercase outline-none shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handlePasteCode}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Paste from Clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </button>
                  </div>
                  {joinError && (
                    <p className="text-xs text-rose-400 font-bold">{joinError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                >
                  <span>JOIN ROOM WITH CODE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 3: ONLINE RANDOM MATCHMAKING */}
        {activeTab === 'online_random' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-xl">
                🌐
              </div>
              <div>
                <h3 className="text-lg font-serif font-black text-orange-300">
                  Online Random Matchmaking
                </h3>
                <p className="text-xs text-slate-400">
                  Quick match with active players worldwide in public rooms!
                </p>
              </div>
            </div>

            {/* Format Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Format:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setFormat('single');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    format === 'single'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">👤 Single Match</div>
                    <div className="text-[11px] text-slate-400">Free-For-All scoring</div>
                  </div>
                  {format === 'single' && <Check className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setFormat('team');
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    format === 'team'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">🔴 Team Red vs 🔵 Team Blue</div>
                    <div className="text-[11px] text-slate-400">Squad timing duel</div>
                  </div>
                  {format === 'team' && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Match System:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If an open room is waiting for players, you will join immediately. Otherwise, a new public room will be hosted automatically for other players to join!
              </p>
            </div>

            <button
              onClick={handleStartQuickMatch}
              className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <span>FIND ONLINE QUICK MATCH</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
