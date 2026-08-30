import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  Zap, 
  Flame, 
  MessageSquare, 
  Eye, 
  Shuffle, 
  RefreshCw, 
  Send, 
  X, 
  ArrowRightLeft,
  Crown,
  Bot,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { BoostGameState, BoostPrivateState, BoostAbilityType, BoostPlayer } from '../types/boost';
import { sound } from '../utils/sound';

interface BoostGameBoardViewProps {
  gameState: BoostGameState;
  privateData: BoostPrivateState;
  currentSocketId: string;
  onPickSheetFromPlayer: (targetCardId: string, myGiveCardId?: string) => void;
  onRearrangeHand: (newOrderIds: string[]) => void;
  onShuffleMyHand: () => void;
  onClaimBoost: () => void;
  onUseAbility: (params: { abilityType: BoostAbilityType; targetCardId?: string }) => void;
  onSendChat: (text?: string, emote?: string) => void;
  chatMessages: Array<{ id: string; playerName: string; avatar: string; text?: string; emote?: string }>;
}

const QUICK_EMOTES = ['😂', '🔥', '😱', '👀', '🤯', '👏', '😭', '😎'];
const QUICK_SHOUTS = ['BOOST!', 'NOOO!', 'Almost 3!', 'Nice try!', 'Wait!'];

export const BoostGameBoardView: React.FC<BoostGameBoardViewProps> = ({
  gameState,
  privateData,
  currentSocketId,
  onPickSheetFromPlayer,
  onRearrangeHand,
  onShuffleMyHand,
  onClaimBoost,
  onUseAbility,
  onSendChat,
  chatMessages
}) => {
  const [selectedTargetCardId, setSelectedTargetCardId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [customChat, setCustomChat] = useState('');
  const [swappingCardIndex, setSwappingCardIndex] = useState<number | null>(null);

  const isMyTurn = gameState.currentTurnPlayerId === currentSocketId;
  const currentTurnPlayer = gameState.players.find(p => p.id === gameState.currentTurnPlayerId);
  const targetPickPlayer = gameState.players.find(p => p.id === gameState.targetPickPlayerId);
  const amIHolding4Cards = (privateData.myCards?.length || 0) >= 4;

  // Urgent timer tick sound
  useEffect(() => {
    if (gameState.turnTimeRemaining <= 5 && gameState.turnTimeRemaining > 0) {
      sound.playClick();
    }
  }, [gameState.turnTimeRemaining]);

  // Click on target opponent's face-down card to draw it
  const handleSelectTargetCard = (targetCardId: string, ownerPlayerId: string) => {
    if (!isMyTurn) return;
    if (ownerPlayerId !== gameState.targetPickPlayerId) {
      sound.playBuzzer();
      return;
    }

    sound.playPaperSlide();
    setSelectedTargetCardId(targetCardId);

    // Pick card from target player
    onPickSheetFromPlayer(targetCardId);
    
    // Reset selection after brief delay
    setTimeout(() => {
      setSelectedTargetCardId(null);
    }, 600);
  };

  // Click on own card to swap positions
  const handleSelectMyCard = (cardId: string, index: number) => {
    sound.playPop();

    if (swappingCardIndex !== null && swappingCardIndex !== index) {
      // Swap positions locally & emit rearrange
      const newCards = [...privateData.myCards];
      const temp = newCards[swappingCardIndex];
      newCards[swappingCardIndex] = newCards[index];
      newCards[index] = temp;
      
      const newOrderIds = newCards.map(c => c.id);
      onRearrangeHand(newOrderIds);
      setSwappingCardIndex(null);
      return;
    }

    setSwappingCardIndex(index);
  };

  const handleManualShuffle = () => {
    sound.playShuffle();
    onShuffleMyHand();
    setSwappingCardIndex(null);
  };

  const handleBoostClick = () => {
    sound.playBoostAlarm();
    onClaimBoost();
  };

  const handleSendCustomChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customChat.trim()) return;
    sound.playPop();
    onSendChat(customChat.trim());
    setCustomChat('');
  };

  const handleEmoteClick = (emote: string) => {
    sound.playPop();
    onSendChat(undefined, emote);
  };

  const handleShoutClick = (shout: string) => {
    sound.playPop();
    onSendChat(shout);
  };

  // Other players list (excluding me)
  const otherPlayers = gameState.players.filter(p => p.id !== currentSocketId);
  const myPlayer = gameState.players.find(p => p.id === currentSocketId);

  // Group counts of words in my hand
  const wordFrequencyMap = new Map<string, number>();
  privateData.myCards.forEach(c => {
    wordFrequencyMap.set(c.word, (wordFrequencyMap.get(c.word) || 0) + 1);
  });

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col justify-between p-2.5 sm:p-4 max-w-6xl mx-auto w-full select-none space-y-3 relative overflow-hidden">
      
      {/* Top HUD: Round, Turn Status, 15s Timer, Chat Toggle */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl shadow-md">
        
        {/* Match / Round badge */}
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-slate-400">
            ROUND <strong className="text-rose-400 font-mono">{gameState.currentRound}/{gameState.totalRounds}</strong>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
            {gameState.gameMode}
          </span>
        </div>

        {/* Turn Indicator & 15s Timer */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="text-xs font-bold flex items-center gap-1.5">
            {isMyTurn ? (
              <span className="text-amber-400 font-black animate-pulse flex items-center gap-1">
                👉 YOUR TURN: Pick 1 card from <strong className="text-rose-300 underline">{targetPickPlayer?.name}</strong> (holding {targetPickPlayer?.cards.length || 4} slips)
              </span>
            ) : (
              <span className="text-slate-300 truncate max-w-[140px] sm:max-w-none text-[11px] sm:text-xs">
                Turn: <strong className="text-rose-300">{currentTurnPlayer?.name}</strong> picking from <strong className="text-amber-300">{targetPickPlayer?.name}</strong>
              </span>
            )}
          </div>

          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono font-black text-xs sm:text-sm transition-colors ${
            gameState.turnTimeRemaining <= 5
              ? 'bg-rose-500/25 text-rose-400 border border-rose-500/50 animate-pulse'
              : 'bg-slate-950 text-amber-400 border border-amber-500/30'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{gameState.turnTimeRemaining}s</span>
          </div>
        </div>

        {/* Chat Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            setShowChat(!showChat);
          }}
          className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 relative cursor-pointer"
          title="Room Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {chatMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

      </div>

      {/* Action Notification Banner */}
      {gameState.lastActionMessage && (
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center text-xs font-medium text-amber-200 shadow-sm truncate">
          📢 {gameState.lastActionMessage}
        </div>
      )}

      {/* Main Table: All Opponents seated with their face-down sheets */}
      <div className="flex-1 min-h-[300px] sm:min-h-[350px] bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-900/80 border border-slate-800/90 rounded-3xl p-3 sm:p-5 shadow-2xl relative flex flex-col justify-between">
        
        {/* Opponents Table Grid */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center flex items-center justify-center gap-1.5 mb-2">
            <span>Opponents at Court</span>
            <span className="text-[10px] text-slate-500">• Cards face down until BOOST is won</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {otherPlayers.map((player) => {
              const isCurrentTurnPicker = gameState.currentTurnPlayerId === player.id;
              const isBeingPickedFrom = gameState.targetPickPlayerId === player.id;
              const canISelectThisPlayer = isMyTurn && isBeingPickedFrom;
              const cardCount = player.cards.length;

              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-between gap-2.5 relative ${
                    canISelectThisPlayer
                      ? 'bg-rose-950/40 border-rose-400 shadow-xl shadow-rose-500/20 ring-2 ring-rose-400/80 animate-pulse'
                      : isBeingPickedFrom
                      ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-400/50'
                      : isCurrentTurnPicker
                      ? 'bg-blue-950/30 border-blue-400/50'
                      : 'bg-slate-950/70 border-slate-800/80'
                  }`}
                >
                  {/* Player Tag */}
                  <div className="flex items-center gap-2 w-full justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="relative text-lg">
                        <span>{player.avatar}</span>
                        {player.isHost && <Crown className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />}
                        {player.isBot && <Bot className="w-2.5 h-2.5 text-cyan-400 absolute -top-1 -left-1" />}
                      </div>
                      <span className="text-xs font-bold text-slate-200 truncate max-w-[80px]">
                        {player.name}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {canISelectThisPlayer ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-500 text-white animate-bounce">
                        Pick Here!
                      </span>
                    ) : isBeingPickedFrom ? (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-900/80 px-1.5 py-0.5 rounded-md border border-amber-600">
                        Holds 4 Slips
                      </span>
                    ) : isCurrentTurnPicker ? (
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded-md border border-blue-800">
                        Picking
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-500">
                        {cardCount} slips
                      </span>
                    )}
                  </div>

                  {/* Face-Down Cards Held by this Opponent - Styled as Folded Paper Chits */}
                  <div className={`grid gap-1.5 w-full ${cardCount === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    {player.cards.map((card, idx) => {
                      const isSelected = selectedTargetCardId === card.id;

                      return (
                        <button
                          key={card.id}
                          disabled={!canISelectThisPlayer}
                          onClick={() => handleSelectTargetCard(card.id, player.id)}
                          className={`aspect-[3/4] rounded-xl border flex flex-col items-center justify-center p-1 transition-all select-none relative shadow-sm overflow-hidden ${
                            canISelectThisPlayer
                              ? 'bg-gradient-to-b from-amber-100 via-amber-50 to-amber-200 border-amber-400 text-slate-900 shadow-md hover:scale-110 hover:shadow-amber-400/60 cursor-pointer active:scale-95 animate-pulse ring-2 ring-amber-400'
                              : isBeingPickedFrom
                              ? 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-700/60 text-amber-200/80 cursor-default'
                              : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 text-slate-500 cursor-default'
                          } ${isSelected ? 'ring-2 ring-rose-400 scale-110' : ''}`}
                        >
                          {/* Fold crease line */}
                          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/15 pointer-events-none" />
                          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-black/10 rounded-bl-sm pointer-events-none" />

                          <span className="text-base sm:text-lg filter drop-shadow">
                            {canISelectThisPlayer ? '👆' : '📜'}
                          </span>
                          <span className="text-[8px] font-mono font-black mt-0.5 text-slate-700">
                            Slip #{idx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Opponent hint */}
                  {canISelectThisPlayer && (
                    <div className="text-[10px] font-bold text-rose-300 text-center animate-pulse">
                      Click 1 of {cardCount} cards to draw!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Ability Pill Bar (If Special Mode) */}
        {gameState.gameMode === 'SPECIAL' && privateData.mySpecialAbility && (
          <div className="w-full flex items-center justify-between bg-slate-950/90 border border-purple-500/30 p-2 rounded-2xl my-2">
            <div className="flex items-center gap-2 text-xs">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Special Power: <strong className="text-purple-300">{privateData.mySpecialAbility}</strong></span>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                onUseAbility({ abilityType: privateData.mySpecialAbility! });
              }}
              disabled={privateData.hasUsedSpecialAbility}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {privateData.hasUsedSpecialAbility ? 'Used' : 'Activate Power'}
            </button>
          </div>
        )}

      </div>

      {/* Bottom Tray: Your Own Visible Sheets, Rearrange Controls & GIANT BOOST BUTTON */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-2xl space-y-3">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Left: Your Visible Sheets & Rearrange Instructions */}
          <div className="space-y-2 w-full lg:w-auto">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span className="text-amber-400 font-mono uppercase">
                  YOUR HAND ({privateData.myCards?.length || 3} SLIPS)
                </span>
                {amIHolding4Cards && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                    Holding 4 Slips (Opponent will pick 1)
                  </span>
                )}
              </div>

              {/* Shuffle / Rearrange Button */}
              <button
                onClick={handleManualShuffle}
                className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Shuffle the order of your sheets"
              >
                <Shuffle className="w-3 h-3" />
                <span>Shuffle Order</span>
              </button>
            </div>

            {/* Large Visible Cards Tray - Styled as Real Folded Notebook Paper Slips */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
              {privateData.myCards.map((card, idx) => {
                const isSwapping = swappingCardIndex === idx;
                const count = wordFrequencyMap.get(card.word) || 1;

                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectMyCard(card.id, idx)}
                    className={`flex-1 min-w-[100px] sm:min-w-[130px] h-32 sm:h-36 rounded-2xl border-2 flex flex-col items-center justify-between p-3 transition-all select-none relative shadow-xl cursor-pointer overflow-hidden ${
                      count >= 3
                        ? 'bg-gradient-to-b from-rose-100 via-rose-50 to-amber-100 border-rose-500 shadow-rose-500/40 ring-4 ring-rose-400 scale-[1.02]'
                        : count === 2
                        ? 'bg-gradient-to-b from-amber-100 via-amber-50 to-yellow-100 border-amber-500 text-slate-900 ring-2 ring-amber-400/60'
                        : isSwapping
                        ? 'bg-gradient-to-b from-cyan-100 via-slate-100 to-amber-100 border-cyan-500 ring-4 ring-cyan-400 scale-105'
                        : 'bg-gradient-to-b from-amber-50 via-slate-100 to-amber-100/90 border-amber-300/80 hover:border-amber-400 text-slate-900'
                    }`}
                  >
                    {/* Realistic notebook paper line markings */}
                    <div className="absolute inset-0 pointer-events-none opacity-15 flex flex-col justify-evenly px-2">
                      <div className="w-full h-[1px] bg-blue-600" />
                      <div className="w-full h-[1px] bg-blue-600" />
                      <div className="w-full h-[1px] bg-blue-600" />
                      <div className="w-full h-[1px] bg-blue-600" />
                    </div>

                    {/* Paper crease / fold shadow in middle */}
                    <div className="absolute inset-y-0 left-1/2 w-[2px] bg-black/10 blur-[1px] pointer-events-none" />

                    {/* Folded paper corner notch */}
                    <div className="absolute top-0 right-0 w-4 h-4 bg-amber-300/60 rounded-bl-lg shadow-sm border-l border-b border-amber-400/40 pointer-events-none" />

                    {/* Header: Position & Match badge */}
                    <div className="w-full flex items-center justify-between z-10">
                      <span className="text-[10px] font-mono font-black text-slate-700 bg-black/5 px-1.5 py-0.5 rounded-md">
                        SLIP #{idx + 1}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm ${
                        count >= 3 
                          ? 'bg-rose-600 text-white animate-pulse' 
                          : count === 2 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-slate-300 text-slate-800'
                      }`}>
                        {count}/3 MATCH
                      </span>
                    </div>

                    {/* Word text written on paper */}
                    <div className="my-auto text-center space-y-0.5 z-10 w-full">
                      <div className="text-base sm:text-lg font-black font-mono tracking-wider text-slate-950 break-all px-1 underline decoration-rose-400/60 decoration-wavy">
                        {card.word}
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                        folded chit
                      </span>
                    </div>

                    {/* Footer tag */}
                    <div className="text-[9px] font-bold text-slate-700 flex items-center gap-1 z-10 bg-black/5 px-2 py-0.5 rounded-md">
                      {isSwapping ? (
                        <span className="text-cyan-800 font-bold">Pick swap slot</span>
                      ) : (
                        <span>Tap to swap</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hint message */}
            <div className="text-[11px] text-slate-400">
              💡 {isMyTurn ? (
                <span>
                  Click 1 of the face-down cards on <strong>{targetPickPlayer?.name}</strong> to draw it into your hand!
                </span>
              ) : amIHolding4Cards ? (
                <span>
                  You hold 4 slips! Click <strong>Shuffle Order</strong> to mix their positions so opponents can't guess which card is which.
                </span>
              ) : (
                <span>
                  Tip: Click <strong>Shuffle Order</strong> or tap two cards to swap positions in your tray.
                </span>
              )}
            </div>
          </div>

          {/* Right: THE GIANT ANIMATED BOOST BUTTON */}
          <div className="w-full lg:w-auto flex flex-col items-center lg:items-end justify-center">
            <button
              onClick={handleBoostClick}
              disabled={!privateData.canBoost}
              className={`w-full sm:w-auto px-8 sm:px-14 py-4 sm:py-5 rounded-3xl font-black text-base sm:text-lg flex items-center justify-center gap-3 transition-all uppercase tracking-wider select-none ${
                privateData.canBoost
                  ? 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white shadow-2xl shadow-rose-500/60 scale-105 ring-4 ring-rose-400 animate-pulse cursor-pointer'
                  : 'bg-slate-950 border border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <Flame className={`w-6 h-6 ${privateData.canBoost ? 'animate-bounce text-yellow-300' : ''}`} />
              <span>🚨 BOOST!</span>
            </button>

            {privateData.canBoost && (
              <span className="text-xs font-black text-rose-400 animate-pulse mt-1.5">
                🎉 YOU HAVE 3 MATCHING SHEETS! HIT BOOST NOW!
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Real-time Room Chat Sidebar / Drawer */}
      {showChat && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-3xl p-4 shadow-2xl space-y-3 animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>Room Chat & Quick Emotes</span>
            </span>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Emote Pills */}
          <div className="flex justify-between gap-1 pb-1">
            {QUICK_EMOTES.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleEmoteClick(emoji)}
                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-base flex items-center justify-center transition-colors cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Quick Shout Pills */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SHOUTS.map(shout => (
              <button
                key={shout}
                onClick={() => handleShoutClick(shout)}
                className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 cursor-pointer"
              >
                {shout}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            {chatMessages.length === 0 ? (
              <div className="text-slate-500 text-center py-2 italic text-[11px]">
                No messages yet. Send an emote or shout!
              </div>
            ) : (
              chatMessages.map(msg => (
                <div key={msg.id} className="flex items-start gap-1.5 text-slate-300">
                  <span>{msg.avatar}</span>
                  <strong className="text-slate-100 font-semibold">{msg.playerName}:</strong>
                  {msg.emote ? (
                    <span className="text-lg">{msg.emote}</span>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendCustomChat} className="flex gap-2">
            <input
              type="text"
              value={customChat}
              onChange={(e) => setCustomChat(e.target.value)}
              placeholder="Type message..."
              maxLength={60}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
            <button
              type="submit"
              className="p-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
