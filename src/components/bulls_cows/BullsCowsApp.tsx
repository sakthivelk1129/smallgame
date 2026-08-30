import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { UserProfile } from '../../types/game';
import { 
  BullsCowsGameState, 
  BullsCowsRoomSettings, 
  BullsCowsChatMessage,
  WordLength,
  GameDifficulty,
  BullsCowsGameMode,
  GuessRecord
} from '../../types/bullsCows';
import { BullsCowsHomeHub } from './BullsCowsHomeHub';
import { BullsCowsLobbyView } from './BullsCowsLobbyView';
import { BullsCowsGameView } from './BullsCowsGameView';
import { BullsCowsRoundResultView } from './BullsCowsRoundResultView';
import { BullsCowsHowToPlayModal } from './BullsCowsHowToPlayModal';
import { BullsCowsChatDrawer } from './BullsCowsChatDrawer';
import { calculateBullsAndCows, generateDiverseTargetWord, calculateBullsCowsScore, validateWordInput } from '../../utils/bullsCowsEngine';
import { sound } from '../../utils/sound';

interface BullsCowsAppProps {
  user: UserProfile;
  socket: Socket | null;
  onExit: () => void;
  initialRoomCode?: string | null;
}

export const BullsCowsApp: React.FC<BullsCowsAppProps> = ({
  user,
  socket,
  onExit,
  initialRoomCode
}) => {
  const [gameState, setGameState] = useState<BullsCowsGameState | null>(null);
  const [chatMessages, setChatMessages] = useState<BullsCowsChatMessage[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Single-player local state (fallback/offline simulation)
  const [isLocalSingle, setIsLocalSingle] = useState(false);
  const [localTargetWord, setLocalTargetWord] = useState('');
  const [localStartTime, setLocalStartTime] = useState(0);

  const currentUserId = isLocalSingle ? 'local-user' : (socket?.id || user.id || 'local-user');

  // Handle auto-join from URL parameter if present
  useEffect(() => {
    if (initialRoomCode && socket?.connected) {
      socket.emit('bullsCows:joinRoom', {
        roomId: initialRoomCode,
        playerName: user.name,
        avatar: user.avatar
      });
    }
  }, [initialRoomCode, socket, user]);

  // Setup Socket.IO Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = ({ roomId, gameState }: { roomId: string; gameState: BullsCowsGameState }) => {
      setGameState(gameState);
      setIsLocalSingle(false);
      setErrorMessage(null);
    };

    const handleRoomJoined = ({ roomId, gameState }: { roomId: string; gameState: BullsCowsGameState }) => {
      setGameState(gameState);
      setIsLocalSingle(false);
      setErrorMessage(null);
    };

    const handleStateUpdate = (updatedState: BullsCowsGameState) => {
      setGameState(updatedState);
    };

    const handleChatMessage = (msg: BullsCowsChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
      if (msg.isSystem && msg.text && msg.text.includes('SOLVED')) {
        sound.playWordSubmit();
      }
    };

    const handleError = ({ message }: { message: string }) => {
      sound.playPenalty();
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 4000);
    };

    socket.on('bullsCows:roomCreated', handleRoomCreated);
    socket.on('bullsCows:roomJoined', handleRoomJoined);
    socket.on('bullsCows:stateUpdate', handleStateUpdate);
    socket.on('bullsCows:chatMessage', handleChatMessage);
    socket.on('bullsCows:error', handleError);

    return () => {
      socket.off('bullsCows:roomCreated', handleRoomCreated);
      socket.off('bullsCows:roomJoined', handleRoomJoined);
      socket.off('bullsCows:stateUpdate', handleStateUpdate);
      socket.off('bullsCows:chatMessage', handleChatMessage);
      socket.off('bullsCows:error', handleError);
    };
  }, [socket]);

  // Create Room handler
  const handleCreateRoom = (settings: Partial<BullsCowsRoomSettings>, isSinglePlayer?: boolean) => {
    if (socket?.connected && !isSinglePlayer) {
      socket.emit('bullsCows:createRoom', {
        playerName: user.name,
        avatar: user.avatar,
        settings: {
          ...settings,
          timeLimit: 0
        },
        isSinglePlayer: false
      });
      return;
    }

    // Single-player or offline local instance
    setIsLocalSingle(true);
    const wordLen = settings.wordLength || 5;
    const diff = settings.difficulty || 'MEDIUM';
    const target = generateDiverseTargetWord(wordLen, diff, [], !!settings.allowRepeatedLetters);
    setLocalTargetWord(target);
    setLocalStartTime(Date.now());

    const initialSettings: BullsCowsRoomSettings = {
      wordLength: wordLen,
      difficulty: diff,
      gameMode: 'SAME_TARGET',
      maxRounds: settings.maxRounds || 1,
      timeLimit: 0,
      allowRepeatedLetters: !!settings.allowRepeatedLetters,
      maxPlayers: 1,
      ...settings
    };

    setGameState({
      roomId: 'SOLO-PLAY',
      isSinglePlayer: true,
      phase: 'PLAYING',
      currentRound: 1,
      maxRounds: initialSettings.maxRounds,
      settings: initialSettings,
      hostId: 'local-user',
      players: [
        {
          id: 'local-user',
          name: user.name,
          avatar: user.avatar,
          isHost: true,
          isReady: true,
          score: 0,
          roundScore: 0,
          guessesCount: 0,
          timeTaken: 0,
          hasSolved: false,
          guessHistory: []
        }
      ],
      timeRemaining: 0,
      recentTargetWords: [target]
    });
  };

  // Join Room handler
  const handleJoinRoom = (roomCode: string) => {
    if (socket?.connected) {
      socket.emit('bullsCows:joinRoom', {
        roomId: roomCode,
        playerName: user.name,
        avatar: user.avatar
      });
    } else {
      setErrorMessage('Unable to connect to game server. Please check your internet connection.');
    }
  };

  // Submit Guess handler
  const handleSubmitGuess = (guess: string) => {
    if (!isLocalSingle && socket?.connected) {
      socket.emit('bullsCows:submitGuess', { guess });
      return;
    }

    // Local execution
    if (!gameState || gameState.phase !== 'PLAYING') return;

    const validation = validateWordInput(
      guess,
      gameState.settings.wordLength,
      false
    );

    if (!validation.isValid) {
      sound.playPenalty();
      setErrorMessage(validation.errorMessage || 'Invalid guess.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const clean = guess.trim().toUpperCase();
    const target = (localTargetWord || 'PLANT').trim().toUpperCase();
    const result = calculateBullsAndCows(target, clean);
    const timeTaken = Math.max(1, Math.round((Date.now() - localStartTime) / 1000));

    const record: GuessRecord = {
      id: `local-guess-${Date.now()}`,
      guess: clean,
      bulls: result.bulls,
      cows: result.cows,
      letterStatuses: result.letterStatuses,
      timestamp: Date.now(),
      solved: result.isSolved
    };

    setGameState(prev => {
      if (!prev) return prev;
      const me = { ...prev.players[0] };
      me.guessesCount++;
      me.guessHistory = [record, ...me.guessHistory];

      if (result.isSolved) {
        me.hasSolved = true;
        me.timeTaken = timeTaken;
        const scoreData = calculateBullsCowsScore(me.guessesCount, timeTaken, true);
        me.roundScore = scoreData.totalScore;
        me.score += scoreData.totalScore;
        sound.playVictory();

        return {
          ...prev,
          phase: 'FINAL_PODIUM',
          roundWinningWord: localTargetWord,
          players: [me]
        };
      }

      return {
        ...prev,
        players: [me]
      };
    });
  };

  const handleToggleReady = () => {
    if (socket?.connected) {
      socket.emit('bullsCows:toggleReady');
    }
  };

  const handleUpdateSettings = (newSettings: Partial<BullsCowsRoomSettings>) => {
    if (socket?.connected) {
      socket.emit('bullsCows:updateSettings', newSettings);
    }
  };

  const handleAddBot = () => {
    if (socket?.connected) {
      socket.emit('bullsCows:addBot');
    }
  };

  const handleRemoveBot = (botId: string) => {
    if (socket?.connected) {
      socket.emit('bullsCows:removeBot', { botId });
    }
  };

  const handleKickPlayer = (playerId: string) => {
    if (socket?.connected) {
      socket.emit('bullsCows:kickPlayer', { playerId });
    }
  };

  const handleStartGame = () => {
    if (socket?.connected) {
      socket.emit('bullsCows:startGame');
    }
  };

  const handleRestartGame = () => {
    if (!isLocalSingle && socket?.connected) {
      socket.emit('bullsCows:restartGame');
    } else {
      handleCreateRoom(gameState?.settings || {}, true);
    }
  };

  const handleLeaveRoom = () => {
    if (socket?.connected) {
      socket.emit('bullsCows:leaveRoom');
    }
    setGameState(null);
    setIsLocalSingle(false);
    setChatMessages([]);
  };

  const handleSendMessage = (text: string) => {
    if (socket?.connected) {
      socket.emit('bullsCows:chatSend', { text });
    } else {
      const msg: BullsCowsChatMessage = {
        id: `local-chat-${Date.now()}`,
        playerId: 'local-user',
        playerName: user.name,
        avatar: user.avatar,
        text,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, msg]);
    }
  };

  const handleSendEmote = (emote: string) => {
    if (socket?.connected) {
      socket.emit('bullsCows:chatEmote', { emote });
    } else {
      const msg: BullsCowsChatMessage = {
        id: `local-emote-${Date.now()}`,
        playerId: 'local-user',
        playerName: user.name,
        avatar: user.avatar,
        emote,
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, msg]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Toast Error Alert */}
      {errorMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-rose-600 text-white font-bold text-xs shadow-2xl shadow-rose-600/30 flex items-center gap-2 animate-bounce">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Screen Views */}
      <main className="flex-1 flex flex-col justify-center">
        {!gameState && (
          <BullsCowsHomeHub
            user={user}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onOpenRules={() => setShowRules(true)}
          />
        )}

        {gameState && gameState.phase === 'LOBBY' && (
          <BullsCowsLobbyView
            gameState={gameState}
            currentUserId={currentUserId}
            onToggleReady={handleToggleReady}
            onUpdateSettings={handleUpdateSettings}
            onAddBot={handleAddBot}
            onRemoveBot={handleRemoveBot}
            onKickPlayer={handleKickPlayer}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {gameState && gameState.phase === 'PLAYING' && (
          <BullsCowsGameView
            gameState={gameState}
            currentUserId={currentUserId}
            onSubmitGuess={handleSubmitGuess}
            onOpenRules={() => setShowRules(true)}
            onLeaveGame={handleLeaveRoom}
          />
        )}

        {gameState && (gameState.phase === 'ROUND_RESULTS' || gameState.phase === 'FINAL_PODIUM') && (
          <BullsCowsRoundResultView
            gameState={gameState}
            currentUserId={currentUserId}
            onRestartGame={handleRestartGame}
            onLeaveGame={handleLeaveRoom}
          />
        )}
      </main>

      {/* Live Chat Drawer (for Multiplayer) */}
      {gameState && !gameState.isSinglePlayer && (
        <BullsCowsChatDrawer
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onSendEmote={handleSendEmote}
          currentUserId={currentUserId}
        />
      )}

      {/* Rules & Tutorial Modal */}
      {showRules && (
        <BullsCowsHowToPlayModal onClose={() => setShowRules(false)} />
      )}

    </div>
  );
};
