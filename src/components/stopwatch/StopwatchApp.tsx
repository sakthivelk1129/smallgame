import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { UserProfile } from '../../types/game';
import { 
  StopwatchGameState, 
  StopwatchSettings, 
  StopwatchTeam, 
  StopwatchChatMessage 
} from '../../types/stopwatch';
import { StopwatchHomeHub } from './StopwatchHomeHub';
import { StopwatchLobbyView } from './StopwatchLobbyView';
import { StopwatchArenaView } from './StopwatchArenaView';
import { StopwatchRoundResultView } from './StopwatchRoundResultView';
import { StopwatchFinalPodiumModal } from './StopwatchFinalPodiumModal';
import { StopwatchHowToPlayModal } from './StopwatchHowToPlayModal';
import { StopwatchChatDrawer } from './StopwatchChatDrawer';
import { sound } from '../../utils/sound';
import { ArrowLeft, Timer, Volume2, VolumeX } from 'lucide-react';

interface StopwatchAppProps {
  user: UserProfile | null;
  socket: Socket | null;
  onExitToPortal: () => void;
  initialRoomCode?: string;
}

export const StopwatchApp: React.FC<StopwatchAppProps> = ({
  user,
  socket,
  onExitToPortal,
  initialRoomCode = ''
}) => {
  const [gameState, setGameState] = useState<StopwatchGameState | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<StopwatchChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [unreadChat, setUnreadChat] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Setup Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleStateUpdate = (newState: StopwatchGameState) => {
      setGameState((prevState) => {
        // Sound triggers on phase transition
        if (prevState && prevState.phase !== newState.phase) {
          if (newState.phase === 'TARGET_ANNOUNCEMENT') {
            sound.playTick();
          } else if (newState.phase === 'ACTIVE_STOPWATCH') {
            sound.playPop();
          } else if (newState.phase === 'ROUND_RESULT') {
            sound.playRoyalFanfare();
          } else if (newState.phase === 'FINAL_RESULTS') {
            sound.playRoyalFanfare();
          }
        }
        return newState;
      });
    };

    const handleCreated = ({ roomId, gameState: state }: { roomId: string; gameState: StopwatchGameState }) => {
      setGameState(state);
      setErrorMessage(null);
      sound.playRoyalFanfare();
    };

    const handleJoined = ({ roomId, gameState: state }: { roomId: string; gameState: StopwatchGameState }) => {
      setGameState(state);
      setErrorMessage(null);
      sound.playSuccess();
    };

    const handleChat = (msg: StopwatchChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
      if (!isChatOpen) {
        setUnreadChat((prev) => prev + 1);
      }
    };

    const handleError = ({ message }: { message: string }) => {
      setErrorMessage(message);
      sound.playDefeat();
      setTimeout(() => setErrorMessage(null), 5000);
    };

    socket.on('stopwatch:stateUpdate', handleStateUpdate);
    socket.on('stopwatch:created', handleCreated);
    socket.on('stopwatch:joined', handleJoined);
    socket.on('stopwatch:chat', handleChat);
    socket.on('stopwatch:error', handleError);

    return () => {
      socket.off('stopwatch:stateUpdate', handleStateUpdate);
      socket.off('stopwatch:created', handleCreated);
      socket.off('stopwatch:joined', handleJoined);
      socket.off('stopwatch:chat', handleChat);
      socket.off('stopwatch:error', handleError);
    };
  }, [socket, isChatOpen]);

  // Handle URL Room Parameter if passed
  useEffect(() => {
    if (initialRoomCode && socket && socket.connected && !gameState) {
      handleJoinRoom(initialRoomCode);
    }
  }, [initialRoomCode, socket?.connected]);

  // Action Dispatchers
  const handleCreateRoom = (settings: Partial<StopwatchSettings>) => {
    if (!socket) return;
    socket.emit('stopwatch:createRoom', {
      playerName: user?.name || 'Player 1',
      avatar: user?.avatar || '⏱️',
      settings
    });
  };

  const handleJoinRoom = (roomCode: string) => {
    if (!socket) return;
    socket.emit('stopwatch:joinRoom', {
      roomId: roomCode,
      playerName: user?.name || 'Player 1',
      avatar: user?.avatar || '⏱️'
    });
  };

  const handleToggleReady = () => {
    if (!socket) return;
    socket.emit('stopwatch:toggleReady');
  };

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('stopwatch:startGame');
  };

  const handleStopTimer = (clientElapsed?: number) => {
    if (!socket) return;
    socket.emit('stopwatch:stopTimer', { clientElapsed });
  };

  const handleLeaveRoom = () => {
    if (!socket) return;
    socket.emit('stopwatch:leave');
    setGameState(null);
    setChatMessages([]);
  };

  const handleAddBot = () => {
    if (!socket) return;
    socket.emit('stopwatch:addBot', { difficulty: 'medium' });
  };

  const handleRemoveBot = (botId: string) => {
    if (!socket) return;
    socket.emit('stopwatch:removeBot', { botId });
  };

  const handleSwitchTeam = (team: StopwatchTeam) => {
    if (!socket) return;
    socket.emit('stopwatch:switchTeam', { targetTeam: team });
  };

  const handleSendMessage = (text: string) => {
    if (!socket) return;
    socket.emit('stopwatch:sendMessage', { text });
  };

  const handleRematch = () => {
    if (!socket) return;
    socket.emit('stopwatch:rematch');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
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
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{gameState ? 'Exit Match' : 'Arcade Home'}</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-lg">
              ⏱️
            </div>
            <span className="font-serif font-black text-sm sm:text-base text-cyan-300 tracking-wide">
              Stopwatch Precision Arena
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowHowToPlay(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Rules & Modes
          </button>
        </div>
      </header>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-rose-600/90 text-white text-xs font-bold shadow-2xl border border-rose-400 animate-fadeIn flex items-center gap-2">
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col justify-center p-3 sm:p-6">
        {!gameState ? (
          // 1. HOME HUB (BOT / FRIENDS / ONLINE RANDOM)
          <StopwatchHomeHub
            user={user}
            socket={socket}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onOpenRules={() => setShowHowToPlay(true)}
            initialRoomCode={initialRoomCode}
          />
        ) : gameState.phase === 'LOBBY' ? (
          // 2. LOBBY VIEW
          <StopwatchLobbyView
            gameState={gameState}
            currentUserId={socket?.id || ''}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
            onAddBot={handleAddBot}
            onRemoveBot={handleRemoveBot}
            onSwitchTeam={handleSwitchTeam}
          />
        ) : gameState.phase === 'ROUND_RESULT' ? (
          // 3. ROUND RESULTS BREAKDOWN
          <StopwatchRoundResultView
            gameState={gameState}
            currentUserId={socket?.id || ''}
          />
        ) : gameState.phase === 'FINAL_RESULTS' ? (
          // 4. FINAL RESULTS PODIUM
          <StopwatchFinalPodiumModal
            gameState={gameState}
            currentUserId={socket?.id || ''}
            onRematch={handleRematch}
            onExit={handleLeaveRoom}
          />
        ) : (
          // 5. ACTIVE ARENA / COUNTDOWN
          <StopwatchArenaView
            gameState={gameState}
            currentUserId={socket?.id || ''}
            onStopTimer={handleStopTimer}
          />
        )}
      </main>

      {/* How To Play Modal */}
      {showHowToPlay && (
        <StopwatchHowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Chat Drawer if in a Room */}
      {gameState && (
        <StopwatchChatDrawer
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isOpen={isChatOpen}
          onToggle={() => {
            setIsChatOpen(!isChatOpen);
            if (!isChatOpen) setUnreadChat(0);
          }}
          unreadCount={unreadChat}
        />
      )}

    </div>
  );
};
