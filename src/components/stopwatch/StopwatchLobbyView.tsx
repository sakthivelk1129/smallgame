import React, { useState } from 'react';
import { 
  Timer, 
  Copy, 
  Check, 
  Users, 
  Play, 
  Bot, 
  Plus, 
  Trash2, 
  Share2, 
  QrCode, 
  LogOut, 
  ShieldCheck, 
  Zap, 
  Flame, 
  CheckCircle2, 
  XCircle,
  EyeOff,
  Layers,
  Scale
} from 'lucide-react';
import { StopwatchGameState, StopwatchPlayer, StopwatchTeam } from '../../types/stopwatch';
import { sound } from '../../utils/sound';

interface StopwatchLobbyViewProps {
  gameState: StopwatchGameState;
  currentUserId: string;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onSwitchTeam: (team: StopwatchTeam) => void;
}

export const StopwatchLobbyView: React.FC<StopwatchLobbyViewProps> = ({
  gameState,
  currentUserId,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  onAddBot,
  onRemoveBot,
  onSwitchTeam
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const localPlayer = gameState.players.find(p => p.id === currentUserId);
  const isHost = localPlayer?.isHost || false;
  const isReady = localPlayer?.isReady || false;

  const playerCount = gameState.players.length;
  const isTeamFormat = gameState.settings.format === 'team';

  // Can host start?
  const allReady = gameState.players.every(p => p.isBot || p.isReady);
  const canStart = isHost && playerCount >= 2 && allReady;

  const inviteUrl = `${window.location.origin}${window.location.pathname}?stopwatchRoom=${gameState.roomId}`;

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
      `⏱️ Join my Stopwatch Precision Duel Room!\n\nRoom Code: *${gameState.roomId}*\nFormat: ${isTeamFormat ? '🔴 Team Red vs 🔵 Team Blue' : '👤 Single'}\nRounds: ${gameState.maxRounds}\n\n👉 Join instantly: ${inviteUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const redPlayers = gameState.players.filter(p => p.team === 'red');
  const bluePlayers = gameState.players.filter(p => p.team === 'blue');

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 py-2 px-3 sm:px-4 animate-fadeIn">
      
      {/* Top Lobby Header Card */}
      <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Room Code & Info */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                ⏱️
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start">
                <span>Stopwatch Room Code</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px]">
                  {gameState.settings.playMode === 'friends' ? 'Private Room' : gameState.settings.playMode === 'bot' ? 'Bot Practice' : 'Public Room'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-3xl font-black tracking-widest text-cyan-300">
                  {gameState.roomId}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors cursor-pointer"
                  title="Copy Room Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors cursor-pointer"
                  title="Copy Invite Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowQr(true)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  title="Show QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Config Badges & Share button */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-cyan-400" />
              <span>{gameState.maxRounds} Rounds</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
              <span>🎯 {gameState.settings.minTarget?.toFixed(1) || '1.0'}s – {gameState.settings.maxTarget?.toFixed(1) || '10.0'}s</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-teal-400" />
              <span>{isTeamFormat ? 'Team Red vs Blue' : 'Single 1v1 / FFA'}</span>
            </div>

            {gameState.settings.blindfoldMode && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Blindfold Mode</span>
              </div>
            )}

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite via WhatsApp</span>
            </button>
          </div>

        </div>
      </div>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-200">Scan to Join Stopwatch Room</h3>
            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(inviteUrl)}`}
                alt="Room QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>
            <p className="text-xs text-slate-400 font-mono">Code: {gameState.roomId}</p>
            <button
              onClick={() => setShowQr(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Players Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Challengers in Lobby ({playerCount}/{gameState.settings.maxPlayers})
            </h2>
          </div>

          {isHost && playerCount < gameState.settings.maxPlayers && (
            <button
              onClick={() => {
                sound.playClick();
                onAddBot();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add AI Bot</span>
            </button>
          )}
        </div>

        {/* SINGLE FORMAT PLAYERS GRID */}
        {!isTeamFormat ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {gameState.players.map((p) => {
              const isMe = p.id === currentUserId;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isMe
                      ? 'bg-cyan-950/40 border-cyan-500/60 ring-2 ring-cyan-500/20'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                      {p.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100">{p.name}</span>
                        {p.isHost && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                            HOST
                          </span>
                        )}
                        {p.isBot && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold">
                            BOT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {isMe ? '(You)' : p.isBot ? `Precision: ${p.botDifficulty?.toUpperCase() || 'NORMAL'}` : 'Challenger'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.isReady ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 animate-spin" />
                        <span>Waiting</span>
                      </span>
                    )}

                    {isHost && p.isBot && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onRemoveBot(p.id);
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
                        title="Remove Bot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TEAM FORMAT (RED VS BLUE) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Team Red */}
            <div className="p-4 rounded-3xl bg-rose-950/30 border-2 border-rose-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>TEAM RED ({redPlayers.length})</span>
                </div>
                {localPlayer?.team !== 'red' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSwitchTeam('red');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30"
                  >
                    Join Red
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {redPlayers.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                        {p.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                          <span>{p.name}</span>
                          {p.id === currentUserId && <span className="text-[10px] text-cyan-400">(You)</span>}
                        </div>
                      </div>
                    </div>
                    <div>
                      {p.isReady ? (
                        <span className="text-emerald-400 text-xs font-bold">Ready ✅</span>
                      ) : (
                        <span className="text-amber-400 text-xs font-bold">Waiting ⏳</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Blue */}
            <div className="p-4 rounded-3xl bg-cyan-950/30 border-2 border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/30">
                <div className="flex items-center gap-2 font-bold text-cyan-300">
                  <span className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span>TEAM BLUE ({bluePlayers.length})</span>
                </div>
                {localPlayer?.team !== 'blue' && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSwitchTeam('blue');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/30"
                  >
                    Join Blue
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {bluePlayers.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                        {p.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                          <span>{p.name}</span>
                          {p.id === currentUserId && <span className="text-[10px] text-cyan-400">(You)</span>}
                        </div>
                      </div>
                    </div>
                    <div>
                      {p.isReady ? (
                        <span className="text-emerald-400 text-xs font-bold">Ready ✅</span>
                      ) : (
                        <span className="text-amber-400 text-xs font-bold">Waiting ⏳</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Lobby Bottom Actions Footer */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <button
          onClick={() => {
            sound.playClick();
            onLeaveRoom();
          }}
          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Room</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Ready Button */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleReady();
            }}
            className={`flex-1 sm:flex-none px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
              isReady
                ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 animate-pulse'
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>YOU ARE READY ✅</span>
              </>
            ) : (
              <>
                <Timer className="w-4 h-4" />
                <span>CLICK TO READY ⏳</span>
              </>
            )}
          </button>

          {/* Host Start Match Button */}
          {isHost && (
            <button
              onClick={() => {
                if (canStart) {
                  sound.playRoyalFanfare();
                  onStartGame();
                } else if (playerCount < 2) {
                  sound.playDefeat();
                }
              }}
              disabled={!canStart}
              className={`flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                canStart
                  ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-xl shadow-cyan-500/25 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START MATCH</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
