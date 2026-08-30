import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
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
  BookOpen,
  Crown,
  Layers,
  Swords,
  Bot,
  Globe,
  Lock
} from 'lucide-react';
import { UserProfile } from '../../types/game';
import { 
  CricketRoomSettings, 
  CricketGameMode, 
  RuleVariant 
} from '../../types/cricket';
import { sound } from '../../utils/sound';
import { PublicRoomsList } from '../PublicRoomsList';

interface CricketHomeHubProps {
  user: UserProfile;
  socket?: Socket | null;
  onCreateRoom: (settings: Partial<CricketRoomSettings>, isSinglePlayer?: boolean) => void;
  onJoinRoom: (roomCode: string) => void;
  onQuickMatch?: (ruleVariant?: RuleVariant) => void;
  onSoloBot?: (ruleVariant?: RuleVariant) => void;
  onOpenRules: () => void;
  onOpenEncyclopedia: () => void;
  initialRoomCode?: string;
}

export const CricketHomeHub: React.FC<CricketHomeHubProps> = ({
  user,
  socket,
  onCreateRoom,
  onJoinRoom,
  onQuickMatch,
  onSoloBot,
  onOpenRules,
  onOpenEncyclopedia,
  initialRoomCode = ''
}) => {
  // 3 Primary Entry Options: 'bot' | 'friends' | 'public'
  const [entryOption, setEntryOption] = useState<'bot' | 'friends' | 'public'>('friends');

  // Friends Sub-tab: 'create' | 'join'
  const [friendsSubTab, setFriendsSubTab] = useState<'create' | 'join'>('create');

  // Multiplayer settings
  const [cardsCount, setCardsCount] = useState<number>(10);
  const [gameMode, setGameMode] = useState<CricketGameMode>('FIXED_ROUNDS');
  const [maxRounds, setMaxRounds] = useState<number>(15);
  const [ruleVariant, setRuleVariant] = useState<RuleVariant>('CLASSIC');
  const [showHostPublicForm, setShowHostPublicForm] = useState(false);

  // Join Room Code
  const [joinCode, setJoinCode] = useState(initialRoomCode);

  useEffect(() => {
    if (initialRoomCode) {
      setJoinCode(initialRoomCode.toUpperCase());
      setEntryOption('friends');
      setFriendsSubTab('join');
    }
  }, [initialRoomCode]);

  const handleStartSoloBotDuel = () => {
    sound.playClick();
    if (onSoloBot) {
      onSoloBot(ruleVariant);
    } else {
      onCreateRoom(
        {
          cardsPerPlayer: 10,
          gameMode: 'FIXED_ROUNDS',
          maxRounds: 15,
          ruleVariant,
          maxPlayers: 2,
          isPrivate: true
        },
        true // single player
      );
    }
  };

  const handleCreatePrivateRoom = () => {
    sound.playClick();
    onCreateRoom(
      {
        cardsPerPlayer: cardsCount,
        gameMode,
        maxRounds: gameMode === 'FIXED_ROUNDS' ? maxRounds : 50,
        ruleVariant,
        maxPlayers: 8,
        isPrivate: true
      },
      false
    );
  };

  const handleHostPublicRoom = () => {
    sound.playClick();
    onCreateRoom(
      {
        cardsPerPlayer: cardsCount,
        gameMode,
        maxRounds: gameMode === 'FIXED_ROUNDS' ? maxRounds : 50,
        ruleVariant,
        maxPlayers: 8,
        isPrivate: false
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
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-7 select-none animate-fadeIn flex flex-col justify-center min-h-[85vh]">
      
      {/* Title & Brand Hero */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
          <Crown className="w-3.5 h-3.5" />
          <span>OFFICIAL 1,000 CRICKET PLAYERS POOL</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-md">
          CRICKET CARD BATTLE
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          Fast competitive multiplayer card battle with real cricket player statistics. Choose your best stat, outscore opponents, and collect all cards!
        </p>
      </div>

      {/* 3 PRIMARY ENTRY OPTIONS TABS */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl max-w-xl mx-auto w-full">
        {/* 1. Bot */}
        <button
          onClick={() => {
            sound.playClick();
            setEntryOption('bot');
          }}
          className={`py-2.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
            entryOption === 'bot'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200'
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
          className={`py-2.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
            entryOption === 'friends'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-blue-300" />
          <span>Play with Friends</span>
        </button>

        {/* 3. Public */}
        <button
          onClick={() => {
            sound.playClick();
            setEntryOption('public');
          }}
          className={`py-2.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
            entryOption === 'public'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-[1.02]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Public Room</span>
        </button>
      </div>

      {/* Main Options Box */}
      <div className="bg-slate-900/80 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md max-w-xl mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* TAB 1: PLAY WITH BOT (SOLO DUEL) */}
        {/* ========================================================================= */}
        {entryOption === 'bot' && (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="flex items-center gap-3 text-left">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Quick Bot Duel (Single Player)</h3>
                <p className="text-xs text-slate-400">10 cards dealt from 1,000 real cricket stars. 1-on-1 vs AI!</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400">Dealt Cards</span>
                <div className="text-sm font-black text-slate-200">10 Cards Each</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-400">Match Length</span>
                <div className="text-sm font-black text-slate-200">15 Fast Rounds</div>
              </div>
            </div>

            {/* Rule Variant */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300">Match Rules:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRuleVariant('CLASSIC')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    ruleVariant === 'CLASSIC'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>⚔️ Classic Clash</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">Highest stat claims round</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRuleVariant('TRUMP_CARD')}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    ruleVariant === 'TRUMP_CARD'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>🃏 Trump Cards</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">Legendary cards win instant</div>
                </button>
              </div>
            </div>

            <button
              onClick={handleStartSoloBotDuel}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Bot className="w-5 h-5" />
              <span>START AI CRICKET DUEL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PLAY WITH FRIENDS (PRIVATE ROOM) */}
        {/* ========================================================================= */}
        {entryOption === 'friends' && (
          <div className="space-y-5 animate-fadeIn">
            
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
                {/* Cards Per Player */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Cards per Player:</span>
                    <span className="text-blue-400 font-mono font-bold">{cardsCount} Cards Each</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 15, 20].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          sound.playCardClick();
                          setCardsCount(c);
                        }}
                        className={`py-2 rounded-xl font-bold text-xs transition-all ${
                          cardsCount === c
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {c} Cards
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Victory Condition:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGameMode('FIXED_ROUNDS')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        gameMode === 'FIXED_ROUNDS'
                          ? 'bg-blue-600/20 border-blue-400 text-blue-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs">Fixed Rounds</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Most cards after {maxRounds} rounds wins</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGameMode('ELIMINATION')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        gameMode === 'ELIMINATION'
                          ? 'bg-blue-600/20 border-blue-400 text-blue-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="font-bold text-xs">Elimination Battle</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Play until one player collects all</div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCreatePrivateRoom}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>CREATE PRIVATE ROOM & GET CODE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Join Code Form */
              <form onSubmit={handleJoinSubmit} className="space-y-4 text-center">
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Enter Room Code:</label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) {
                            const clean = text.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                            if (clean) {
                              setJoinCode(clean.substring(0, 6));
                              sound.playPop();
                            }
                          }
                        } catch {}
                      }}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>📋 Paste Code</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (e.g. CRK921)"
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-blue-400 rounded-2xl p-4 text-center font-mono font-black text-2xl tracking-widest text-blue-300 uppercase placeholder:text-slate-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ENTER CRICKET PAVILION</span>
                </button>
              </form>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PUBLIC ROOM (AUTO MATCHMAKING & PUBLIC LOBBIES) */}
        {/* ========================================================================= */}
        {entryOption === 'public' && (
          <div className="space-y-5 animate-fadeIn">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-left">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Public Cricket Rooms</h3>
                  <p className="text-xs text-slate-400">Match with other cricket fans online automatically</p>
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
              <div className="space-y-4 text-left border-t border-slate-800 pt-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  🌐 Your pavilion will be listed in the Public Rooms list for anyone online to join!
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Cards per Player:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 15, 20].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCardsCount(c)}
                        className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                          cardsCount === c
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {c} Cards
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleHostPublicRoom}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>HOST PUBLIC CRICKET MATCH</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Public Rooms List */
              <PublicRoomsList
                socket={socket || null}
                gameType="cricket"
                onJoinRoom={onJoinRoom}
                onQuickMatch={() => onQuickMatch?.(ruleVariant)}
                accentColor="amber"
              />
            )}

          </div>
        )}

      </div>

      {/* Footer Navigation Buttons: Encyclopedia & Rules */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onOpenEncyclopedia();
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Browse 1,000 Cards Encyclopedia</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenRules();
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>How to Play & Rules</span>
        </button>
      </div>

    </div>
  );
};
