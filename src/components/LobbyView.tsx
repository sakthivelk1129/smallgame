import React, { useState } from 'react';
import { 
  Crown, 
  Copy, 
  Check, 
  Users, 
  Play, 
  UserPlus, 
  Bot, 
  Settings, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  QrCode, 
  X, 
  Trash2,
  Share2,
  Clock,
  Eye,
  MessageCircle
} from 'lucide-react';
import { GameState, Player, GameMode, CommunicationMode, RoomSettings } from '../types/game';
import { sound } from '../utils/sound';

interface LobbyViewProps {
  gameState: GameState;
  currentUserId: string;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onUpdateSettings: (settings: Partial<RoomSettings>) => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onKickPlayer: (playerId: string) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  currentUserId,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  onUpdateSettings,
  onAddBot,
  onRemoveBot,
  onKickPlayer
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const localPlayer = gameState.players.find(p => p.id === currentUserId);
  const isHost = localPlayer?.isHost || false;
  const isReady = localPlayer?.isReady || false;

  const playerCount = gameState.players.length;
  const minPlayers = gameState.settings.minPlayers || 4;
  const maxPlayers = gameState.settings.maxPlayers || 12;

  const canStart = isHost && playerCount >= minPlayers && gameState.players.every(p => p.isBot || p.isReady);

  const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${gameState.roomId}`;

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(gameState.roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    sound.playClick();
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    sound.playClick();
    const text = encodeURIComponent(
      `👑 Join my Raja Rani Online Court Room!\n\nRoom Code: *${gameState.roomId}*\nMode: ${gameState.mode === 'special' ? '🔴 Special' : '🟢 Normal'}\n\n👉 Join instantly: ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const turnTimer = gameState.settings.turnDuration || 60;
  const commMode = gameState.settings.communicationMode || 'debate';

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Lobby Header Card */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Room Code & Title */}
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Crown className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                  <span>Royal Court Room</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">Play with Friends</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl font-black tracking-widest text-amber-300">
                    {gameState.roomId}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                    title="Copy Room Code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                    title="Copy Invite Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowQr(true)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Show QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Room Info Pills & Host Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Discussion Mode Badge */}
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                commMode === 'face_to_face'
                  ? 'bg-purple-950/50 border-purple-500/50 text-purple-300'
                  : 'bg-amber-950/50 border-amber-500/50 text-amber-300'
              }`}>
                {commMode === 'face_to_face' ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>👁️ Option 2: Face-to-Face</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>💬 Option 1: Court Debate</span>
                  </>
                )}
              </div>

              {/* Timer Badge */}
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Timer: {turnTimer >= 60 ? `${Math.floor(turnTimer / 60)}m ${turnTimer % 60 ? `${turnTimer % 60}s` : ''}`.trim() : `${turnTimer}s`}</span>
              </div>

              {/* Mode Badge */}
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                gameState.mode === 'special'
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              }`}>
                <span>{gameState.mode === 'special' ? '🔴 Special' : '🟢 Normal'}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-300">
                {gameState.maxRounds} Rounds
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300">
                {playerCount} / {maxPlayers} Players
              </div>

              {isHost && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowSettingsModal(true);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Room Settings"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                </button>
              )}
            </div>

          </div>

          {/* Quick Friend Invite Action Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Share link with friends to play together on their phones/laptops!</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

        </div>

        {/* Player Roster Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-slate-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Courtiers in the Room ({playerCount}/{maxPlayers})
            </h3>

            {isHost && playerCount < maxPlayers && (
              <button
                onClick={() => {
                  sound.playPop();
                  onAddBot();
                }}
                className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Bot className="w-4 h-4" />
                <span>+ Add Bot Courtier</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {gameState.players.map((p) => {
              const isMe = p.id === currentUserId;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all relative flex items-center justify-between ${
                    p.isHost
                      ? 'bg-gradient-to-r from-amber-950/30 to-slate-900 border-amber-500/40 shadow-md shadow-amber-500/5'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                      {p.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100 truncate">
                          {p.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-semibold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        {p.isHost && (
                          <span className="text-amber-400 font-bold flex items-center gap-0.5 text-[11px]">
                            <Crown className="w-3 h-3" /> Host
                          </span>
                        )}
                        {p.isBot && (
                          <span className="text-purple-400 font-medium text-[11px]">
                            🤖 Bot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Ready Indicator */}
                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      p.isReady || p.isBot
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {p.isReady || p.isBot ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>READY</span>
                        </>
                      ) : (
                        <span>WAITING</span>
                      )}
                    </div>

                    {/* Host Kick / Bot Remove Button */}
                    {isHost && !p.isHost && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          if (p.isBot) {
                            onRemoveBot(p.id);
                          } else {
                            onKickPlayer(p.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title={p.isBot ? 'Remove Bot' : 'Kick Player'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty Slot Placeholders */}
            {Array.from({ length: Math.max(0, minPlayers - playerCount) }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="p-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-center text-xs text-slate-500 font-medium"
              >
                Waiting for Player {playerCount + idx + 1}...
              </div>
            ))}
          </div>

          {playerCount < minPlayers && (
            <div className="text-xs text-amber-400/90 text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 font-medium">
              ⚠️ Minimum {minPlayers} players required to play Raja Rani (Click <strong>"+ Add Bot Courtier"</strong> above for instant testing!)
            </div>
          )}
        </div>

      </div>

      {/* Lobby Bottom Actions Bar */}
      <div className="max-w-4xl mx-auto w-full pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={() => {
            sound.playClick();
            onLeaveRoom();
          }}
          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>LEAVE ROOM</span>
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3">
          {/* Ready Toggle (for non-host or host) */}
          {!isHost && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleReady();
              }}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm transition-all ${
                isReady
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 shadow'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isReady ? 'READY! (CANCEL)' : 'READY UP'}
            </button>
          )}

          {/* Host Start Game Button */}
          {isHost && (
            <button
              id="btn-start-game"
              onClick={() => {
                if (canStart) {
                  sound.playRoyalFanfare();
                  onStartGame();
                } else {
                  sound.playDefeat();
                }
              }}
              disabled={!canStart}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START GAME ({playerCount} PLAYERS)</span>
            </button>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-amber-300">Invite with Room Code</h4>
              <button onClick={() => setShowQr(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-white rounded-xl flex items-center justify-center mx-auto shadow-inner">
              <div className="text-center">
                <Crown className="w-12 h-12 text-slate-900 mx-auto mb-2" />
                <div className="font-mono text-2xl font-black text-slate-950 tracking-widest">
                  {gameState.roomId}
                </div>
                <div className="text-[10px] text-slate-500 font-bold mt-1">RAJA RANI ONLINE</div>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
            >
              {copiedCode ? 'Copied to Clipboard!' : 'Copy Code & Link'}
            </button>
          </div>
        </div>
      )}

      {/* Host Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">Room Settings</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Discussion Mode Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Discussion Style:</span>
                <span className="text-[10px] text-amber-400 font-normal">Choose 1 of 2 Options</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => onUpdateSettings({ communicationMode: 'debate' })}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    (gameState.settings.communicationMode || 'debate') === 'debate'
                      ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>💬 Option 1: Online Court Debate</span>
                    {(gameState.settings.communicationMode || 'debate') === 'debate' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Everyone can type in chat, give clues, fake claims, and confuse the Police!
                  </p>
                </button>

                <button
                  onClick={() => onUpdateSettings({ communicationMode: 'face_to_face' })}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    gameState.settings.communicationMode === 'face_to_face'
                      ? 'bg-purple-500/15 border-purple-400 text-purple-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>👁️ Option 2: In-Person / Face-to-Face</span>
                    {gameState.settings.communicationMode === 'face_to_face' && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    No chat clues! Friends stare in person, reading body language, giggles & poker faces.
                  </p>
                </button>
              </div>
            </div>

            {/* Mode Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Game Rules Mode:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ mode: 'normal' })}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                    gameState.mode === 'normal'
                      ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🟢 Normal Mode
                </button>
                <button
                  onClick={() => onUpdateSettings({ mode: 'special' })}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                    gameState.mode === 'special'
                      ? 'bg-rose-950/50 border-rose-400 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🔴 Special Mode
                </button>
              </div>
            </div>

            {/* Police Turn Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Find Thief Interrogation Time (Max 3 Min):</label>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {turnTimer >= 60 ? `${Math.floor(turnTimer / 60)}m ${turnTimer % 60 ? `${turnTimer % 60}s` : ''}`.trim() : `${turnTimer}s`}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[
                  { sec: 30, label: '30s' },
                  { sec: 45, label: '45s' },
                  { sec: 60, label: '1 min' },
                  { sec: 90, label: '1.5 min' },
                  { sec: 120, label: '2 min' },
                  { sec: 180, label: '3 min' }
                ].map(({ sec, label }) => (
                  <button
                    key={sec}
                    onClick={() => onUpdateSettings({ turnDuration: sec })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      (gameState.settings.turnDuration || 60) === sec
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Rounds */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Match Rounds:</label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map((r) => (
                  <button
                    key={r}
                    onClick={() => onUpdateSettings({ maxRounds: r })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      gameState.maxRounds === r
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {r} Rounds
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
