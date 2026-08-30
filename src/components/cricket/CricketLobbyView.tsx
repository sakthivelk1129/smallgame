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
  Clock,
  Layers,
  Swords,
  Crown
} from 'lucide-react';
import { 
  CricketGameState, 
  CricketRoomSettings, 
  CricketGameMode, 
  RuleVariant 
} from '../../types/cricket';
import { sound } from '../../utils/sound';

interface CricketLobbyViewProps {
  gameState: CricketGameState;
  currentUserId: string;
  onToggleReady: () => void;
  onUpdateSettings: (settings: Partial<CricketRoomSettings>) => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onKickPlayer: (playerId: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const CricketLobbyView: React.FC<CricketLobbyViewProps> = ({
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
    const url = `${window.location.origin}/?cricketRoom=${gameState.roomId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Play Cricket Card Battle with me!',
        text: `Join my Cricket Card Battle room: ${gameState.roomId}`,
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
      <div className="bg-slate-900/90 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
            🏏
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              CRICKET PAVILION LOBBY (2–8 PLAYERS)
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-2xl sm:text-3xl font-black text-slate-100 tracking-wider">
                {gameState.roomId}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={shareInvite}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-sky-400" />
            <span>Invite</span>
          </button>

          {isHost && (
            <button
              onClick={() => {
                sound.playClick();
                setShowSettingsModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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
          🎴 <strong className="text-amber-400">{gameState.cardsPerPlayer} Cards / Player</strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
          🏆 <strong className="text-sky-400">
            {gameState.settings.gameMode === 'FIXED_ROUNDS' ? `${gameState.maxRounds} Fixed Rounds` : 'Elimination Mode'}
          </strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
          ✨ <strong className="text-purple-400">
            {gameState.settings.ruleVariant === 'SPECIAL_ABILITIES' ? 'Special Abilities ON' : 'Classic Top Trumps'}
          </strong>
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
          📚 <strong className="text-emerald-400">1,000 Player Pool</strong>
        </span>
      </div>

      {/* Players List Grid (2–8 max) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            <span>PLAYERS IN PAVILION ({gameState.players.length}/{gameState.settings.maxPlayers})</span>
          </span>

          {isHost && gameState.players.length < gameState.settings.maxPlayers && (
            <button
              onClick={() => {
                sound.playClick();
                onAddBot();
              }}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>+ Add Cricket Bot</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {gameState.players.map((p) => {
            const isMe = p.id === currentUserId;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isMe
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-md'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                    {p.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-slate-200 truncate">
                        {p.name}
                      </span>
                      {p.isHost && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Host" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {p.isBot ? '🤖 AI Player' : isMe ? '👤 You' : 'Player'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {p.isReady ? (
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      READY
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                      WAITING
                    </span>
                  )}

                  {isHost && !isMe && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (p.isBot) onRemoveBot(p.id);
                        else onKickPlayer(p.id);
                      }}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors"
                      title={p.isBot ? 'Remove Bot' : 'Kick Player'}
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={() => {
            sound.playClick();
            onLeaveRoom();
          }}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>LEAVE PAVILION</span>
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3">
          {/* Ready Button for non-host */}
          {!isHost && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleReady();
              }}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                me?.isReady
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{me?.isReady ? 'READY TO BATTLE' : 'CLICK TO READY'}</span>
            </button>
          )}

          {/* Start Game for Host */}
          {isHost && (
            <button
              disabled={!canStart}
              onClick={() => {
                sound.playClick();
                onStartGame();
              }}
              className={`w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl ${
                canStart
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{canStart ? 'START CRICKET BATTLE' : 'WAITING FOR ALL PLAYERS...'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Host Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Match Settings</span>
            </h3>

            {/* Cards Per Player */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300">
                Cards per Player:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      sound.playCardClick();
                      onUpdateSettings({ cardsPerPlayer: c });
                    }}
                    className={`py-1.5 rounded-xl font-bold text-xs transition-all ${
                      gameState.cardsPerPlayer === c
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {c} Cards
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
                    sound.playCardClick();
                    onUpdateSettings({ gameMode: 'FIXED_ROUNDS' });
                  }}
                  className={`p-2 rounded-xl font-bold text-xs border text-left transition-all ${
                    gameState.settings.gameMode === 'FIXED_ROUNDS'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>🏆 Fixed Rounds</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">Most cards at end wins</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playCardClick();
                    onUpdateSettings({ gameMode: 'ELIMINATION' });
                  }}
                  className={`p-2 rounded-xl font-bold text-xs border text-left transition-all ${
                    gameState.settings.gameMode === 'ELIMINATION'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>⚡ Elimination</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">0 cards = out</div>
                </button>
              </div>
            </div>

            {/* Rule Variant */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300">
                Rule Variant:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playCardClick();
                    onUpdateSettings({ ruleVariant: 'CLASSIC' });
                  }}
                  className={`p-2 rounded-xl font-bold text-xs border text-left transition-all ${
                    gameState.settings.ruleVariant === 'CLASSIC'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>🏏 Classic Trumps</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">Pure stat comparison</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playCardClick();
                    onUpdateSettings({ ruleVariant: 'SPECIAL_ABILITIES' });
                  }}
                  className={`p-2 rounded-xl font-bold text-xs border text-left transition-all ${
                    gameState.settings.ruleVariant === 'SPECIAL_ABILITIES'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>✨ Special Powers</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">Stat boosts on epics</div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
