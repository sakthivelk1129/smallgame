import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  StopwatchGameState,
  StopwatchPlayer,
  StopwatchSettings,
  StopwatchRoundResult,
  StopwatchPlayerRoundResult,
  StopwatchTeam,
  StopwatchChatMessage
} from '../src/types/stopwatch.js';

// In-memory Stopwatch Rooms
const stopwatchRooms = new Map<string, {
  state: StopwatchGameState;
  timerInterval?: NodeJS.Timeout;
  botTimeouts: NodeJS.Timeout[];
}>();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRTVWXYZ2346789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const BOT_NAMES = [
  'Chronos AI', 'Quantum Bot', 'Pulse Rider', 'Nova Clock',
  'Titan Stop', 'Echo Timer', 'Apex Reflex', 'Cyber Tick'
];
const BOT_AVATARS = ['⏱️', '⚡', '🤖', '🎯', '🔥', '💎', '🚀', '🌟'];

// Generate clean target times with realistic rounded decimals from 1.000s up to 10.000s
function generateTargetTime(min: number = 1.0, max: number = 10.0): number {
  const steps = [
    1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 4.75, 5.0, 5.25, 5.5, 6.0, 6.5, 7.0, 7.25, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0
  ];
  const valid = steps.filter(s => s >= min && s <= max);
  if (valid.length > 0) {
    return valid[Math.floor(Math.random() * valid.length)];
  }
  const raw = min + Math.random() * (max - min);
  return Math.round(raw * 10) / 10;
}

function broadcastState(io: SocketIOServer, roomId: string) {
  const room = stopwatchRooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit('stopwatch:stateUpdate', room.state);
}

function broadcastChat(io: SocketIOServer, roomId: string, text: string, playerName = 'Herald ⏱️', avatar = '🎯') {
  const msg: StopwatchChatMessage = {
    id: `msg-${Date.now()}-${Math.random()}`,
    playerId: 'system',
    playerName,
    avatar,
    text,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('stopwatch:chat', msg);
}

// Start Round Execution
function startStopwatchRound(io: SocketIOServer, roomId: string) {
  const room = stopwatchRooms.get(roomId);
  if (!room) return;

  const { state } = room;
  // Clear any old timers
  if (room.timerInterval) clearInterval(room.timerInterval);
  room.botTimeouts.forEach(t => clearTimeout(t));
  room.botTimeouts = [];

  // Reset player round variables
  state.players.forEach(p => {
    p.stoppedTime = null;
    p.difference = null;
    p.pointsGained = 0;
    p.isExactMatch = false;
    p.hasStopped = false;
  });

  state.targetTime = generateTargetTime(state.settings.minTarget, state.settings.maxTarget);
  state.phase = 'TARGET_ANNOUNCEMENT';
  state.countdownTimer = 3;
  state.timerStartedAt = null;

  broadcastState(io, roomId);
  broadcastChat(io, roomId, `🎯 Round ${state.currentRound}/${state.maxRounds} Target Time: ${state.targetTime.toFixed(2)}s! Get Ready!`);

  // 3-2-1 Countdown before stopwatch launches
  room.timerInterval = setInterval(() => {
    state.countdownTimer--;
    if (state.countdownTimer <= 0) {
      clearInterval(room.timerInterval);
      launchActiveStopwatch(io, roomId);
    } else {
      broadcastState(io, roomId);
    }
  }, 1000);
}

// Active Stopwatch running
function launchActiveStopwatch(io: SocketIOServer, roomId: string) {
  const room = stopwatchRooms.get(roomId);
  if (!room) return;

  const { state } = room;
  state.phase = 'ACTIVE_STOPWATCH';
  state.timerStartedAt = Date.now();
  state.countdownTimer = 0;

  broadcastState(io, roomId);

  // Schedule AI Bot stops
  state.players.filter(p => p.isBot).forEach(bot => {
    let diffVariance = 0.15; // default medium
    if (bot.botDifficulty === 'easy') diffVariance = 0.35 + Math.random() * 0.25;
    else if (bot.botDifficulty === 'hard') diffVariance = 0.04 + Math.random() * 0.06;
    else if (bot.botDifficulty === 'expert') diffVariance = 0.01 + Math.random() * 0.02;
    else diffVariance = 0.08 + Math.random() * 0.12;

    // 5% chance of exact match for Hard/Expert bots!
    const isBotExact = (bot.botDifficulty === 'hard' || bot.botDifficulty === 'expert') && Math.random() < 0.15;
    const offset = isBotExact ? 0 : (Math.random() < 0.5 ? -diffVariance : diffVariance);
    const targetOffset = Math.max(0.1, state.targetTime + offset);
    const delayMs = Math.round(targetOffset * 1000);

    const t = setTimeout(() => {
      handlePlayerStop(io, roomId, bot.id, targetOffset);
    }, delayMs);
    room.botTimeouts.push(t);
  });

  // Safety timer limit (Target + 6s max)
  const maxWaitMs = Math.round((state.targetTime + 6) * 1000);
  const timeoutId = setTimeout(() => {
    // Auto stop anyone remaining
    const remaining = state.players.filter(p => !p.hasStopped);
    if (remaining.length > 0) {
      remaining.forEach(p => {
        p.stoppedTime = state.targetTime + 5.0;
        p.difference = 5.0;
        p.hasStopped = true;
      });
      evaluateRoundResults(io, roomId);
    }
  }, maxWaitMs);
  room.botTimeouts.push(timeoutId);
}

// Player / Bot stops timer
function handlePlayerStop(io: SocketIOServer, roomId: string, playerId: string, explicitTime?: number) {
  const room = stopwatchRooms.get(roomId);
  if (!room || room.state.phase !== 'ACTIVE_STOPWATCH') return;

  const { state } = room;
  const player = state.players.find(p => p.id === playerId);
  if (!player || player.hasStopped) return;

  let stoppedSec = 0;
  if (explicitTime !== undefined) {
    stoppedSec = Math.round(explicitTime * 100) / 100;
  } else if (state.timerStartedAt) {
    const elapsedMs = Date.now() - state.timerStartedAt;
    stoppedSec = Math.round(elapsedMs / 10) / 100;
  }

  const diff = Math.round(Math.abs(stoppedSec - state.targetTime) * 100) / 100;
  const isExact = diff < 0.01; // exact match within 10 milliseconds / 0.01s

  player.stoppedTime = stoppedSec;
  player.difference = diff;
  player.isExactMatch = isExact;
  player.hasStopped = true;

  if (player.bestDiff === undefined || diff < player.bestDiff) {
    player.bestDiff = diff;
  }
  if (isExact) {
    player.exactMatchesCount = (player.exactMatchesCount || 0) + 1;
  }

  broadcastState(io, roomId);

  // Check if all players have stopped
  const allStopped = state.players.every(p => p.hasStopped);
  if (allStopped) {
    // Clear bot timeouts
    room.botTimeouts.forEach(t => clearTimeout(t));
    room.botTimeouts = [];
    evaluateRoundResults(io, roomId);
  }
}

// Evaluate scoring and assign points
function evaluateRoundResults(io: SocketIOServer, roomId: string) {
  const room = stopwatchRooms.get(roomId);
  if (!room) return;

  const { state } = room;
  state.phase = 'ROUND_RESULT';

  const format = state.settings.format; // 'single' or 'team'
  const validPlayers = state.players.filter(p => p.stoppedTime !== null);

  // Find min diff
  const minDiff = Math.min(...validPlayers.map(p => p.difference ?? 999));
  const exactPlayers = validPlayers.filter(p => p.isExactMatch);

  const winningPlayerIds: string[] = [];
  let isDraw = false;
  let summaryText = '';

  if (format === 'single') {
    // SINGLE / 1v1 FORMAT
    if (exactPlayers.length > 0) {
      // 2 points for exact match
      exactPlayers.forEach(p => {
        p.pointsGained = 2;
        p.score += 2;
        winningPlayerIds.push(p.id);
      });
      if (exactPlayers.length > 1) {
        isDraw = true;
        summaryText = `🎯 BULLSEYE DRAW! ${exactPlayers.map(p => p.name).join(' & ')} stopped at EXACT target time! (+2 pts each)`;
      } else {
        summaryText = `🎯 PERFECT BULLSEYE! ${exactPlayers[0].name} hit the exact ${state.targetTime.toFixed(2)}s target! (+2 pts)`;
      }
    } else {
      // Nearest players
      const closestPlayers = validPlayers.filter(p => p.difference === minDiff);
      if (closestPlayers.length > 1) {
        // Tied distance = Draw (1 point each as requested)
        isDraw = true;
        closestPlayers.forEach(p => {
          p.pointsGained = 1;
          p.score += 1;
          winningPlayerIds.push(p.id);
        });
        summaryText = `🤝 TIE / DRAW! ${closestPlayers.map(p => p.name).join(' & ')} had the exact same difference (${minDiff.toFixed(2)}s)! (+1 pt each)`;
      } else if (closestPlayers.length === 1) {
        const winner = closestPlayers[0];
        winner.pointsGained = 1;
        winner.score += 1;
        winningPlayerIds.push(winner.id);
        summaryText = `🥇 ${winner.name} won with closest time (${winner.stoppedTime?.toFixed(2)}s, diff: ${minDiff.toFixed(2)}s)! (+1 pt)`;
      }
    }
  } else {
    // TEAM FORMAT (Red vs Blue)
    const redPlayers = validPlayers.filter(p => p.team === 'red');
    const bluePlayers = validPlayers.filter(p => p.team === 'blue');

    const redBest = redPlayers.length > 0 ? Math.min(...redPlayers.map(p => p.difference ?? 999)) : 999;
    const blueBest = bluePlayers.length > 0 ? Math.min(...bluePlayers.map(p => p.difference ?? 999)) : 999;

    const hasRedExact = redPlayers.some(p => p.isExactMatch);
    const hasBlueExact = bluePlayers.some(p => p.isExactMatch);

    let winningTeam: StopwatchTeam | 'draw' = 'draw';

    if (hasRedExact && hasBlueExact) {
      winningTeam = 'draw';
      isDraw = true;
      state.teamScores.red += 2;
      state.teamScores.blue += 2;
      redPlayers.filter(p => p.isExactMatch).forEach(p => { p.pointsGained = 2; p.score += 2; winningPlayerIds.push(p.id); });
      bluePlayers.filter(p => p.isExactMatch).forEach(p => { p.pointsGained = 2; p.score += 2; winningPlayerIds.push(p.id); });
      summaryText = `🎯 TEAM DRAW! Both Team Red and Team Blue landed exact Bullseyes! (+2 pts to both teams)`;
    } else if (hasRedExact) {
      winningTeam = 'red';
      state.teamScores.red += 2;
      redPlayers.forEach(p => { p.pointsGained = p.isExactMatch ? 2 : 1; p.score += p.pointsGained; winningPlayerIds.push(p.id); });
      summaryText = `🎯 TEAM RED BULLSEYE! Team Red achieved exact target time! (+2 pts to Team Red)`;
    } else if (hasBlueExact) {
      winningTeam = 'blue';
      state.teamScores.blue += 2;
      bluePlayers.forEach(p => { p.pointsGained = p.isExactMatch ? 2 : 1; p.score += p.pointsGained; winningPlayerIds.push(p.id); });
      summaryText = `🎯 TEAM BLUE BULLSEYE! Team Blue achieved exact target time! (+2 pts to Team Blue)`;
    } else if (redBest === blueBest) {
      winningTeam = 'draw';
      isDraw = true;
      state.teamScores.red += 1;
      state.teamScores.blue += 1;
      redPlayers.filter(p => p.difference === redBest).forEach(p => { p.pointsGained = 1; p.score += 1; winningPlayerIds.push(p.id); });
      bluePlayers.filter(p => p.difference === blueBest).forEach(p => { p.pointsGained = 1; p.score += 1; winningPlayerIds.push(p.id); });
      summaryText = `🤝 TEAM DRAW! Both teams tied with ${redBest.toFixed(2)}s difference! (+1 pt each)`;
    } else if (redBest < blueBest) {
      winningTeam = 'red';
      state.teamScores.red += 1;
      redPlayers.filter(p => p.difference === redBest).forEach(p => { p.pointsGained = 1; p.score += 1; winningPlayerIds.push(p.id); });
      summaryText = `🔴 TEAM RED WINS ROUND! Nearest time by Team Red (${redBest.toFixed(2)}s diff)! (+1 pt)`;
    } else {
      winningTeam = 'blue';
      state.teamScores.blue += 1;
      bluePlayers.filter(p => p.difference === blueBest).forEach(p => { p.pointsGained = 1; p.score += 1; winningPlayerIds.push(p.id); });
      summaryText = `🔵 TEAM BLUE WINS ROUND! Nearest time by Team Blue (${blueBest.toFixed(2)}s diff)! (+1 pt)`;
    }
  }

  // Record round history
  const roundResultsList: StopwatchPlayerRoundResult[] = validPlayers.map(p => ({
    playerId: p.id,
    playerName: p.name,
    avatar: p.avatar,
    team: p.team,
    stoppedTime: p.stoppedTime ?? 0,
    difference: p.difference ?? 0,
    pointsGained: p.pointsGained,
    isExactMatch: p.isExactMatch,
    isWinner: winningPlayerIds.includes(p.id)
  }));

  const roundResultRecord: StopwatchRoundResult = {
    roundNumber: state.currentRound,
    targetTime: state.targetTime,
    playerResults: roundResultsList,
    winningPlayerIds,
    isDraw,
    summaryText
  };

  state.roundHistory.push(roundResultRecord);
  state.countdownTimer = 6; // 6 seconds to view round result
  broadcastState(io, roomId);
  broadcastChat(io, roomId, summaryText);

  // Interval for transitioning to next round or final podium
  if (room.timerInterval) clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    state.countdownTimer--;
    if (state.countdownTimer <= 0) {
      clearInterval(room.timerInterval);
      if (state.currentRound >= state.maxRounds) {
        state.phase = 'FINAL_RESULTS';
        broadcastState(io, roomId);
        broadcastChat(io, roomId, `🏆 MATCH FINISHED! Check the final podium! 🎉`);
      } else {
        state.currentRound++;
        startStopwatchRound(io, roomId);
      }
    } else {
      broadcastState(io, roomId);
    }
  }, 1000);
}

export function setupStopwatchSocketHandlers(io: SocketIOServer, socket: Socket) {
  let userRoomId: string | null = null;

  // Helper to reliably find the active room for this socket
  const getRoom = () => {
    if (userRoomId && stopwatchRooms.has(userRoomId)) {
      return stopwatchRooms.get(userRoomId);
    }
    for (const [code, r] of stopwatchRooms.entries()) {
      if (r.state.players.some(p => p.id === socket.id)) {
        userRoomId = code;
        return r;
      }
    }
    return null;
  };

  // 1. Create Private / Friends Room
  socket.on('stopwatch:createRoom', ({ playerName, avatar, settings }: { playerName: string; avatar: string; settings?: Partial<StopwatchSettings> }) => {
    const roomId = generateCode();
    userRoomId = roomId;

    const defaultSettings: StopwatchSettings = {
      rounds: 5,
      format: 'single',
      playMode: 'friends',
      minTarget: 1.0,
      maxTarget: 10.0,
      blindfoldMode: false,
      isPrivate: true,
      maxPlayers: 8,
      ...settings
    };

    const hostPlayer: StopwatchPlayer = {
      id: socket.id,
      name: playerName || 'Player 1',
      avatar: avatar || '⏱️',
      isHost: true,
      isReady: true,
      team: defaultSettings.format === 'team' ? 'red' : 'none',
      score: 0,
      stoppedTime: null,
      difference: null,
      pointsGained: 0,
      isExactMatch: false,
      hasStopped: false
    };

    const initialGameState: StopwatchGameState = {
      roomId,
      hostId: socket.id,
      phase: 'LOBBY',
      currentRound: 1,
      maxRounds: defaultSettings.rounds,
      targetTime: 5.0,
      timerStartedAt: null,
      settings: defaultSettings,
      players: [hostPlayer],
      teamScores: { red: 0, blue: 0 },
      roundHistory: [],
      countdownTimer: 0
    };

    stopwatchRooms.set(roomId, {
      state: initialGameState,
      botTimeouts: []
    });

    socket.join(roomId);
    socket.emit('stopwatch:created', { roomId, gameState: initialGameState });
    broadcastState(io, roomId);
    broadcastChat(io, roomId, `⏱️ Room ${roomId} created by ${hostPlayer.name}. Share code with friends!`);
  });

  // 2. Join Room with 6-character Code
  socket.on('stopwatch:joinRoom', ({ roomId, playerName, avatar }: { roomId: string; playerName: string; avatar: string }) => {
    const cleanCode = (roomId || '').trim().toUpperCase();
    console.log(`[Stopwatch] Socket ${socket.id} attempting to join room: ${cleanCode} as "${playerName}"`);
    const room = stopwatchRooms.get(cleanCode);

    if (!room) {
      console.log(`[Stopwatch] Room ${cleanCode} not found in memory`);
      socket.emit('stopwatch:error', { message: `Stopwatch Room "${cleanCode}" not found. Please check your room code.` });
      return;
    }

    if (room.state.players.length >= room.state.settings.maxPlayers && !room.state.players.some(p => p.id === socket.id)) {
      socket.emit('stopwatch:error', { message: 'Room is full.' });
      return;
    }

    if (room.state.phase !== 'LOBBY') {
      socket.emit('stopwatch:error', { message: 'Match already in progress in this room.' });
      return;
    }

    userRoomId = cleanCode;
    socket.join(cleanCode);

    const existingPlayer = room.state.players.find(p => p.id === socket.id);
    if (existingPlayer) {
      if (playerName) existingPlayer.name = playerName;
      if (avatar) existingPlayer.avatar = avatar;
    } else {
      // Assign team evenly if team format
      let assignedTeam: StopwatchTeam = 'none';
      if (room.state.settings.format === 'team') {
        const redCount = room.state.players.filter(p => p.team === 'red').length;
        const blueCount = room.state.players.filter(p => p.team === 'blue').length;
        assignedTeam = redCount <= blueCount ? 'red' : 'blue';
      }

      const newPlayer: StopwatchPlayer = {
        id: socket.id,
        name: playerName || `Player ${room.state.players.length + 1}`,
        avatar: avatar || '🧑',
        isHost: false,
        isReady: false,
        team: assignedTeam,
        score: 0,
        stoppedTime: null,
        difference: null,
        pointsGained: 0,
        isExactMatch: false,
        hasStopped: false
      };

      room.state.players.push(newPlayer);
      broadcastChat(io, cleanCode, `👋 ${newPlayer.name} joined the Stopwatch Arena!`);
    }

    socket.emit('stopwatch:joined', { roomId: cleanCode, gameState: room.state });
    broadcastState(io, cleanCode);
  });

  // 3. Quick Match / Public Random Matchmaking
  socket.on('stopwatch:quickMatch', ({ playerName, avatar, format = 'single' }: { playerName: string; avatar: string; format?: 'single' | 'team' }) => {
    // Find open public lobby
    const openRoom = Array.from(stopwatchRooms.values()).find(
      r => r.state.phase === 'LOBBY' &&
           !r.state.settings.isPrivate &&
           r.state.settings.format === format &&
           r.state.players.length < r.state.settings.maxPlayers
    );

    if (openRoom) {
      const roomId = openRoom.state.roomId;
      userRoomId = roomId;

      let assignedTeam: StopwatchTeam = 'none';
      if (format === 'team') {
        const redCount = openRoom.state.players.filter(p => p.team === 'red').length;
        const blueCount = openRoom.state.players.filter(p => p.team === 'blue').length;
        assignedTeam = redCount <= blueCount ? 'red' : 'blue';
      }

      const newPlayer: StopwatchPlayer = {
        id: socket.id,
        name: playerName || `Player ${openRoom.state.players.length + 1}`,
        avatar: avatar || '🧑',
        isHost: false,
        isReady: false,
        team: assignedTeam,
        score: 0,
        stoppedTime: null,
        difference: null,
        pointsGained: 0,
        isExactMatch: false,
        hasStopped: false
      };

      openRoom.state.players.push(newPlayer);
      socket.join(roomId);
      socket.emit('stopwatch:joined', { roomId, gameState: openRoom.state });
      broadcastState(io, roomId);
      broadcastChat(io, roomId, `⚡ ${newPlayer.name} joined via Quick Match!`);
    } else {
      // Create new public room
      const roomId = generateCode();
      userRoomId = roomId;

      const defaultSettings: StopwatchSettings = {
        rounds: 5,
        format,
        playMode: 'online_random',
        minTarget: 1.0,
        maxTarget: 10.0,
        blindfoldMode: false,
        isPrivate: false,
        maxPlayers: 6
      };

      const hostPlayer: StopwatchPlayer = {
        id: socket.id,
        name: playerName || 'Player 1',
        avatar: avatar || '⏱️',
        isHost: true,
        isReady: true,
        team: format === 'team' ? 'red' : 'none',
        score: 0,
        stoppedTime: null,
        difference: null,
        pointsGained: 0,
        isExactMatch: false,
        hasStopped: false
      };

      const initialGameState: StopwatchGameState = {
        roomId,
        hostId: socket.id,
        phase: 'LOBBY',
        currentRound: 1,
        maxRounds: defaultSettings.rounds,
        targetTime: 5.0,
        timerStartedAt: null,
        settings: defaultSettings,
        players: [hostPlayer],
        teamScores: { red: 0, blue: 0 },
        roundHistory: [],
        countdownTimer: 0
      };

      stopwatchRooms.set(roomId, {
        state: initialGameState,
        botTimeouts: []
      });

      socket.join(roomId);
      socket.emit('stopwatch:created', { roomId, gameState: initialGameState });
      broadcastState(io, roomId);
      broadcastChat(io, roomId, `🌐 Public Match Room ${roomId} created. Waiting for challengers!`);
    }
  });

  // 4. Instant Bot Match (Solo vs AI)
  socket.on('stopwatch:createSoloBot', ({ playerName, avatar, rounds = 5, format = 'single', difficulty = 'medium', blindfoldMode = false }: {
    playerName: string;
    avatar: string;
    rounds?: number;
    format?: 'single' | 'team';
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    blindfoldMode?: boolean;
  }) => {
    const roomId = generateCode();
    userRoomId = roomId;

    const hostPlayer: StopwatchPlayer = {
      id: socket.id,
      name: playerName || 'Player 1',
      avatar: avatar || '👑',
      isHost: true,
      isReady: true,
      team: format === 'team' ? 'red' : 'none',
      score: 0,
      stoppedTime: null,
      difference: null,
      pointsGained: 0,
      isExactMatch: false,
      hasStopped: false
    };

    let botList: StopwatchPlayer[] = [];
    if (format === 'team') {
      // 2v2 format: 1 Human + 1 Ally Bot on Red, 2 Bots on Blue
      botList = [
        {
          id: `bot-${Date.now()}-1`,
          name: 'Atlas (AI Ally)',
          avatar: '🤖',
          isHost: false,
          isReady: true,
          isBot: true,
          botDifficulty: difficulty,
          team: 'red',
          score: 0,
          stoppedTime: null,
          difference: null,
          pointsGained: 0,
          isExactMatch: false,
          hasStopped: false
        },
        {
          id: `bot-${Date.now()}-2`,
          name: 'Vortex (AI Rival)',
          avatar: '⚡',
          isHost: false,
          isReady: true,
          isBot: true,
          botDifficulty: difficulty,
          team: 'blue',
          score: 0,
          stoppedTime: null,
          difference: null,
          pointsGained: 0,
          isExactMatch: false,
          hasStopped: false
        },
        {
          id: `bot-${Date.now()}-3`,
          name: 'Chronos (AI Rival)',
          avatar: '⏱️',
          isHost: false,
          isReady: true,
          isBot: true,
          botDifficulty: difficulty,
          team: 'blue',
          score: 0,
          stoppedTime: null,
          difference: null,
          pointsGained: 0,
          isExactMatch: false,
          hasStopped: false
        }
      ];
    } else {
      // 1v1 Single Duel against AI
      botList = [
        {
          id: `bot-${Date.now()}-1`,
          name: `Chronos (${difficulty.toUpperCase()} AI)`,
          avatar: '🤖',
          isHost: false,
          isReady: true,
          isBot: true,
          botDifficulty: difficulty,
          team: 'none',
          score: 0,
          stoppedTime: null,
          difference: null,
          pointsGained: 0,
          isExactMatch: false,
          hasStopped: false
        }
      ];
    }

    const settings: StopwatchSettings = {
      rounds,
      format,
      playMode: 'bot',
      minTarget: 1.0,
      maxTarget: 10.0,
      blindfoldMode,
      isPrivate: true,
      maxPlayers: format === 'team' ? 4 : 2
    };

    const initialGameState: StopwatchGameState = {
      roomId,
      hostId: socket.id,
      phase: 'LOBBY',
      currentRound: 1,
      maxRounds: rounds,
      targetTime: 5.0,
      timerStartedAt: null,
      settings,
      players: [hostPlayer, ...botList],
      teamScores: { red: 0, blue: 0 },
      roundHistory: [],
      countdownTimer: 0
    };

    stopwatchRooms.set(roomId, {
      state: initialGameState,
      botTimeouts: []
    });

    socket.join(roomId);
    socket.emit('stopwatch:created', { roomId, gameState: initialGameState });
    broadcastState(io, roomId);
    broadcastChat(io, roomId, `🤖 Bot Practice match ready! Click 'START MATCH' to begin!`);
  });

  // 5. Toggle Ready status (Support both stopwatch:ready and stopwatch:toggleReady)
  const handleReadyToggle = () => {
    const room = getRoom();
    if (!room || !userRoomId || room.state.phase !== 'LOBBY') return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      broadcastState(io, userRoomId);
      broadcastChat(io, userRoomId, `${player.name} is ${player.isReady ? '✅ READY' : '⏳ NOT READY'}`);
    }
  };

  socket.on('stopwatch:toggleReady', handleReadyToggle);
  socket.on('stopwatch:ready', handleReadyToggle);

  // 6. Switch Team (Red vs Blue)
  socket.on('stopwatch:switchTeam', ({ targetTeam }: { targetTeam: StopwatchTeam }) => {
    const room = getRoom();
    if (!room || !userRoomId || room.state.phase !== 'LOBBY') return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (player && room.state.settings.format === 'team') {
      player.team = targetTeam;
      broadcastState(io, userRoomId);
    }
  });

  // 7. Add Bot to Room (Host only)
  socket.on('stopwatch:addBot', ({ difficulty = 'medium' }: { difficulty?: 'easy' | 'medium' | 'hard' | 'expert' }) => {
    const room = getRoom();
    if (!room || !userRoomId || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    if (room.state.players.length >= room.state.settings.maxPlayers) {
      socket.emit('stopwatch:error', { message: 'Room reached max capacity.' });
      return;
    }

    const availableNames = BOT_NAMES.filter(n => !room.state.players.some(p => p.name.includes(n)));
    const botName = availableNames[0] || `Bot ${room.state.players.length + 1}`;
    const botAvatar = BOT_AVATARS[room.state.players.length % BOT_AVATARS.length];

    let assignedTeam: StopwatchTeam = 'none';
    if (room.state.settings.format === 'team') {
      const redCount = room.state.players.filter(p => p.team === 'red').length;
      const blueCount = room.state.players.filter(p => p.team === 'blue').length;
      assignedTeam = redCount <= blueCount ? 'red' : 'blue';
    }

    const botPlayer: StopwatchPlayer = {
      id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: botName,
      avatar: botAvatar,
      isHost: false,
      isReady: true,
      isBot: true,
      botDifficulty: difficulty,
      team: assignedTeam,
      score: 0,
      stoppedTime: null,
      difference: null,
      pointsGained: 0,
      isExactMatch: false,
      hasStopped: false
    };

    room.state.players.push(botPlayer);
    broadcastState(io, userRoomId);
    broadcastChat(io, userRoomId, `🤖 Bot ${botName} added to the arena.`);
  });

  // 8. Remove Bot
  socket.on('stopwatch:removeBot', ({ botId }: { botId: string }) => {
    const room = getRoom();
    if (!room || !userRoomId || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    const idx = room.state.players.findIndex(p => p.id === botId && p.isBot);
    if (idx !== -1) {
      const removed = room.state.players.splice(idx, 1)[0];
      broadcastState(io, userRoomId);
      broadcastChat(io, userRoomId, `🤖 Removed bot ${removed.name}.`);
    }
  });

  // 9. Update Settings
  socket.on('stopwatch:updateSettings', (settings: Partial<StopwatchSettings>) => {
    const room = getRoom();
    if (!room || !userRoomId || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    room.state.settings = { ...room.state.settings, ...settings };
    if (settings.rounds) {
      room.state.maxRounds = settings.rounds;
    }
    broadcastState(io, userRoomId);
  });

  // 10. Start Game
  socket.on('stopwatch:startGame', () => {
    const room = getRoom();
    if (!room || !userRoomId || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    if (room.state.players.length < 2) {
      // Auto add an AI bot so solo player can start immediately!
      const botPlayer: StopwatchPlayer = {
        id: `bot-${Date.now()}`,
        name: 'Chronos (AI Rival)',
        avatar: '🤖',
        isHost: false,
        isReady: true,
        isBot: true,
        botDifficulty: 'medium',
        team: room.state.settings.format === 'team' ? 'blue' : 'none',
        score: 0,
        stoppedTime: null,
        difference: null,
        pointsGained: 0,
        isExactMatch: false,
        hasStopped: false
      };
      room.state.players.push(botPlayer);
    }

    const unreadyPlayers = room.state.players.filter(p => !p.isBot && !p.isReady && p.id !== socket.id);
    if (unreadyPlayers.length > 0) {
      socket.emit('stopwatch:error', { message: `Waiting for ${unreadyPlayers.map(p => p.name).join(', ')} to get READY.` });
      return;
    }

    room.state.currentRound = 1;
    room.state.teamScores = { red: 0, blue: 0 };
    room.state.roundHistory = [];
    room.state.players.forEach(p => { 
      p.score = 0; 
      p.stoppedTime = null;
      p.difference = null;
      p.pointsGained = 0;
      p.isExactMatch = false;
      p.hasStopped = false;
      p.isReady = true;
    });

    startStopwatchRound(io, userRoomId);
  });

  // 11. Human Player presses STOP
  socket.on('stopwatch:stopTimer', (data?: { clientElapsed?: number }) => {
    const room = getRoom();
    if (!room || !userRoomId) return;
    const clientElapsed = typeof data?.clientElapsed === 'number' && !isNaN(data.clientElapsed) ? data.clientElapsed : undefined;
    handlePlayerStop(io, userRoomId, socket.id, clientElapsed);
  });

  // 12. Send Chat
  socket.on('stopwatch:sendMessage', ({ text }: { text: string }) => {
    const room = getRoom();
    if (!room || !userRoomId || !text.trim()) return;

    const sender = room.state.players.find(p => p.id === socket.id);
    const msg: StopwatchChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      playerId: socket.id,
      playerName: sender?.name || 'Player',
      avatar: sender?.avatar || '⏱️',
      text: text.trim(),
      timestamp: Date.now()
    };
    io.to(userRoomId).emit('stopwatch:chat', msg);
  });

  // 13. Rematch / Play Again
  socket.on('stopwatch:rematch', () => {
    const room = getRoom();
    if (!room || !userRoomId || room.state.hostId !== socket.id) return;

    room.state.phase = 'LOBBY';
    room.state.currentRound = 1;
    room.state.teamScores = { red: 0, blue: 0 };
    room.state.roundHistory = [];
    room.state.players.forEach(p => {
      p.score = 0;
      p.stoppedTime = null;
      p.difference = null;
      p.pointsGained = 0;
      p.isExactMatch = false;
      p.hasStopped = false;
      p.isReady = p.isHost || !!p.isBot;
    });

    broadcastState(io, userRoomId);
    broadcastChat(io, userRoomId, `🔄 Rematch lobby initialized! Click ready to play again!`);
  });

  // 14. Leave Room / Disconnect
  const handleLeave = () => {
    const room = getRoom();
    if (!room || !userRoomId) return;

    const playerIdx = room.state.players.findIndex(p => p.id === socket.id);
    if (playerIdx !== -1) {
      const removed = room.state.players.splice(playerIdx, 1)[0];
      socket.leave(userRoomId);

      if (room.state.players.length === 0 || room.state.players.every(p => p.isBot)) {
        if (room.timerInterval) clearInterval(room.timerInterval);
        room.botTimeouts.forEach(t => clearTimeout(t));
        stopwatchRooms.delete(userRoomId);
      } else {
        if (removed.isHost) {
          const nextHost = room.state.players.find(p => !p.isBot) || room.state.players[0];
          if (nextHost) {
            nextHost.isHost = true;
            nextHost.isReady = true;
            room.state.hostId = nextHost.id;
          }
        }
        broadcastState(io, userRoomId);
        broadcastChat(io, userRoomId, `🚪 ${removed.name} left the match.`);
      }
    }
    userRoomId = null;
  };

  socket.on('stopwatch:leave', handleLeave);
  socket.on('disconnect', handleLeave);
}
