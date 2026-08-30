import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Shield, 
  Clock, 
  Zap, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  User, 
  X,
  Lock,
  Search,
  MessageSquareQuote,
  Flame,
  Volume2,
  Mic
} from 'lucide-react';
import { GameState, Player, RoleType, RoleDefinition, AlibiClaim } from '../types/game';
import { sound } from '../utils/sound';
import { voiceManager } from '../utils/voiceManager';

interface GameplayViewProps {
  gameState: GameState;
  currentUserId: string;
  myRole?: RoleType;
  myRoleDefinition?: RoleDefinition;
  alibiClaims?: AlibiClaim[];
  inspectedSuspectId?: string | null;
  onAccuse: (targetPlayerId: string) => void;
  onUseAbility: (params: { abilityType: string; targetPlayerId?: string; secondTargetPlayerId?: string }) => void;
  onClaimAlibi?: (claimText: string, claimedRole?: string) => void;
  onInspectSuspect?: (targetPlayerId: string) => void;
  abilityResultModal?: { title: string; message: string } | null;
  onCloseAbilityResult: () => void;
}

export const GameplayView: React.FC<GameplayViewProps> = ({
  gameState,
  currentUserId,
  myRole,
  myRoleDefinition,
  alibiClaims = [],
  inspectedSuspectId,
  onAccuse,
  onUseAbility,
  onClaimAlibi,
  onInspectSuspect,
  abilityResultModal,
  onCloseAbilityResult
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAbilityModal, setShowAbilityModal] = useState(false);
  const [abilityTarget1, setAbilityTarget1] = useState<string>('');
  const [abilityTarget2, setAbilityTarget2] = useState<string>('');
  const [customAlibiText, setCustomAlibiText] = useState('');
  const [showCustomAlibiInput, setShowCustomAlibiInput] = useState(false);
  const [speakingPlayers, setSpeakingPlayers] = useState<Map<string, number>>(new Map());

  // Listen to live voice speaking status
  useEffect(() => {
    const unsub = voiceManager.onSpeaking((playerId, isSpeaking, audioLevel) => {
      setSpeakingPlayers((prev) => {
        const next = new Map(prev);
        if (isSpeaking) {
          next.set(playerId, audioLevel);
        } else {
          next.delete(playerId);
        }
        return next;
      });
    });
    return () => unsub();
  }, []);

  const isPolice = myRole === 'POLICE';
  const isRaja = currentUserId === gameState.rajaPlayerId;
  const isSuspect = !isPolice && !isRaja;

  const rajaPlayer = gameState.players.find(p => p.id === gameState.rajaPlayerId);
  const policePlayer = gameState.players.find(p => p.id === gameState.policePlayerId);
  const localPlayer = gameState.players.find(p => p.id === currentUserId);
  const hasUsedAbility = localPlayer?.hasUsedAbility || false;

  // Sound tick in last 5 seconds
  useEffect(() => {
    if (gameState.timer <= 5 && gameState.timer > 0) {
      sound.playTick();
    }
  }, [gameState.timer]);

  const handleSelectSuspect = (playerId: string) => {
    if (!isPolice) return;
    if (playerId === gameState.rajaPlayerId || playerId === currentUserId) return;

    sound.playHeartbeat();
    setSelectedTargetId(playerId);
    if (onInspectSuspect) {
      onInspectSuspect(playerId);
    }
  };

  const handleOpenConfirm = () => {
    if (!selectedTargetId) return;
    sound.playSuspense();
    setShowConfirmModal(true);
  };

  const handleConfirmAccuse = () => {
    if (!selectedTargetId) return;
    sound.playGavel();
    onAccuse(selectedTargetId);
    setShowConfirmModal(false);
  };

  const handleExecuteAbility = () => {
    if (!myRole) return;
    sound.playClick();
    onUseAbility({
      abilityType: myRole,
      targetPlayerId: abilityTarget1 || undefined,
      secondTargetPlayerId: abilityTarget2 || undefined
    });
    setShowAbilityModal(false);
  };

  const handleShoutAlibi = (claimText: string, claimedRole?: string) => {
    sound.playPop();
    if (onClaimAlibi) {
      onClaimAlibi(claimText, claimedRole);
    }
  };

  const selectedTargetPlayer = gameState.players.find(p => p.id === selectedTargetId);

  // Get active alibi for player
  const getLatestAlibi = (playerId: string) => {
    const playerClaims = alibiClaims.filter(c => c.playerId === playerId);
    return playerClaims[playerClaims.length - 1];
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-5 max-w-6xl mx-auto w-full space-y-4 select-none">
      
      {/* Top HUD: Round, Timer & Discussion Mode Announcement */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-md">
          
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-slate-400">
              ROUND <span className="text-amber-400 font-mono font-black text-sm">{gameState.currentRound}</span> / {gameState.maxRounds}
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Raja: <strong>{rajaPlayer ? rajaPlayer.name : 'Unknown'}</strong></span>
            </div>
          </div>

          {/* Countdown Timer with MM:SS formatting */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-black text-sm transition-colors ${
            gameState.timer <= 10
              ? 'bg-rose-500/25 text-rose-400 border border-rose-500/50 animate-pulse'
              : 'bg-slate-950 text-amber-400 border border-amber-500/30'
          }`}>
            <Clock className="w-4 h-4" />
            <span>
              {String(Math.floor(gameState.timer / 60)).padStart(2, '0')}:
              {String(gameState.timer % 60).padStart(2, '0')}
            </span>
          </div>

        </div>

        {/* Discussion Mode Banner */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between shadow-sm ${
          (gameState.settings.communicationMode || 'debate') === 'face_to_face'
            ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">
              {(gameState.settings.communicationMode || 'debate') === 'face_to_face' ? '👁️' : '💬'}
            </span>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>
                  {(gameState.settings.communicationMode || 'debate') === 'face_to_face'
                    ? 'Face-to-Face Mode (In-Person Observation)'
                    : 'Online Court Debate (Bluff, Clue & Confuse!)'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700">
                  {(gameState.settings.communicationMode || 'debate') === 'face_to_face'
                    ? 'Chat Muted • Look at Real Faces'
                    : 'Chat & Alibis Open'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {(gameState.settings.communicationMode || 'debate') === 'face_to_face'
                  ? 'Observe your friends closely! The Thief might be smiling nervously or avoiding eye contact.'
                  : 'Suspects can shout defenses below or type in chat. Police must deduce who is bluffing!'}
              </p>
            </div>
          </div>
        </div>

        {/* Special Event Banner (If active) */}
        {gameState.activeEvent && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{gameState.activeEvent.icon}</span>
              <div>
                <div className="text-xs font-bold text-amber-300">{gameState.activeEvent.title}</div>
                <div className="text-[11px] text-slate-300">{gameState.activeEvent.description}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center Courtier Grid */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Royal Court Lineup ({gameState.players.length})
            </span>
            {policePlayer && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold flex items-center gap-1">
                👮 Police: {policePlayer.name}
              </span>
            )}
          </div>
          {isPolice ? (
            <span className="text-xs font-black text-amber-400 animate-pulse flex items-center gap-1">
              <Search className="w-3.5 h-3.5" />
              <span>Tap a suspect to focus, then ACCUSE!</span>
            </span>
          ) : isSuspect ? (
            <span className="text-xs font-bold text-slate-400">
              Defend yourself! Don't let Police accuse you.
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {gameState.players.map((player) => {
            const isPlayerRaja = player.id === gameState.rajaPlayerId;
            const isPlayerPolice = player.id === gameState.policePlayerId;
            const isMe = player.id === currentUserId;
            const isSelected = selectedTargetId === player.id;
            const isInspected = inspectedSuspectId === player.id;
            const isKingsChoice = gameState.kingsChoicePlayerIds?.includes(player.id);
            const isProtected = player.isProtected;

            const isClickable = isPolice && !isPlayerRaja && !isMe;
            const latestAlibi = getLatestAlibi(player.id);
            const isSpeaking = speakingPlayers.has(player.id);

            return (
              <div
                key={player.id}
                onClick={() => isClickable && handleSelectSuspect(player.id)}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-between text-center relative select-none ${
                  isSpeaking
                    ? 'ring-2 ring-emerald-400 border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : isPlayerRaja
                    ? 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-400 shadow-md shadow-amber-500/10'
                    : isPlayerPolice
                    ? 'bg-gradient-to-b from-blue-950/40 to-slate-900 border-blue-400/80 shadow-md shadow-blue-500/10'
                    : isSelected
                    ? 'bg-rose-950/60 border-rose-500 shadow-xl shadow-rose-500/30 scale-105 ring-2 ring-rose-400 z-10'
                    : isInspected
                    ? 'bg-amber-950/40 border-amber-400/80 shadow-md scale-[1.02]'
                    : isClickable
                    ? 'bg-slate-900 hover:bg-slate-800/90 border-slate-800 hover:border-amber-400/60 cursor-pointer'
                    : 'bg-slate-900/60 border-slate-800/80'
                }`}
              >
                {/* Real-time Voice Speaking Indicator */}
                {isSpeaking && (
                  <div className="absolute -top-2.5 right-2 z-30 flex items-center gap-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-md animate-pulse">
                    <Mic className="w-2.5 h-2.5" />
                    <span>TALKING</span>
                  </div>
                )}
                {/* Speech Bubble for Defense / Alibi Proclamations */}
                {latestAlibi && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-11/12 z-20 animate-bounce">
                    <div className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-amber-300 truncate text-center">
                      🗣️ {latestAlibi.claimText}
                    </div>
                  </div>
                )}

                {/* Badges on Top of Card */}
                <div className="w-full flex items-center justify-between text-[10px] mb-1">
                  {isPlayerRaja ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black flex items-center gap-0.5">
                      <Crown className="w-3 h-3" /> RAJA
                    </span>
                  ) : isPlayerPolice ? (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white font-black flex items-center gap-0.5">
                      👮 POLICE
                    </span>
                  ) : isMe ? (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                      YOU
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono text-[9px]">🎴 SUSPECT</span>
                  )}

                  {isProtected && (
                    <span className="text-xs" title="Protected by Queen">🛡️</span>
                  )}

                  {isKingsChoice && (
                    <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">
                      DECREE
                    </span>
                  )}
                </div>

                {/* Avatar Icon */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950 border flex items-center justify-center text-3xl sm:text-4xl shadow-inner my-1 ${
                  isSelected ? 'border-rose-400' : 'border-slate-700/80'
                }`}>
                  {player.avatar}
                </div>

                {/* Player Name & Score */}
                <div className="w-full mt-1">
                  <div className="font-bold text-xs text-slate-100 truncate">
                    {player.name}
                  </div>
                  <div className="text-[11px] font-mono text-amber-400/90 font-semibold">
                    {player.score} pts
                  </div>
                </div>

                {/* Police Selected Target Indicator */}
                {isSelected && (
                  <div className="mt-2 px-2 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-full uppercase tracking-wider animate-pulse">
                    🎯 ACCUSED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suspect One-Tap Alibi & Bluff Shouts Bar (For suspects to defend themselves) */}
      {isSuspect && (
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-2.5 sm:p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
              <span>Court Proclamation: Shout your defense or bluff the Police!</span>
            </span>
            <button
              onClick={() => setShowCustomAlibiInput(!showCustomAlibiInput)}
              className="text-[10px] text-slate-400 hover:text-amber-300 underline"
            >
              {showCustomAlibiInput ? 'Hide Custom' : 'Custom Shout'}
            </button>
          </div>

          {/* Quick preset shout pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleShoutAlibi('I am the Queen! Do NOT arrest me! 👸', 'RANI')}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 transition-colors"
            >
              👸 "Claim Queen"
            </button>
            <button
              onClick={() => handleShoutAlibi('I am a loyal courtier serving the King! 🌾', 'CITIZEN')}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 transition-colors"
            >
              🌾 "Loyal Citizen"
            </button>
            <button
              onClick={() => handleShoutAlibi('Look at the other suspects, they are sweating! 👀')}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 transition-colors"
            >
              👀 "Shift Suspicion"
            </button>
            <button
              onClick={() => handleShoutAlibi('I have a 100% pure innocent face! 😇')}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 transition-colors"
            >
              😇 "Innocent Face"
            </button>
          </div>

          {showCustomAlibiInput && (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customAlibiText}
                onChange={(e) => setCustomAlibiText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customAlibiText.trim()) {
                    handleShoutAlibi(customAlibiText.trim());
                    setCustomAlibiText('');
                  }
                }}
                placeholder="Type your court defense..."
                maxLength={80}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                onClick={() => {
                  if (customAlibiText.trim()) {
                    handleShoutAlibi(customAlibiText.trim());
                    setCustomAlibiText('');
                  }
                }}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Shout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Command Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Left info box: Direct Role Identity Display */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            
            {/* Direct Role Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                {myRoleDefinition ? myRoleDefinition.emoji : '👤'}
              </div>
              <div className="text-left pr-1">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Your Role ({myRoleDefinition?.points ?? 0} pts)
                </div>
                <div className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <span>{myRoleDefinition?.name || (myRole ? myRole : 'Courtier')}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 hidden sm:block">
              {isPolice
                ? 'Identify the true Thief before time expires!'
                : myRole === 'THIEF'
                ? 'Bluff in chat & alibis! Avoid Police accusation!'
                : 'Defend your innocence and assist the court.'}
            </div>
          </div>

          {/* Right Action Trigger Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            
            {/* Special Mode Ability Button */}
            {gameState.mode === 'special' && myRoleDefinition?.specialAbilityName && (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowAbilityModal(true);
                }}
                disabled={hasUsedAbility}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  hasUsedAbility
                    ? 'bg-slate-800 text-slate-500 border border-slate-700'
                    : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 shadow'
                }`}
              >
                <Zap className="w-4 h-4 text-purple-400" />
                <span>{hasUsedAbility ? 'Ability Used' : `Use: ${myRoleDefinition.specialAbilityName}`}</span>
              </button>
            )}

            {/* Police Accuse Button */}
            {isPolice ? (
              <button
                onClick={handleOpenConfirm}
                disabled={!selectedTargetId}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Target className="w-4 h-4" />
                <span>
                  {selectedTargetPlayer ? `ACCUSE ${selectedTargetPlayer.name.toUpperCase()}` : 'SELECT SUSPECT'}
                </span>
              </button>
            ) : (
              <div className="text-xs text-slate-400 font-semibold px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Police is interrogating...</span>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Confirmation Accusation Modal */}
      {showConfirmModal && selectedTargetPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-3xl">
              👮
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-black text-xl text-slate-100">
                Seal the Royal Accusation?
              </h3>
              <p className="text-xs text-slate-400">
                Are you declaring before the King that <strong className="text-rose-400">{selectedTargetPlayer.name}</strong> is the Thief?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              💡 Correct guess: <strong className="text-emerald-400">+300 pts</strong> • Wrong guess: <strong className="text-rose-400">0 pts (Thief gets 300)</strong>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccuse}
                className="py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-500/25 transition-all active:scale-95"
              >
                YES, ACCUSE!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Special Ability Modal */}
      {showAbilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-slate-100">{myRoleDefinition?.specialAbilityName}</h3>
              </div>
              <button onClick={() => setShowAbilityModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {myRoleDefinition?.specialAbilityDesc}
            </p>

            {/* Target Selectors based on role */}
            {(myRole === 'MINISTER' || myRole === 'RANI' || myRole === 'THIEF' || myRole === 'RAJA') && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Select Target Player:</label>
                <select
                  value={abilityTarget1}
                  onChange={(e) => setAbilityTarget1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">-- Choose Suspect --</option>
                  {gameState.players.filter(p => p.id !== currentUserId).map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.avatar})</option>
                  ))}
                </select>
              </div>
            )}

            {myRole === 'RAJA' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Select Second Target Player:</label>
                <select
                  value={abilityTarget2}
                  onChange={(e) => setAbilityTarget2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">-- Choose Second Suspect --</option>
                  {gameState.players.filter(p => p.id !== currentUserId && p.id !== abilityTarget1).map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.avatar})</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleExecuteAbility}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Activate Power
            </button>
          </div>
        </div>
      )}

      {/* Ability Result Report Dialog */}
      {abilityResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto text-2xl">
              🔮
            </div>
            <h3 className="font-bold text-base text-slate-100">{abilityResultModal.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {abilityResultModal.message}
            </p>
            <button
              onClick={onCloseAbilityResult}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
