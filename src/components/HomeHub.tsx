import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { 
  Crown, 
  Users, 
  Sparkles, 
  Zap, 
  Shield, 
  ArrowRight, 
  Key, 
  PlusCircle, 
  HelpCircle, 
  Gamepad2, 
  Flame, 
  Bot, 
  Check, 
  Layers,
  Globe,
  Lock,
  Share2
} from 'lucide-react';
import { GameMode, CommunicationMode, UserProfile, RoomSettings } from '../types/game';
import { sound } from '../utils/sound';
import { PublicRoomsList } from './PublicRoomsList';

interface HomeHubProps {
  user: UserProfile;
  socket?: Socket | null;
  onCreateRoom: (settings: Partial<RoomSettings>) => void;
  onJoinRoom: (roomCode: string) => void;
  onOpenRules: () => void;
  initialRoomCode?: string;
}

export const HomeHub: React.FC<HomeHubProps> = ({
  user,
  socket,
  onCreateRoom,
  onJoinRoom,
  onOpenRules,
  initialRoomCode = ''
}) => {
  // 3 Primary Entry Options: 'bot' | 'friends' | 'public'
  const [entryOption, setEntryOption] = useState<'bot' | 'friends' | 'public'>('public');

  // Game variant selection
  const [selectedGame, setSelectedGame] = useState<'raja-rani' | 'chor-police' | 'secret-minister'>('raja-rani');
  const [selectedMode, setSelectedMode] = useState<GameMode>('normal');
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>('debate');
  const [turnDuration, setTurnDuration] = useState<number>(60);
  const [rounds, setRounds] = useState<number>(5);

  // Private Friends Sub-Tab: 'create' | 'join'
  const [friendsSubTab, setFriendsSubTab] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState(initialRoomCode);
  const [joinError, setJoinError] = useState('');

  // Host Public Room Customizer Sub-State
  const [showPublicHostForm, setShowPublicHostForm] = useState(false);

  useEffect(() => {
    if (initialRoomCode) {
      setJoinCode(initialRoomCode.toUpperCase());
      setEntryOption('friends');
      setFriendsSubTab('join');
    }
  }, [initialRoomCode]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (cleanCode.length < 4) {
      setJoinError('Enter a valid 6-character room code');
      sound.playDefeat();
      return;
    }
    setJoinError('');
    sound.playClick();
    onJoinRoom(cleanCode);
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
    } catch (e) {
      console.warn('Clipboard read denied');
    }
  };

  // 1. Play with Bot handler
  const handleStartSoloBot = () => {
    sound.playClick();
    if (socket && socket.connected) {
      socket.emit('room:createSoloBot', {
        playerName: user.name,
        avatar: user.avatar,
        mode: selectedMode,
        communicationMode
      });
    } else {
      // Fallback
      onCreateRoom({
        mode: selectedMode,
        communicationMode,
        maxRounds: rounds,
        turnDuration,
        isPrivate: true
      });
    }
  };

  // 2. Play with Friends (Private Room) handler
  const handleCreatePrivateRoom = () => {
    sound.playRoyalFanfare();
    onCreateRoom({
      mode: selectedMode,
      communicationMode,
      maxRounds: rounds,
      turnDuration,
      isPrivate: true,
      minPlayers: 4,
      maxPlayers: 12
    });
  };

  // 3. Public Room Quick Match handler
  const handleQuickMatch = () => {
    sound.playClick();
    if (socket && socket.connected) {
      socket.emit('room:quickMatch', {
        playerName: user.name,
        avatar: user.avatar,
        mode: selectedMode
      });
    } else {
      onCreateRoom({
        mode: selectedMode,
        communicationMode: 'debate',
        maxRounds: 5,
        isPrivate: false
      });
    }
  };

  // 3b. Host Public Room handler
  const handleHostPublicRoom = () => {
    sound.playRoyalFanfare();
    onCreateRoom({
      mode: selectedMode,
      communicationMode,
      maxRounds: rounds,
      turnDuration,
      isPrivate: false,
      minPlayers: 4,
      maxPlayers: 8
    });
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-4">
      <div className="max-w-4xl mx-auto w-full space-y-7">
        
        {/* Header Hero */}
        <div className="text-center space-y-2.5 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Royal Social Deduction & Bluffing</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            👑 <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">KINGDOM COURT</span> (KING & THIEF)
          </h1>

          <p className="max-w-lg mx-auto text-xs sm:text-sm text-slate-400 font-medium">
            Choose how you want to play: Practice against smart AI, host a private room for friends, or join public matchmaking!
          </p>
        </div>

        {/* 3 PRIMARY PLAY OPTIONS TABS */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl max-w-xl mx-auto w-full">
          
          {/* Option 1: Play with Bot */}
          <button
            onClick={() => {
              sound.playClick();
              setEntryOption('bot');
            }}
            className={`py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              entryOption === 'bot'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-300" />
            <span className="whitespace-nowrap">Play with Bot</span>
          </button>

          {/* Option 2: Play with Friends */}
          <button
            onClick={() => {
              sound.playClick();
              setEntryOption('friends');
            }}
            className={`py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              entryOption === 'friends'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4 text-blue-300" />
            <span className="whitespace-nowrap">Play with Friends</span>
          </button>

          {/* Option 3: Public Room */}
          <button
            onClick={() => {
              sound.playClick();
              setEntryOption('public');
            }}
            className={`py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
              entryOption === 'public'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="whitespace-nowrap">Public Room</span>
          </button>

        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PLAY WITH BOT (SOLO PRACTICE) */}
        {/* ========================================================================= */}
        {entryOption === 'bot' && (
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-w-xl mx-auto w-full backdrop-blur-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Bot className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-base text-slate-100">Play Against Smart AI Bots</h3>
                <p className="text-xs text-slate-400">Single player court match with 3 AI Courtiers</p>
              </div>
            </div>

            {/* Game Variant Selector */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-300">Select Game Rule Variant:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedMode('normal');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedMode === 'normal'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-100 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">👑 Classic 4-Roles</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Raja (1000), Rani (800), Police (500), Thief (0)</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedMode('modern_abilities');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedMode === 'modern_abilities'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-100 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">⚡ Powers & Abilities</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Lie Detector, Bribe Alibi, Thief Escape Trap</div>
                </button>
              </div>
            </div>

            {/* Rounds Selector */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-semibold text-slate-300">Total Rounds:</label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRounds(num);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      rounds === num
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {num} Rounds
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartSoloBot}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 hover:from-purple-500 hover:to-indigo-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bot className="w-5 h-5" />
              <span>START AI PRACTICE MATCH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PLAY WITH FRIENDS (PRIVATE ROOM) */}
        {/* ========================================================================= */}
        {entryOption === 'friends' && (
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-w-xl mx-auto w-full backdrop-blur-sm animate-fadeIn">
            
            {/* Friends Sub Tabs: Create vs Join */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => {
                  sound.playClick();
                  setFriendsSubTab('create');
                }}
                className={`py-2.5 rounded-xl transition-all ${
                  friendsSubTab === 'create'
                    ? 'bg-blue-600 text-white shadow-md font-black'
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
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔑 Join with Code
              </button>
            </div>

            {friendsSubTab === 'create' ? (
              <div className="space-y-4 text-left">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Private rooms are exclusive. Only friends with your 6-digit code can join.</span>
                </div>

                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Court Rules Mode:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedMode('normal');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedMode === 'normal'
                          ? 'bg-blue-600/20 border-blue-400 text-blue-100 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">👑 Classic Indian Rules</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Original Raja, Rani, Chor, Sipahi scores</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedMode('modern_abilities');
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedMode === 'modern_abilities'
                          ? 'bg-blue-600/20 border-blue-400 text-blue-100 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">⚡ Powers & Abilities</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Courtier abilities & tactical traps</div>
                    </button>
                  </div>
                </div>

                {/* Rounds */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Total Rounds:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setRounds(num);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          rounds === num
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {num} Rounds
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreatePrivateRoom}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>CREATE PRIVATE ROOM & GET CODE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Join with Code Sub-Tab */
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Friend's 6-Digit Room Code:</label>
                    <button
                      type="button"
                      onClick={handlePasteCode}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
                    >
                      Paste Code
                    </button>
                  </div>

                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase());
                      setJoinError('');
                    }}
                    placeholder="ENTER 6-DIGIT CODE"
                    maxLength={6}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-center text-lg font-mono font-black tracking-widest text-blue-300 uppercase placeholder-slate-600 focus:outline-none"
                  />
                  {joinError && (
                    <div className="text-rose-400 text-xs mt-1 text-center font-medium">
                      {joinError}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>JOIN FRIEND'S ROOM</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PUBLIC ROOM (AUTO MATCHMAKING & PUBLIC LOBBIES) */}
        {/* ========================================================================= */}
        {entryOption === 'public' && (
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-w-xl mx-auto w-full backdrop-blur-sm animate-fadeIn">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Public Room Matchmaking</h3>
                  <p className="text-xs text-slate-400">Play with other online players without needing private invite codes</p>
                </div>
              </div>

              <button
                onClick={() => setShowPublicHostForm(!showPublicHostForm)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 transition-colors whitespace-nowrap"
              >
                {showPublicHostForm ? 'View Public List' : '➕ Host Public Room'}
              </button>
            </div>

            {showPublicHostForm ? (
              /* Host Public Room Form */
              <div className="space-y-4 text-left border-t border-slate-800 pt-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  🌐 Your room will be listed in the Public Rooms list for anyone online to join!
                </div>

                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Game Rules Mode:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMode('normal')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedMode === 'normal'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs">👑 Classic 4-Roles</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMode('modern_abilities')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedMode === 'modern_abilities'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs">⚡ Powers & Abilities</div>
                    </button>
                  </div>
                </div>

                {/* Rounds */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Total Match Rounds:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRounds(num)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          rounds === num
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {num} Rounds
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleHostPublicRoom}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>HOST PUBLIC ROOM NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Public Rooms List & Quick Match */
              <PublicRoomsList
                socket={socket || null}
                gameType="raja_rani"
                onJoinRoom={onJoinRoom}
                onQuickMatch={handleQuickMatch}
                accentColor="amber"
              />
            )}

          </div>
        )}

        {/* Footer info note */}
        <div className="text-center text-xs text-slate-500 pt-2 flex items-center justify-center gap-2">
          <span>👑 Traditional Indian Royal Game</span>
          <span>•</span>
          <button
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            className="text-amber-400 hover:underline cursor-pointer"
          >
            How to Play Rules
          </button>
        </div>

      </div>
    </div>
  );
};
