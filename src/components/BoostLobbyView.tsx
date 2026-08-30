import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { 
  Users, 
  Sparkles, 
  Zap, 
  Copy, 
  Check, 
  Play, 
  Plus, 
  Trash2, 
  HelpCircle, 
  ArrowLeft,
  Crown,
  Bot,
  Flame,
  Settings,
  Share2,
  Globe,
  Lock,
  ArrowRight
} from 'lucide-react';
import { BoostGameState, BoostGameMode, UserProfile } from '../types/boost';
import { sound } from '../utils/sound';
import { PublicRoomsList } from './PublicRoomsList';

interface BoostLobbyViewProps {
  currentUser: UserProfile;
  gameState: BoostGameState | null;
  socket?: Socket | null;
  currentSocketId: string;
  onCreateRoom: (params: { maxPlayers: number; gameMode: BoostGameMode; totalRounds: number; isPrivate?: boolean }) => void;
  onJoinRoom: (roomCode: string) => void;
  onQuickMatch: (gameMode: BoostGameMode) => void;
  onPlaySoloBot: (gameMode: BoostGameMode) => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onUpdateSettings: (settings: { maxPlayers?: number; gameMode?: BoostGameMode; totalRounds?: number }) => void;
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
  onExitToHub: () => void;
}

export const BoostLobbyView: React.FC<BoostLobbyViewProps> = ({
  currentUser,
  gameState,
  socket,
  currentSocketId,
  onCreateRoom,
  onJoinRoom,
  onQuickMatch,
  onPlaySoloBot,
  onAddBot,
  onRemoveBot,
  onUpdateSettings,
  onStartGame,
  onOpenHowToPlay,
  onExitToHub
}) => {
  // 3 Primary Entry Options: 'bot' | 'friends' | 'public'
  const [entryOption, setEntryOption] = useState<'bot' | 'friends' | 'public'>('public');
  const [friendsSubTab, setFriendsSubTab] = useState<'create' | 'join'>('create');
  
  const [joinCode, setJoinCode] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [gameMode, setGameMode] = useState<BoostGameMode>('CLASSIC');
  const [totalRounds, setTotalRounds] = useState<number>(5);
  const [copied, setCopied] = useState(false);
  const [showHostPublicForm, setShowHostPublicForm] = useState(false);

  const isInRoom = !!gameState;
  const isHost = gameState?.hostId === currentSocketId;
  const playerCount = gameState?.players.length || 0;

  const handleCopyCode = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode);
      setCopied(true);
      sound.playClick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreatePrivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onCreateRoom({ maxPlayers, gameMode, totalRounds, isPrivate: true });
  };

  const handleHostPublicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onCreateRoom({ maxPlayers, gameMode, totalRounds, isPrivate: false });
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    sound.playClick();
    onJoinRoom(joinCode.trim().toUpperCase());
  };

  // If not inside a room yet, show 3 Entry Options
  if (!isInRoom) {
    return (
      <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none max-w-xl mx-auto w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>TAMIL NADU TRADITIONAL PARTY GAME</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-300 to-amber-300">
            BOOST: PAPER SLIPS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            1 Word per player • 3 Identical Slips • 15s Fast Turns • Shout BOOST!
          </p>
        </div>

        {/* 3 PRIMARY ENTRY TABS */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl w-full">
          {/* 1. Bot */}
          <button
            onClick={() => {
              sound.playClick();
              setEntryOption('bot');
            }}
            className={`py-2.5 px-1 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              entryOption === 'bot'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-300" />
            <span>Play with Bot</span>
          </button>

          {/* 2. Friends */}
          <button
            onClick={() => {
              sound.playClick();
              setEntryOption('friends');
            }}
            className={`py-2.5 px-1 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              entryOption === 'friends'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4 text-rose-300" />
            <span>Play Friends</span>
          </button>

          {/* 3. Public */}
          <button
            onClick={() => {
              sound.playClick();
              setEntryOption('public');
            }}
            className={`py-2.5 px-1 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              entryOption === 'public'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Public Room</span>
          </button>
        </div>

        {/* Card Box */}
        <div className="w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 backdrop-blur-sm">
          
          {/* ========================================================================= */}
          {/* OPTION 1: PLAY WITH BOT */}
          {/* ========================================================================= */}
          {entryOption === 'bot' && (
            <div className="space-y-5 text-left animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Practice with AI Bots</h3>
                  <p className="text-xs text-slate-400">Fast 4-player game with 3 smart AI bots</p>
                </div>
              </div>

              {/* Game Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Game Mode:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGameMode('CLASSIC')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      gameMode === 'CLASSIC'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs">CLASSIC</div>
                    <div className="text-[10px] text-slate-400">Pure paper picking & speed</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameMode('SPECIAL')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      gameMode === 'SPECIAL'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1">
                      <span>SPECIAL</span>
                      <Zap className="w-3 h-3 text-purple-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">Powers: Peek, Swap & Extra Time</div>
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  onPlaySoloBot(gameMode);
                }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-5 h-5" />
                <span>START AI PRACTICE MATCH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION 2: PLAY WITH FRIENDS (PRIVATE ROOM) */}
          {/* ========================================================================= */}
          {entryOption === 'friends' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => {
                    sound.playClick();
                    setFriendsSubTab('create');
                  }}
                  className={`py-2.5 rounded-xl transition-all ${
                    friendsSubTab === 'create'
                      ? 'bg-rose-500 text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔒 Create Private Room
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setFriendsSubTab('join');
                  }}
                  className={`py-2.5 rounded-xl transition-all ${
                    friendsSubTab === 'join'
                      ? 'bg-rose-500 text-white shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔑 Join with Code
                </button>
              </div>

              {friendsSubTab === 'create' ? (
                <form onSubmit={handleCreatePrivateSubmit} className="space-y-4">
                  
                  {/* Player Limit */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Player Capacity:</span>
                      <span className="text-rose-400 font-mono font-bold">{maxPlayers} Players</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setMaxPlayers(num);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${
                            maxPlayers === num
                              ? 'bg-rose-500/20 border-2 border-rose-400 text-rose-300'
                              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {num}P
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Game Mode */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-300">
                      Game Mode:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setGameMode('CLASSIC');
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          gameMode === 'CLASSIC'
                            ? 'bg-rose-500/15 border-rose-400 text-rose-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">CLASSIC</div>
                        <div className="text-[10px] text-slate-400">Pure paper picking & speed</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setGameMode('SPECIAL');
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          gameMode === 'SPECIAL'
                            ? 'bg-purple-500/15 border-purple-400 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center gap-1">
                          <span>SPECIAL</span>
                          <Zap className="w-3 h-3 text-purple-400" />
                        </div>
                        <div className="text-[10px] text-slate-400">Random 1-time abilities</div>
                      </button>
                    </div>
                  </div>

                  {/* Round Count */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-300">
                      Match Length:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 3, 5, 10].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setTotalRounds(r);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${
                            totalRounds === r
                              ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300'
                              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {r} {r === 1 ? 'Round' : 'Rounds'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 hover:from-rose-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-slate-950" />
                    <span>CREATE PRIVATE LOBBY</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </form>
              ) : (
                /* Join Form */
                <form onSubmit={handleJoinSubmit} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-slate-300">
                      Enter 6-Character Room Code:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. BST882"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 rounded-2xl p-4 text-center font-mono font-black text-2xl tracking-widest text-rose-300 uppercase placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 disabled:hover:bg-rose-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ENTER ROOM</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION 3: PUBLIC ROOM (AUTO MATCHMAKING & PUBLIC ROOMS LIST) */}
          {/* ========================================================================= */}
          {entryOption === 'public' && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-100">Public Matchmaking</h3>
                    <p className="text-xs text-slate-400">Join other players online or host a public game</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowHostPublicForm(!showHostPublicForm)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 transition-colors whitespace-nowrap"
                >
                  {showHostPublicForm ? 'View Public List' : '➕ Host Public'}
                </button>
              </div>

              {showHostPublicForm ? (
                /* Host Public Form */
                <form onSubmit={handleHostPublicSubmit} className="space-y-4 text-left border-t border-slate-800 pt-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                    🌐 Your room will be listed in the Public Rooms list for anyone online to join!
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Player Capacity:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMaxPlayers(num)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            maxPlayers === num
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {num} Players
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>HOST PUBLIC BOOST ROOM</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Public Rooms List */
                <PublicRoomsList
                  socket={socket || null}
                  gameType="boost"
                  onJoinRoom={onJoinRoom}
                  onQuickMatch={() => onQuickMatch(gameMode)}
                  accentColor="rose"
                />
              )}

            </div>
          )}

        </div>

        {/* Footer info & Rules link */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <button
            onClick={() => {
              sound.playClick();
              onOpenHowToPlay();
            }}
            className="flex items-center gap-1.5 hover:text-rose-300 transition-colors font-medium cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-rose-400" />
            <span>How to Play Boost</span>
          </button>
          
          <span>•</span>

          <button
            onClick={() => {
              sound.playClick();
              onExitToHub();
            }}
            className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </button>
        </div>

      </div>
    );
  }

  // ===========================================================================
  // IF INSIDE ROOM LOBBY
  // ===========================================================================
  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none max-w-2xl mx-auto w-full space-y-6 animate-fadeIn">
      
      {/* Header with Room Code */}
      <div className="w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 backdrop-blur-sm">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">
              {gameState.isPrivate ? <Lock className="w-3.5 h-3.5 text-rose-400" /> : <Globe className="w-3.5 h-3.5 text-amber-400" />}
              <span>{gameState.isPrivate ? 'PRIVATE ROOM LOBBY' : 'PUBLIC ROOM LOBBY'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100">
              Boost Arena
            </h2>
          </div>

          {/* Room Code Badge */}
          <div className="flex items-center gap-2 bg-slate-950 border border-rose-500/40 rounded-2xl px-4 py-2 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room Code</div>
              <div className="font-mono font-black text-xl text-rose-300 tracking-wider">
                {gameState.roomCode}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl transition-all hover:scale-105 active:scale-95"
              title="Copy Room Code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Players List Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>COURT PLAYERS ({playerCount} / {gameState.maxPlayers})</span>
            {isHost && playerCount < gameState.maxPlayers && (
              <button
                onClick={() => {
                  sound.playPop();
                  onAddBot();
                }}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-xl transition-all hover:scale-105"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>+ Add Bot</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gameState.players.map((p, idx) => (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  p.id === currentSocketId
                    ? 'bg-rose-500/10 border-rose-400/50'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{p.avatar}</div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {p.isHost && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold border border-amber-500/30">
                          HOST
                        </span>
                      )}
                      {p.isBot && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold border border-purple-500/30">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Seat #{idx + 1}
                    </div>
                  </div>
                </div>

                {isHost && p.isBot && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onRemoveBot(p.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        <div className="pt-2">
          {isHost ? (
            <button
              onClick={() => {
                sound.playClick();
                onStartGame();
              }}
              disabled={playerCount < 2}
              className="w-full py-4 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 hover:from-rose-400 hover:to-amber-300 disabled:opacity-40 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START BOOST MATCH ({playerCount} Players)</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <div className="text-xs font-bold text-slate-300">Waiting for Host to start match...</div>
              <div className="text-[11px] text-slate-500">Get ready to write your secret word!</div>
            </div>
          )}
        </div>

      </div>

      <button
        onClick={() => {
          sound.playClick();
          onExitToHub();
        }}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Leave Room & Exit</span>
      </button>

    </div>
  );
};
