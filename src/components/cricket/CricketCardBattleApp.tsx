import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { 
  CricketGameState, 
  CricketRoomSettings, 
  CricketChatMessage,
  StatKey,
  RuleVariant
} from '../../types/cricket';
import { UserProfile } from '../../types/game';
import { CricketHomeHub } from './CricketHomeHub';
import { CricketLobbyView } from './CricketLobbyView';
import { CricketVirtualTable } from './CricketVirtualTable';
import { CricketCardCollectionModal } from './CricketCardCollectionModal';
import { CricketHowToPlayModal } from './CricketHowToPlayModal';
import { CricketFinalPodiumModal } from './CricketFinalPodiumModal';
import { CricketChatDrawer } from './CricketChatDrawer';
import { sound } from '../../utils/sound';
import { ArrowLeft, Volume2, VolumeX, BookOpen, HelpCircle } from 'lucide-react';

interface CricketCardBattleAppProps {
  user: UserProfile;
  socket: Socket | null;
  onExitToPortal: () => void;
  initialRoomCode?: string;
}

export const CricketCardBattleApp: React.FC<CricketCardBattleAppProps> = ({
  user,
  socket,
  onExitToPortal,
  initialRoomCode = ''
}) => {
  const [gameState, setGameState] = useState<CricketGameState | null>(null);
  const [chatMessages, setChatMessages] = useState<CricketChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showEncyclopediaModal, setShowEncyclopediaModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketId = socket?.id || 'local-player';

  // Auto-join from URL/initialRoomCode if provided
  useEffect(() => {
    if (initialRoomCode && socket?.connected && !gameState) {
      socket.emit('cricket:joinRoom', {
        roomId: initialRoomCode.trim().toUpperCase(),
        playerName: user.name,
        avatar: user.avatar
      });
    }
  }, [initialRoomCode, socket?.connected, user]);

  // Listen to Socket.IO cricket events
  useEffect(() => {
    if (!socket) return;

    const handleStateUpdate = (state: CricketGameState) => {
      setGameState(state);
    };

    const handleRoomCreated = ({ roomId, gameState }: { roomId: string; gameState: CricketGameState }) => {
      setGameState(gameState);
      sound.playGameStart();
    };

    const handleRoomJoined = ({ roomId, gameState }: { roomId: string; gameState: CricketGameState }) => {
      setGameState(gameState);
      sound.playJoin();
    };

    const handleChatMessage = (msg: CricketChatMessage) => {
      setChatMessages(prev => [...prev.slice(-49), msg]);
      if (msg.emote) {
        sound.playCardClick();
      }
    };

    const handleError = ({ message }: { message: string }) => {
      setErrorMessage(message);
      sound.playError();
      setTimeout(() => setErrorMessage(null), 4000);
    };

    const handleKicked = () => {
      setGameState(null);
      setErrorMessage('You were removed from the cricket room.');
      sound.playError();
    };

    socket.on('cricket:stateUpdate', handleStateUpdate);
    socket.on('cricket:roomCreated', handleRoomCreated);
    socket.on('cricket:roomJoined', handleRoomJoined);
    socket.on('cricket:chatMessage', handleChatMessage);
    socket.on('cricket:error', handleError);
    socket.on('cricket:kicked', handleKicked);

    return () => {
      socket.off('cricket:stateUpdate', handleStateUpdate);
      socket.off('cricket:roomCreated', handleRoomCreated);
      socket.off('cricket:roomJoined', handleRoomJoined);
      socket.off('cricket:chatMessage', handleChatMessage);
      socket.off('cricket:error', handleError);
      socket.off('cricket:kicked', handleKicked);
    };
  }, [socket]);

  // Action handlers
  const handleCreateRoom = (settings: Partial<CricketRoomSettings>, isSinglePlayer?: boolean) => {
    if (socket && socket.connected) {
      socket.emit('cricket:createRoom', {
        playerName: user.name,
        avatar: user.avatar,
        settings,
        isSinglePlayer
      });

      // If single player, automatically add bot and start
      if (isSinglePlayer) {
        setTimeout(() => {
          socket.emit('cricket:addBot');
          setTimeout(() => {
            socket.emit('cricket:startGame');
          }, 300);
        }, 300);
      }
    }
  };

  const handleQuickMatch = (ruleVariant?: RuleVariant) => {
    if (socket && socket.connected) {
      socket.emit('cricket:quickMatch', {
        playerName: user.name,
        avatar: user.avatar,
        ruleVariant: ruleVariant || 'CLASSIC'
      });
    }
  };

  const handleSoloBot = (ruleVariant?: RuleVariant) => {
    if (socket && socket.connected) {
      socket.emit('cricket:createSoloBot', {
        playerName: user.name,
        avatar: user.avatar,
        ruleVariant: ruleVariant || 'CLASSIC'
      });
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (socket && socket.connected) {
      socket.emit('cricket:joinRoom', {
        roomId,
        playerName: user.name,
        avatar: user.avatar
      });
    }
  };

  const handleToggleReady = () => {
    if (socket && socket.connected) {
      socket.emit('cricket:toggleReady');
    }
  };

  const handleUpdateSettings = (settings: Partial<CricketRoomSettings>) => {
    if (socket && socket.connected) {
      socket.emit('cricket:updateSettings', settings);
    }
  };

  const handleAddBot = () => {
    if (socket && socket.connected) {
      socket.emit('cricket:addBot');
    }
  };

  const handleRemoveBot = (botId: string) => {
    if (socket && socket.connected) {
      socket.emit('cricket:removeBot', { botId });
    }
  };

  const handleKickPlayer = (playerId: string) => {
    if (socket && socket.connected) {
      socket.emit('cricket:kickPlayer', { playerId });
    }
  };

  const handleStartGame = () => {
    if (socket && socket.connected) {
      socket.emit('cricket:startGame');
      sound.playGameStart();
    }
  };

  const handleSelectStat = (statKey: StatKey) => {
    if (socket && socket.connected) {
      socket.emit('cricket:selectStat', { statKey });
    }
  };

  const handlePlayCard = () => {
    if (socket && socket.connected) {
      socket.emit('cricket:playCard');
    }
  };

  const handleShuffleDeck = () => {
    if (socket && socket.connected) {
      socket.emit('cricket:shuffleDeck');
    }
  };

  const handleRestartGame = () => {
    if (socket && socket.connected) {
      socket.emit('cricket:restartGame');
    }
  };

  const handleLeaveRoom = () => {
    if (socket && socket.connected) {
      socket.emit('cricket:leaveRoom');
    }
    setGameState(null);
    setChatMessages([]);
  };

  const handleSendMessage = (text: string) => {
    if (socket && socket.connected) {
      socket.emit('cricket:chatSend', { text });
    }
  };

  const handleSendEmote = (emote: string) => {
    if (socket && socket.connected) {
      socket.emit('cricket:chatEmote', { emote });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none relative overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.12),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full p-4 border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              if (gameState) {
                handleLeaveRoom();
              } else {
                onExitToPortal();
              }
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">
              {gameState ? 'Leave Match' : 'Arcade Home'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🏏</span>
            <span className="font-serif font-black text-amber-300 tracking-wider text-sm sm:text-base hidden sm:inline">
              CRICKET CARD BATTLE
            </span>
          </div>
        </div>

        {/* Right Tools: Encyclopedia, Rules, Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowEncyclopediaModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Browse 1000 Cards"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1,000 Cards</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowRulesModal(true);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const muted = sound.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-rose-500 text-slate-950 text-xs font-black shadow-xl animate-bounce">
          {errorMessage}
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col justify-center p-2 sm:p-4">
        {!gameState ? (
          <CricketHomeHub
            user={user}
            socket={socket}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onQuickMatch={handleQuickMatch}
            onSoloBot={handleSoloBot}
            onOpenRules={() => setShowRulesModal(true)}
            onOpenEncyclopedia={() => setShowEncyclopediaModal(true)}
            initialRoomCode={initialRoomCode}
          />
        ) : gameState.phase === 'LOBBY' ? (
          <CricketLobbyView
            gameState={gameState}
            currentUserId={socketId}
            onToggleReady={handleToggleReady}
            onUpdateSettings={handleUpdateSettings}
            onAddBot={handleAddBot}
            onRemoveBot={handleRemoveBot}
            onKickPlayer={handleKickPlayer}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <CricketVirtualTable
            gameState={gameState}
            currentUserId={socketId}
            onSelectStat={handleSelectStat}
            onPlayCard={handlePlayCard}
            onShuffleDeck={handleShuffleDeck}
          />
        )}
      </main>

      {/* Final Podium Champion Modal */}
      {gameState?.phase === 'FINAL_PODIUM' && (
        <CricketFinalPodiumModal
          gameState={gameState}
          currentUserId={socketId}
          onPlayAgain={handleRestartGame}
          onLeave={handleLeaveRoom}
        />
      )}

      {/* 1,000 Cards Encyclopedia Modal */}
      {showEncyclopediaModal && (
        <CricketCardCollectionModal
          onClose={() => setShowEncyclopediaModal(false)}
        />
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <CricketHowToPlayModal
          onClose={() => setShowRulesModal(false)}
        />
      )}

      {/* Chat Drawer if in room */}
      {gameState && (
        <CricketChatDrawer
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onSendEmote={handleSendEmote}
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      )}

    </div>
  );
};
