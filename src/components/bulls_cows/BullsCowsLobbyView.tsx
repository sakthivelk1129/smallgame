import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Share2, 
  Bot, 
  UserMinus, 
  Play, 
  LogOut, 
  Settings, 
  Users, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { BullsCowsGameState, BullsCowsRoomSettings, WordLength, GameDifficulty, BullsCowsGameMode } from '../../types/bullsCows';
import { sound } from '../../utils/sound';

interface BullsCowsLobbyViewProps {
  gameState: BullsCowsGameState;
  currentUserId: string;
  onToggleReady: () => void;
  onUpdateSettings: (settings: Partial<BullsCowsRoomSettings>) => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onKickPlayer: (playerId: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const BullsCowsLobbyView: React.FC<BullsCowsLobbyViewProps> = ({
  gameState,
  currentUserId,
  onToggleReady,
  onUpdateSettings,
  onAddBot,
  onRemoveBot,
  onKickPlayer,
  onStartGame,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const me = gameState.players.find(p => p.id === currentUserId);
  const isHost = me?.isHost || false;
  const allReady = gameState.players.every(p => p.isBot || p.isReady);
  const canStart = isHost && gameState.players.length >= 2 && allReady;

  const copyRoomCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(gameState.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = () => {
    sound.playClick();
    const url = `${window.location.origin}/?bcRoom=${gameState.roomId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Play Bulls & Cows with me!',
        text: `Join my Bulls & Cows room: ${gameState.roomId}`,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-6 select-none animate-fadeIn flex flex-col justify-between min-h-[85vh]">
      
      {/* Top Room Banner */}
      <div className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
            🐂
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              MULTIPLAYER ROOM LOBBY
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-2xl sm:text-3xl font-black text-slate-100 tracking-wider">
                {gameState.roomId}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={shareInvite}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Invite Friends</span>
          </button>

          {isHost && (
            <button
              onClick={() => {
                sound.playClick();
                setShowSettingsModal(true);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Game Settings"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Pill Row */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
          📏 <strong className="text-emerald-400">{gameState.settings.wordLength} Letters</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
          🏆 <strong className="text-amber-400">{gameState.maxRounds} {gameState.maxRounds === 1 ? 'Round' : 'Rounds'}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
          🎮 <strong className="text-purple-400">
            {gameState.settings.gameMode === 'SAME_TARGET' ? 'Same Target' : gameState.settings.gameMode === 'SECRET_TARGET' ? 'Secret Targets' : 'Speed Bulls'}
          </strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
          ⚡ <strong className="text-teal-400">{gameState.settings.difficulty}</strong>
        </span>
      </div>

      {/* Players List Grid (2–7 max) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>PLAYERS IN LOBBY ({gameState.players.length}/{gameState.settings.maxPlayers})</span>
          </span>

          {isHost && gameState.players.length < gameState.settings.maxPlayers && (
            <button
              onClick={() => {
                sound.playClick();
                onAddBot();
              }}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>+ Add AI Bot</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {gameState.players.map((p) => {
            const isMe = p.id === currentUserId;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isMe
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                    {p.avatar}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <span className="truncate max-w-[110px]">{p.name}</span>
                      {p.isHost && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/30">
                          HOST
                        </span>
                      )}
                      {p.isBot && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">
                          BOT
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {p.isReady ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Waiting
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Host Controls: Kick or Remove Bot */}
                {isHost && !isMe && (
                  <div>
                    {p.isBot ? (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onRemoveBot(p.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                        title="Remove Bot"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onKickPlayer(p.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                        title="Kick Player"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Tray */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        <button
          onClick={() => {
            sound.playClick();
            onLeaveRoom();
          }}
          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave Room</span>
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Ready Button */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleReady();
            }}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
              me?.isReady
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {me?.isReady ? 'READY ✓' : 'CLICK READY'}
          </button>

          {/* Start Game Button (Host Only) */}
          {isHost && (
            <button
              disabled={!canStart}
              onClick={() => {
                sound.playVictory();
                onStartGame();
              }}
              className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START GAME</span>
            </button>
          )}
        </div>
      </div>

      {/* Host Settings Modal */}
      {showSettingsModal && isHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-slate-100">Room Settings</h3>
              <p className="text-xs text-slate-400">Customize match parameters</p>
            </div>

            {/* Word Length */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300">Word Length:</label>
              <div className="grid grid-cols-5 gap-1.5">
                {([3, 4, 5, 6, 7] as WordLength[]).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => {
                      sound.playCardClick();
                      onUpdateSettings({ wordLength: len });
                    }}
                    className={`py-2 rounded-xl font-bold text-xs ${
                      gameState.settings.wordLength === len
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {len}L
                  </button>
                ))}
              </div>
            </div>

            {/* Game Mode */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300">Game Mode:</label>
              <div className="space-y-1.5">
                {[
                  { id: 'SAME_TARGET', label: 'Mode A: Same Target (Fewest guesses wins)' },
                  { id: 'SECRET_TARGET', label: 'Mode B: Secret Targets (Different word each)' },
                  { id: 'SPEED_BULLS', label: 'Mode C: First to Solve (Untimed race)' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      sound.playCardClick();
                      onUpdateSettings({ gameMode: m.id as BullsCowsGameMode });
                    }}
                    className={`w-full p-2 rounded-xl text-left text-xs font-bold border ${
                      gameState.settings.gameMode === m.id
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300">Max Rounds:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 10].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      sound.playCardClick();
                      onUpdateSettings({ maxRounds: r });
                    }}
                    className={`py-1.5 rounded-xl font-bold text-xs ${
                      gameState.maxRounds === r
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md"
            >
              SAVE SETTINGS
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
