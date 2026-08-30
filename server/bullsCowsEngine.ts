import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  BullsCowsGameState,
  BullsCowsPlayer,
  BullsCowsRoomSettings,
  BullsCowsChatMessage,
  WordLength,
  GameDifficulty,
  BullsCowsGameMode,
  GuessRecord
} from '../src/types/bullsCows.js';
import {
  calculateBullsAndCows,
  generateDiverseTargetWord,
  calculateBullsCowsScore,
  validateWordInput
} from '../src/utils/bullsCowsEngine.js';

interface BullsCowsRoomData {
  state: BullsCowsGameState;
  privateTargets: Map<string, string>; // playerId -> target word (hidden from client during play)
  commonTargetWord?: string; // For SAME_TARGET and SPEED_BULLS
  timerInterval?: NodeJS.Timeout;
  botIntervals?: NodeJS.Timeout[];
  roundStartTime: number;
}

const bullsCowsRooms = new Map<string, BullsCowsRoomData>();

function generateRoomCode(): string {
  const chars = 'BCDEFGHJKLMNPQRTVWXYZ2346789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const BOT_NAMES = [
  'Arun (Bot)', 'Priya (Bot)', 'Ravi (Bot)', 'Vijay (Bot)', 
  'Karthik (Bot)', 'Ananya (Bot)', 'Mani (Bot)'
];
const BOT_AVATARS = ['🐂', '🐄', '🦁', '🐯', '🦅', '🐺', '🦊'];

/**
 * Sanitize state before sending to clients (Anti-Cheat: strip secret target words during PLAYING)
 */
function getSanitizedGameState(roomId: string): BullsCowsGameState | null {
  const room = bullsCowsRooms.get(roomId);
  if (!room) return null;

  const { state } = room;
  const isRoundOver = state.phase === 'ROUND_RESULTS' || state.phase === 'FINAL_PODIUM';

  return {
    ...state,
    roundWinningWord: isRoundOver ? (room.commonTargetWord || Array.from(room.privateTargets.values())[0]) : undefined
  };
}

function broadcastRoomState(io: SocketIOServer, roomId: string) {
  const room = bullsCowsRooms.get(roomId);
  if (!room) return;

  const sanitized = getSanitizedGameState(roomId);
  if (sanitized) {
    io.to(roomId).emit('bullsCows:stateUpdate', sanitized);
  }
}

function broadcastSystemChat(io: SocketIOServer, roomId: string, text: string) {
  const msg: BullsCowsChatMessage = {
    id: `sys-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    playerId: 'system',
    playerName: 'Bulls & Cows Referee 🐂',
    avatar: '🎯',
    text,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('bullsCows:chatMessage', msg);
}

/**
 * Starts a new round of Bulls & Cows
 */
function startBullsCowsRound(io: SocketIOServer, roomId: string) {
  const room = bullsCowsRooms.get(roomId);
  if (!room) return;

  const { state } = room;
  const settings = state.settings;

  // Clear previous timers and bot intervals
  if (room.timerInterval) clearInterval(room.timerInterval);
  if (room.botIntervals) {
    room.botIntervals.forEach(t => clearTimeout(t));
  }
  room.botIntervals = [];
  room.privateTargets.clear();

  // Reset player round states
  state.players.forEach(p => {
    p.hasSolved = false;
    p.guessesCount = 0;
    p.timeTaken = 0;
    p.roundScore = 0;
    p.solveTime = undefined;
    p.guessHistory = [];
  });

  state.phase = 'PLAYING';
  state.roundWinnerId = undefined;
  state.roundWinningWord = undefined;
  state.timeRemaining = settings.gameMode === 'SPEED_BULLS' ? 45 : settings.timeLimit;
  room.roundStartTime = Date.now();

  // Generate target words based on mode with diversity engine
  if (settings.gameMode === 'SAME_TARGET' || settings.gameMode === 'SPEED_BULLS') {
    const commonWord = generateDiverseTargetWord(
      settings.wordLength,
      settings.difficulty,
      state.recentTargetWords,
      settings.allowRepeatedLetters
    );
    room.commonTargetWord = commonWord;
    state.recentTargetWords.push(commonWord);
    if (state.recentTargetWords.length > 8) state.recentTargetWords.shift();

    state.players.forEach(p => {
      room.privateTargets.set(p.id, commonWord);
    });
  } else {
    // SECRET_TARGET: Each player gets a unique distinct target word
    state.players.forEach(p => {
      const distinctWord = generateDiverseTargetWord(
        settings.wordLength,
        settings.difficulty,
        [...state.recentTargetWords, ...Array.from(room.privateTargets.values())],
        settings.allowRepeatedLetters
      );
      room.privateTargets.set(p.id, distinctWord);
      state.recentTargetWords.push(distinctWord);
      if (state.recentTargetWords.length > 15) state.recentTargetWords.shift();
    });
  }

  broadcastRoomState(io, roomId);
  broadcastSystemChat(
    io,
    roomId,
    `🚀 Round ${state.currentRound}/${state.maxRounds} started! Guess the secret ${settings.wordLength}-letter word!`
  );

  // Setup bots AI guesses with realistic guessing intervals
  scheduleBotGuesses(io, roomId);
}

/**
 * Bot automated guessing logic
 */
function scheduleBotGuesses(io: SocketIOServer, roomId: string) {
  const room = bullsCowsRooms.get(roomId);
  if (!room) return;

  const botPlayers = room.state.players.filter(p => p.isBot);
  if (botPlayers.length === 0) return;

  botPlayers.forEach(bot => {
    // Schedule 3 to 6 guesses for bot across a relaxed timeframe
    const numGuesses = Math.floor(Math.random() * 3) + 3; // 3-5 guesses
    const target = room.privateTargets.get(bot.id) || room.commonTargetWord || 'PLANT';

    for (let i = 1; i <= numGuesses; i++) {
      // Natural bot guess spacing (every 10–25 seconds)
      const delay = (i * 12000) + Math.floor(Math.random() * 6000);

      const timer = setTimeout(() => {
        if (!bullsCowsRooms.has(roomId)) return;
        const currentRoom = bullsCowsRooms.get(roomId)!;
        if (currentRoom.state.phase !== 'PLAYING') return;

        const currentBot = currentRoom.state.players.find(p => p.id === bot.id);
        if (!currentBot || currentBot.hasSolved) return;

        // Last guess has a 75% chance to be the exact correct solve
        let guessWord = '';
        if (i === numGuesses && Math.random() < 0.75) {
          guessWord = target;
        } else {
          guessWord = generateDiverseTargetWord(
            currentRoom.state.settings.wordLength,
            'EASY',
            [target]
          );
        }

        processBullsCowsGuess(io, roomId, bot.id, guessWord);
      }, delay);

      room.botIntervals?.push(timer);
    }
  });
}

/**
 * Processes a player or bot guess submission
 */
function processBullsCowsGuess(
  io: SocketIOServer,
  roomId: string,
  playerId: string,
  guessInput: string
): { success: boolean; message?: string; record?: GuessRecord } {
  const room = bullsCowsRooms.get(roomId);
  if (!room || room.state.phase !== 'PLAYING') {
    return { success: false, message: 'Game is not currently accepting guesses.' };
  }

  const { state } = room;
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { success: false, message: 'Player not found in room.' };

  if (player.hasSolved) {
    return { success: false, message: 'You have already solved this round!' };
  }

  const targetWord = room.privateTargets.get(playerId) || room.commonTargetWord;
  if (!targetWord) {
    return { success: false, message: 'Target word error on server.' };
  }

  const validation = validateWordInput(
    guessInput,
    state.settings.wordLength,
    false
  );

  if (!validation.isValid) {
    return { success: false, message: validation.errorMessage };
  }

  const cleanGuess = guessInput.trim().toUpperCase();
  const result = calculateBullsAndCows(targetWord, cleanGuess);
  const timeTaken = Math.max(1, Math.round((Date.now() - room.roundStartTime) / 1000));

  const record: GuessRecord = {
    id: `guess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    guess: cleanGuess,
    bulls: result.bulls,
    cows: result.cows,
    letterStatuses: result.letterStatuses,
    timestamp: Date.now(),
    solved: result.isSolved
  };

  player.guessesCount++;
  player.guessHistory.unshift(record); // newest first

  if (result.isSolved) {
    player.hasSolved = true;
    player.solveTime = timeTaken;
    player.timeTaken = timeTaken;

    const scoreData = calculateBullsCowsScore(player.guessesCount, timeTaken, true);
    player.roundScore = scoreData.totalScore;
    player.score += scoreData.totalScore;

    if (!state.roundWinnerId) {
      state.roundWinnerId = player.id;
    }

    broadcastSystemChat(
      io,
      roomId,
      `🎉 ${player.name} SOLVED the word in ${player.guessesCount} guesses (${timeTaken}s)! (+${scoreData.totalScore} pts)`
    );

    // In SPEED_BULLS, first solve wins and ends the round immediately
    if (state.settings.gameMode === 'SPEED_BULLS') {
      endBullsCowsRound(io, roomId, `${player.name} won the Speed round!`);
      return { success: true, record };
    }

    // In other modes, check if all active real players have solved
    const allSolved = state.players.every(p => p.hasSolved || p.isBot);
    if (allSolved) {
      endBullsCowsRound(io, roomId, 'All players have finished guessing!');
    }
  }

  broadcastRoomState(io, roomId);
  return { success: true, record };
}

/**
 * Ends a round and shows round results
 */
function endBullsCowsRound(io: SocketIOServer, roomId: string, reason?: string) {
  const room = bullsCowsRooms.get(roomId);
  if (!room) return;

  if (room.timerInterval) clearInterval(room.timerInterval);
  if (room.botIntervals) {
    room.botIntervals.forEach(t => clearTimeout(t));
  }

  const { state } = room;
  state.phase = 'ROUND_RESULTS';
  state.timeRemaining = 8; // 8s result screen

  // Reveal winning word
  state.roundWinningWord = room.commonTargetWord || Array.from(room.privateTargets.values())[0];

  broadcastRoomState(io, roomId);
  broadcastSystemChat(
    io,
    roomId,
    `🏆 Round ${state.currentRound} ended! ${reason || ''} Target was: ${state.roundWinningWord}`
  );

  room.timerInterval = setInterval(() => {
    state.timeRemaining--;

    if (state.timeRemaining <= 0) {
      clearInterval(room.timerInterval);

      if (state.currentRound >= state.maxRounds) {
        finishBullsCowsGame(io, roomId);
      } else {
        state.currentRound++;
        startBullsCowsRound(io, roomId);
      }
    } else {
      broadcastRoomState(io, roomId);
    }
  }, 1000);
}

/**
 * Final match podium
 */
function finishBullsCowsGame(io: SocketIOServer, roomId: string) {
  const room = bullsCowsRooms.get(roomId);
  if (!room) return;

  const { state } = room;
  state.phase = 'FINAL_PODIUM';
  state.timeRemaining = 0;

  // Sort players by total score descending
  state.players.sort((a, b) => b.score - a.score);

  broadcastRoomState(io, roomId);
  broadcastSystemChat(
    io,
    roomId,
    `👑 MATCH FINISHED! Champion is ${state.players[0]?.name} with ${state.players[0]?.score} pts! 🐂`
  );
}

/**
 * Setup Socket handlers for Bulls & Cows
 */
export function setupBullsCowsSocketHandlers(io: SocketIOServer, socket: Socket) {
  let currentRoomId: string | null = null;

  // Create Room
  socket.on('bullsCows:createRoom', ({
    playerName,
    avatar,
    settings,
    isSinglePlayer
  }: {
    playerName: string;
    avatar: string;
    settings?: Partial<BullsCowsRoomSettings>;
    isSinglePlayer?: boolean;
  }) => {
    const roomId = generateRoomCode();
    currentRoomId = roomId;

    const hostPlayer: BullsCowsPlayer = {
      id: socket.id,
      name: playerName || 'Player 1',
      avatar: avatar || '🐂',
      isHost: true,
      isReady: true,
      score: 0,
      roundScore: 0,
      guessesCount: 0,
      timeTaken: 0,
      hasSolved: false,
      guessHistory: []
    };

    const defaultSettings: BullsCowsRoomSettings = {
      wordLength: 5,
      difficulty: 'MEDIUM',
      gameMode: 'SAME_TARGET',
      maxRounds: 3,
      timeLimit: 90,
      allowRepeatedLetters: false,
      maxPlayers: 2, // Strictly 1 vs 1 or Solo with Bot
      ...settings
    };

    const initialGameState: BullsCowsGameState = {
      roomId,
      isSinglePlayer: !!isSinglePlayer,
      phase: isSinglePlayer ? 'PLAYING' : 'LOBBY',
      currentRound: 1,
      maxRounds: defaultSettings.maxRounds,
      settings: defaultSettings,
      hostId: socket.id,
      players: [hostPlayer],
      timeRemaining: defaultSettings.timeLimit,
      recentTargetWords: []
    };

    bullsCowsRooms.set(roomId, {
      state: initialGameState,
      privateTargets: new Map(),
      roundStartTime: Date.now()
    });

    socket.join(roomId);

    if (isSinglePlayer) {
      // Immediately start round for single player
      startBullsCowsRound(io, roomId);
    } else {
      broadcastRoomState(io, roomId);
      broadcastSystemChat(io, roomId, `🎯 Room ${roomId} created by ${hostPlayer.name}. Share code to play!`);
    }

    socket.emit('bullsCows:roomCreated', { roomId, gameState: getSanitizedGameState(roomId) });
  });

  // Join Room
  socket.on('bullsCows:joinRoom', ({ roomId, playerName, avatar }: { roomId: string; playerName: string; avatar: string }) => {
    const upperCode = (roomId || '').trim().toUpperCase();
    console.log(`[BullsCows] Socket ${socket.id} attempting to join room: ${upperCode} as "${playerName}"`);
    const room = bullsCowsRooms.get(upperCode);

    if (!room) {
      console.log(`[BullsCows] Room ${upperCode} not found in memory`);
      socket.emit('bullsCows:error', { message: `Bulls & Cows Room "${upperCode}" not found. Please check your room code.` });
      return;
    }

    if (room.state.players.length >= room.state.settings.maxPlayers && !room.state.players.some(p => p.id === socket.id)) {
      socket.emit('bullsCows:error', { message: 'Room is full (Max 7 players).' });
      return;
    }

    if (room.state.phase !== 'LOBBY') {
      socket.emit('bullsCows:error', { message: 'A game is already in progress in this room.' });
      return;
    }

    currentRoomId = upperCode;
    socket.join(upperCode);

    const existingPlayer = room.state.players.find(p => p.id === socket.id);
    if (existingPlayer) {
      if (playerName) existingPlayer.name = playerName;
      if (avatar) existingPlayer.avatar = avatar;
    } else {
      const newPlayer: BullsCowsPlayer = {
        id: socket.id,
        name: playerName || `Player ${room.state.players.length + 1}`,
        avatar: avatar || '🐄',
        isHost: false,
        isReady: false,
        score: 0,
        roundScore: 0,
        guessesCount: 0,
        timeTaken: 0,
        hasSolved: false,
        guessHistory: []
      };
      room.state.players.push(newPlayer);
      broadcastSystemChat(io, upperCode, `👋 ${newPlayer.name} joined the Bulls & Cows lobby.`);
    }

    socket.emit('bullsCows:roomJoined', { roomId: upperCode, gameState: getSanitizedGameState(upperCode) });
    broadcastRoomState(io, upperCode);
  });

  // Add Bot Player (Host only)
  socket.on('bullsCows:addBot', () => {
    if (!currentRoomId) return;
    const room = bullsCowsRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    if (room.state.players.length >= room.state.settings.maxPlayers) {
      socket.emit('bullsCows:error', { message: 'Room is full (Max 7 players).' });
      return;
    }

    const availableNames = BOT_NAMES.filter(n => !room.state.players.some(p => p.name === n));
    const botName = availableNames[0] || `Bot ${room.state.players.length + 1}`;
    const botAvatar = BOT_AVATARS[room.state.players.length % BOT_AVATARS.length];

    const botPlayer: BullsCowsPlayer = {
      id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: botName,
      avatar: botAvatar,
      isHost: false,
      isReady: true,
      isBot: true,
      score: 0,
      roundScore: 0,
      guessesCount: 0,
      timeTaken: 0,
      hasSolved: false,
      guessHistory: []
    };

    room.state.players.push(botPlayer);
    broadcastRoomState(io, currentRoomId);
    broadcastSystemChat(io, currentRoomId, `🤖 Added AI Player ${botName}.`);
  });

  // Remove Bot (Host only)
  socket.on('bullsCows:removeBot', ({ botId }: { botId: string }) => {
    if (!currentRoomId) return;
    const room = bullsCowsRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    const idx = room.state.players.findIndex(p => p.id === botId && p.isBot);
    if (idx !== -1) {
      const removed = room.state.players.splice(idx, 1)[0];
      broadcastRoomState(io, currentRoomId);
      broadcastSystemChat(io, currentRoomId, `🤖 Removed bot ${removed.name}.`);
    }
  });

  // Toggle Ready
  socket.on('bullsCows:toggleReady', () => {
    if (!currentRoomId) return;
    const room = bullsCowsRooms.get(currentRoomId);
    if (!room) return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      broadcastRoomState(io, currentRoomId);
    }
  });

  // Update Room Settings (Host only)
  socket.on('bullsCows:updateSettings', (newSettings: Partial<BullsCowsRoomSettings>) => {
    if (!currentRoomId) return;
    const room = bullsCowsRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    room.state.settings = { ...room.state.settings, ...newSettings };
    if (newSettings.maxRounds) {
      room.state.maxRounds = newSettings.maxRounds;
    }
    broadcastRoomState(io, currentRoomId);
  });

  // Start Game (Host only)
  socket.on('bullsCows:startGame', () => {
    if (!currentRoomId) return;
    const room = bullsCowsRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id) return;

    const unreadyRealPlayers = room.state.players.filter(p => !p.isBot && !p.isReady);
    if (unreadyRealPlayers.length > 0) {
      socket.emit('bullsCows:error', { message: 'All players must be READY to start.' });
      return;
    }

    startBullsCowsRound(io, currentRoomId);
  });

  // Submit Guess
  socket.on('bullsCows:submitGuess', ({ guess }: { guess: string }) => {
    if (!currentRoomId) return;
    const result = processBullsCowsGuess(io, currentRoomId, socket.id, guess);
    if (!result.success) {
      socket.emit('bullsCows:error', { message: result.message || 'Invalid guess.' });
    }
  });

  // Replay Game
  socket.on('bullsCows:restartGame', () => {
    if (!currentRoomId) return;
    const room = bullsCowsRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id) return;

    room.state.currentRound = 1;
    room.state.phase = 'LOBBY';
    room.state.players.forEach(p => {
      p.score = 0;
      p.roundScore = 0;
      p.guessesCount = 0;
      p.timeTaken = 0;
      p.hasSolved = false;
      p.guessHistory = [];
      p.isReady = p.isBot ? true : (p.id === room.state.hostId);
    });

    broadcastRoomState(io, currentRoomId);
    broadcastSystemChat(io, currentRoomId, '🔄 Game reset! Ready up for a new match!');
  });

  // Chat message
  socket.on('bullsCows:chatSend', ({ text }: { text: string }) => {
    if (!currentRoomId) return;
    const room = bullsCowsRooms.get(currentRoomId);
    if (!room) return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (!player) return;

    const clean = (text || '').trim().substring(0, 100);
    if (!clean) return;

    // Prevent leaking target word in chat
    const targetWord = room.privateTargets.get(socket.id) || room.commonTargetWord;
    if (targetWord && clean.toUpperCase().includes(targetWord.toUpperCase()) && room.state.phase === 'PLAYING') {
      socket.emit('bullsCows:error', { message: 'Cannot post secret target words in room chat!' });
      return;
    }

    const msg: BullsCowsChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: socket.id,
      playerName: player.name,
      avatar: player.avatar,
      text: clean,
      timestamp: Date.now()
    };

    io.to(currentRoomId).emit('bullsCows:chatMessage', msg);
  });

  // Chat Emote
  socket.on('bullsCows:chatEmote', ({ emote }: { emote: string }) => {
    if (!currentRoomId) return;
    const room = bullsCowsRooms.get(currentRoomId);
    if (!room) return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (!player) return;

    const msg: BullsCowsChatMessage = {
      id: `emote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: socket.id,
      playerName: player.name,
      avatar: player.avatar,
      emote: emote || '🐂',
      timestamp: Date.now()
    };

    io.to(currentRoomId).emit('bullsCows:chatMessage', msg);
  });

  // Leave room
  const handleLeave = () => {
    if (!currentRoomId) return;
    const room = bullsCowsRooms.get(currentRoomId);
    if (!room) return;

    const leavingIdx = room.state.players.findIndex(p => p.id === socket.id);
    if (leavingIdx !== -1) {
      const leavingPlayer = room.state.players.splice(leavingIdx, 1)[0];
      broadcastSystemChat(io, currentRoomId, `👋 ${leavingPlayer.name} left the room.`);

      if (room.state.players.length === 0 || room.state.players.every(p => p.isBot)) {
        if (room.timerInterval) clearInterval(room.timerInterval);
        if (room.botIntervals) room.botIntervals.forEach(t => clearTimeout(t));
        bullsCowsRooms.delete(currentRoomId);
        return;
      }

      if (leavingPlayer.isHost) {
        const nextReal = room.state.players.find(p => !p.isBot) || room.state.players[0];
        if (nextReal) {
          nextReal.isHost = true;
          room.state.hostId = nextReal.id;
          broadcastSystemChat(io, currentRoomId, `👑 ${nextReal.name} is now the room host.`);
        }
      }

      broadcastRoomState(io, currentRoomId);
    }
  };

  socket.on('bullsCows:leaveRoom', handleLeave);
  socket.on('disconnect', handleLeave);
}
