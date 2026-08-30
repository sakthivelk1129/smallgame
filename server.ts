import express from 'express';
import http from 'http';
import path from 'path';
import crypto from 'crypto';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import {
  GameState,
  Player,
  RoleType,
  RoomSettings,
  GameMode,
  CommunicationMode,
  SpecialEvent,
  ChatMessage,
  EmoteEvent,
  AccusationData,
  GameEventDetails
} from './src/types/game.js';
import { ROLE_DEFINITIONS, getRoleDeckForPlayerCount, SPECIAL_EVENTS } from './src/data/roles.js';
import { setupStopwatchSocketHandlers } from './server/stopwatchEngine.js';
import { setupBullsCowsSocketHandlers } from './server/bullsCowsEngine.js';
import { setupCricketSocketHandlers } from './server/cricketEngine.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = Number(process.env.PORT) || 10000;

// Body parsing middleware for JSON APIs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Backend Master Admin Configuration
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'sakthivelk1129@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'sak123').trim();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'desi_arcade_master_sovereign_secret_key_2026';

function generateAdminToken(email: string): string {
  const timestamp = Date.now();
  const payload = `${email.toLowerCase()}:${timestamp}`;
  const signature = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length < 3) return false;
    const [email, timestampStr, signature] = parts;
    if (email.toLowerCase() !== ADMIN_EMAIL) return false;
    const timestamp = parseInt(timestampStr, 10);
    // Token valid for 7 days
    if (isNaN(timestamp) || Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000) return false;
    const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(`${email}:${timestampStr}`).digest('hex');
    return signature === expectedSig;
  } catch {
    return false;
  }
}

// In-memory Game Rooms store
const rooms = new Map<string, {
  state: GameState;
  privateRoles: Map<string, RoleType>;
  roleAbilities: Map<string, any>;
  timerInterval?: NodeJS.Timeout;
}>();

// In-memory Voice Users store per room
const roomVoiceUsers = new Map<string, Map<string, {
  socketId: string;
  playerId: string;
  playerName: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking: boolean;
  audioLevel?: number;
}>>();

// Helper to generate 6-character room codes (avoiding confusing chars O/0, I/1, S/5)
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRTVWXYZ2346789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const BOT_NAMES = [
  'Arun Kumar', 'Priya Sharma', 'Ravi Shankar', 'Vikram Aditya',
  'Ananya Iyer', 'Rahul Varma', 'Divya Patel', 'Karthik Raja',
  'Meera Nair', 'Suresh Raina', 'Pooja Reddy', 'Siddharth'
];

const BOT_AVATARS = [
  '🦁', '🐯', '🦅', '🐺', '🦊', '🐼', '🦄', '🐉', '🐲', '⚡', '🌟', '🔥'
];

// Anti-Cheat: sanitize state before broadcasting to a specific socket
function getSanitizedGameState(roomId: string, targetSocketId?: string): GameState | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  const { state, privateRoles } = room;

  // Clone players
  const sanitizedPlayers: Player[] = state.players.map((p) => {
    const isTargetPlayer = targetSocketId && p.id === targetSocketId;
    const isRajaRevealed = state.phase !== 'LOBBY' && state.phase !== 'STARTING' && state.phase !== 'ROLE_ASSIGNMENT' && p.id === state.rajaPlayerId;
    const isPoliceRevealed = (state.phase === 'POLICE_TURN' || state.phase === 'ACCUSATION_REVEAL' || state.phase === 'ROUND_SCORING' || state.phase === 'FINAL_RESULTS') && p.id === state.policePlayerId;
    const isRoundScoringOrFinal = state.phase === 'ROUND_SCORING' || state.phase === 'FINAL_RESULTS';

    return {
      ...p,
      // If round ended or it's Raja or it's Police during turn or it's the player themselves, show role; all suspects remain 100% hidden
      currentRole: (isTargetPlayer || isRajaRevealed || isPoliceRevealed || isRoundScoringOrFinal) ? privateRoles.get(p.id) : undefined,
      revealedRole: isRoundScoringOrFinal ? privateRoles.get(p.id) : (isRajaRevealed ? 'RAJA' : (isPoliceRevealed ? 'POLICE' : undefined))
    };
  });

  return {
    ...state,
    players: sanitizedPlayers,
    // expose police ID when in POLICE_TURN, ACCUSATION_REVEAL, ROUND_SCORING, FINAL_RESULTS
    policePlayerId: (state.phase === 'POLICE_TURN' || state.phase === 'ACCUSATION_REVEAL' || state.phase === 'ROUND_SCORING' || state.phase === 'FINAL_RESULTS') ? state.policePlayerId : undefined
  };
}

// Broadcast sanitized state to all players in the room
function broadcastRoomState(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const roomSockets = io.sockets.adapter.rooms.get(roomId);
  if (!roomSockets) return;

  for (const socketId of roomSockets) {
    const sanitized = getSanitizedGameState(roomId, socketId);
    if (sanitized) {
      io.to(socketId).emit('game:stateUpdate', sanitized);
    }
  }
}

// System chat helper
function broadcastSystemChat(roomId: string, text: string) {
  const msg: ChatMessage = {
    id: `sys-${Date.now()}-${Math.random()}`,
    playerId: 'system',
    playerName: 'Court Herald 📜',
    avatar: '👑',
    text,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('chat:message', msg);
}

// Start Game Flow
function startGame(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const { state } = room;
  state.currentRound = 1;
  state.phase = 'STARTING';
  state.timer = 3;
  broadcastRoomState(roomId);
  broadcastSystemChat(roomId, '⚔️ The royal court is convening! The game begins!');

  clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    state.timer--;
    if (state.timer <= 0) {
      clearInterval(room.timerInterval);
      startRound(roomId);
    } else {
      broadcastRoomState(roomId);
    }
  }, 1000);
}

// Start Round
function startRound(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const { state } = room;
  const playerCount = state.players.length;
  const roleDeck = getRoleDeckForPlayerCount(playerCount);

  // Secure shuffle
  const shuffledDeck = [...roleDeck];
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }

  room.privateRoles.clear();
  room.roleAbilities.clear();
  state.lastAccusation = null;
  state.activeEvent = null;
  state.kingsChoicePlayerIds = [];

  state.players.forEach((p, idx) => {
    const assignedRole = shuffledDeck[idx];
    room.privateRoles.set(p.id, assignedRole);
    p.hasUsedAbility = false;
    p.isProtected = false;
    p.roundScoreChange = 0;

    if (assignedRole === 'RAJA') {
      state.rajaPlayerId = p.id;
    }
    if (assignedRole === 'POLICE') {
      state.policePlayerId = p.id;
    }
  });

  // Check for Special Event in Special Mode (Rounds > 1 or 50% on round 1)
  if (state.mode === 'special') {
    const eventKeys = Object.keys(SPECIAL_EVENTS) as SpecialEvent[];
    const chosenEventKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
    state.activeEvent = SPECIAL_EVENTS[chosenEventKey];

    if (chosenEventKey === 'KINGS_CHOICE') {
      // Pick 3 random players as decrees (include thief if possible for fair play)
      const thiefPlayer = state.players.find(p => room.privateRoles.get(p.id) === 'THIEF');
      const otherSuspects = state.players.filter(p => p.id !== state.rajaPlayerId && p.id !== state.policePlayerId && p.id !== thiefPlayer?.id);
      const shuffledOthers = [...otherSuspects].sort(() => Math.random() - 0.5);
      const chosen = [thiefPlayer?.id, shuffledOthers[0]?.id, shuffledOthers[1]?.id].filter(Boolean) as string[];
      state.kingsChoicePlayerIds = chosen.sort(() => Math.random() - 0.5);
    }
  }

  state.phase = 'ROLE_REVEAL';
  state.timer = 6;
  broadcastRoomState(roomId);
  broadcastSystemChat(roomId, `🎴 Round ${state.currentRound} of ${state.maxRounds}: Look at your secret role card!`);
  io.to(roomId).emit('voice:courtHerald', {
    text: `Round ${state.currentRound} of ${state.maxRounds}. Draw your secret royal chits!`
  });

  // Emit private secret role events directly
  state.players.forEach((p) => {
    const role = room.privateRoles.get(p.id)!;
    io.to(p.id).emit('game:secretRole', {
      role,
      definition: ROLE_DEFINITIONS[role]
    });
  });

  clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    state.timer--;
    if (state.timer <= 0) {
      clearInterval(room.timerInterval);
      revealRaja(roomId);
    } else {
      broadcastRoomState(roomId);
    }
  }, 1000);
}

// Reveal Raja Publicly
function revealRaja(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const { state } = room;
  const rajaPlayer = state.players.find(p => p.id === state.rajaPlayerId);

  state.phase = 'RAJA_REVEAL';
  state.timer = 5;
  broadcastRoomState(roomId);
  broadcastSystemChat(roomId, `👑 ALL HAIL! ${rajaPlayer ? rajaPlayer.name : 'The King'} has been proclaimed RAJA!`);
  io.to(roomId).emit('voice:courtHerald', {
    text: `All hail! ${rajaPlayer ? rajaPlayer.name : 'The King'} has been proclaimed Raja! Long live the King!`
  });

  clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    state.timer--;
    if (state.timer <= 0) {
      clearInterval(room.timerInterval);
      startDiscussionAndTurn(roomId);
    } else {
      broadcastRoomState(roomId);
    }
  }, 1000);
}

// Discussion & Police Turn
function startDiscussionAndTurn(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const { state } = room;
  const isSpeedRound = state.activeEvent?.type === 'SPEED_ROUND';
  const duration = isSpeedRound ? 15 : (state.settings.turnDuration || 60);

  state.phase = 'POLICE_TURN';
  state.timer = duration;
  broadcastRoomState(roomId);

  const policePlayer = state.players.find(p => p.id === state.policePlayerId);
  const modeText = state.settings.communicationMode === 'face_to_face'
    ? '👁️ In-Person / Face-to-Face Mode (Chat Clues Muted - Watch Real Expressions!)'
    : '💬 Online Court Debate Mode (Type in Chat, Bluff & Confuse!)';

  broadcastSystemChat(
    roomId,
    `👮 Police is interrogating suspects! Time: ${duration}s. Find the Thief! [${modeText}]`
  );

  io.to(roomId).emit('voice:courtHerald', {
    text: `Huzoor Police, interrogate the suspects! Identify the thief before time runs out!`
  });

  // If Police is a Bot, schedule bot accusation
  if (policePlayer?.isBot) {
    scheduleBotAccusation(roomId, duration);
  }

  // Schedule bots random chat / emotes during discussion (only chat if debate mode)
  scheduleBotInteractions(roomId, duration, state.settings.communicationMode);

  clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    state.timer--;
    if (state.timer <= 0) {
      clearInterval(room.timerInterval);
      // Timeout - auto random accusation or failed
      handlePoliceTimeout(roomId);
    } else {
      broadcastRoomState(roomId);
    }
  }, 1000);
}

function scheduleBotInteractions(roomId: string, duration: number, communicationMode?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const botPlayers = room.state.players.filter(p => p.isBot);
  if (botPlayers.length === 0) return;

  const emotes = ['👀', '🤔', '😂', '🔥', '🥷', '😱', '👑', '💀', '🤫', '😇', '🕵️'];

  // Trigger bot defense claims & banter
  if (communicationMode !== 'face_to_face') {
    const chatDelay = Math.min(3500, duration * 250);
    setTimeout(() => {
      if (!rooms.has(roomId)) return;
      const r = rooms.get(roomId)!;
      const bots = r.state.players.filter(p => p.isBot && p.id !== r.state.rajaPlayerId && p.id !== r.state.policePlayerId);
      if (bots.length === 0) return;

      const randomBot = bots[Math.floor(Math.random() * bots.length)];
      const botRole = r.privateRoles.get(randomBot.id);

      let text = '';
      if (botRole === 'THIEF') {
        const thiefBluffs = [
          'I am the Queen! If you arrest me, you lose 300 pts! 👸',
          'I was with the Raja in the council chamber! 😇',
          'Look at how nervous the player next to me is! 👀',
          'I am innocent, don’t fall for the real Thief’s tricks! 🌾',
          'Arrest someone else, I swear I am just a humble courtier! 👑'
        ];
        text = thiefBluffs[Math.floor(Math.random() * thiefBluffs.length)];
      } else if (botRole === 'RANI') {
        const raniClaims = [
          'Huzoor Police, I am the Queen! Do NOT falsely accuse me! 👸',
          'I am the royal Rani, look at my calm demeanor! 👑',
          'The real Thief is sweating! Check the other suspects! 🔍'
        ];
        text = raniClaims[Math.floor(Math.random() * raniClaims.length)];
      } else {
        const innocentBluffs = [
          'I am a loyal farmer serving the royal court! 🌾',
          'I have been loyal to the Raja since round 1! 🛡️',
          'I noticed some suspicious hesitation when the clock started! 🤔',
          'I swear on the royal throne I am not the Thief! 📜'
        ];
        text = innocentBluffs[Math.floor(Math.random() * innocentBluffs.length)];
      }

      const msg: ChatMessage = {
        id: `bot-${Date.now()}`,
        playerId: randomBot.id,
        playerName: randomBot.name,
        avatar: randomBot.avatar,
        text,
        timestamp: Date.now()
      };
      io.to(roomId).emit('chat:message', msg);
    }, chatDelay);

    // Second staggered bot banter
    if (duration > 20) {
      setTimeout(() => {
        if (!rooms.has(roomId)) return;
        const r = rooms.get(roomId)!;
        const bots = r.state.players.filter(p => p.isBot && p.id !== r.state.rajaPlayerId && p.id !== r.state.policePlayerId);
        if (bots.length > 1) {
          const secondBot = bots[Math.floor(Math.random() * bots.length)];
          const followUps = [
            'Time is ticking, Police! Look at the suspects closely! ⏱️',
            'I suspect the quiet one! Why so silent? 🤫',
            'Watch the eyes, the guilty always blink faster! 👁️'
          ];
          const text = followUps[Math.floor(Math.random() * followUps.length)];
          const msg: ChatMessage = {
            id: `bot-${Date.now()}-2`,
            playerId: secondBot.id,
            playerName: secondBot.name,
            avatar: secondBot.avatar,
            text,
            timestamp: Date.now()
          };
          io.to(roomId).emit('chat:message', msg);
        }
      }, Math.min(8000, duration * 450));
    }
  }

  // Trigger random bot emote (allowed in both modes)
  setTimeout(() => {
    const randomBot = botPlayers[Math.floor(Math.random() * botPlayers.length)];
    if (randomBot && rooms.has(roomId)) {
      const emoteEvt: EmoteEvent = {
        id: `emote-${Date.now()}`,
        playerId: randomBot.id,
        playerName: randomBot.name,
        emote: emotes[Math.floor(Math.random() * emotes.length)],
        timestamp: Date.now()
      };
      io.to(roomId).emit('chat:emote', emoteEvt);
    }
  }, Math.min(6000, duration * 400));
}

function scheduleBotAccusation(roomId: string, duration: number) {
  const delay = Math.max(3000, Math.floor(Math.random() * (duration - 4) * 1000));
  setTimeout(() => {
    const room = rooms.get(roomId);
    if (!room || room.state.phase !== 'POLICE_TURN') return;

    const { state } = room;
    // Bot suspects non-Raja, non-Police players
    const suspects = state.players.filter(p => p.id !== state.rajaPlayerId && p.id !== state.policePlayerId);
    if (suspects.length > 0) {
      // 55% chance to guess thief if available, otherwise random
      const thief = suspects.find(p => room.privateRoles.get(p.id) === 'THIEF');
      const pick = (thief && Math.random() < 0.55) ? thief : suspects[Math.floor(Math.random() * suspects.length)];
      processAccusation(roomId, state.policePlayerId!, pick.id);
    }
  }, delay);
}

function handlePoliceTimeout(roomId: string) {
  const room = rooms.get(roomId);
  if (!room || room.state.phase !== 'POLICE_TURN') return;

  const { state } = room;
  const suspects = state.players.filter(p => p.id !== state.rajaPlayerId && p.id !== state.policePlayerId);
  const randomTarget = suspects[Math.floor(Math.random() * suspects.length)];
  if (randomTarget && state.policePlayerId) {
    broadcastSystemChat(roomId, '⏱️ Time expired! Police was forced to make an emergency accusation!');
    processAccusation(roomId, state.policePlayerId, randomTarget.id);
  }
}

// Process Accusation
function processAccusation(roomId: string, policePlayerId: string, targetPlayerId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  clearInterval(room.timerInterval);

  const { state, privateRoles } = room;
  const policePlayer = state.players.find(p => p.id === policePlayerId);
  const targetPlayer = state.players.find(p => p.id === targetPlayerId);

  if (!policePlayer || !targetPlayer) return;

  const targetRole = privateRoles.get(targetPlayerId) || 'FARMER';
  const isThief = targetRole === 'THIEF';
  const isJoker = targetRole === 'JOKER';

  // Joker Escape check
  let jokerEscaped = false;
  if (isJoker && state.mode === 'special') {
    jokerEscaped = true;
  }

  const accusation: AccusationData = {
    policePlayerId,
    policePlayerName: policePlayer.name,
    targetPlayerId,
    targetPlayerName: targetPlayer.name,
    targetRole,
    isCorrect: isThief,
    jokerEscaped
  };

  state.lastAccusation = accusation;
  state.phase = 'ACCUSATION_REVEAL';
  state.timer = 5;

  broadcastRoomState(roomId);

  if (isThief) {
    broadcastSystemChat(roomId, `🚨 BUSTED! Police caught ${targetPlayer.name} who was indeed the THIEF! 🥷`);
    io.to(roomId).emit('voice:courtHerald', {
      text: `Guilty! The Police has captured the thief red-handed! Justice is served!`
    });
    policePlayer.stats.thievesCaught++;
    policePlayer.stats.correctAccusations++;
  } else if (jokerEscaped) {
    broadcastSystemChat(roomId, `🤡 JOKER ESCAPE! ${targetPlayer.name} fooled the Police and escaped unscathed!`);
    io.to(roomId).emit('voice:courtHerald', {
      text: `The Joker fooled the police and vanished in thin air!`
    });
    policePlayer.stats.wrongAccusations++;
  } else {
    broadcastSystemChat(roomId, `❌ WRONG ACCUSATION! ${targetPlayer.name} was an innocent ${ROLE_DEFINITIONS[targetRole]?.name || targetRole}! The Thief escaped! 🥷`);
    io.to(roomId).emit('voice:courtHerald', {
      text: `Wrong accusation! An innocent was arrested! The thief escaped into the night!`
    });
    policePlayer.stats.wrongAccusations++;
    const thiefPlayer = state.players.find(p => privateRoles.get(p.id) === 'THIEF');
    if (thiefPlayer) {
      thiefPlayer.stats.escapedAsThief++;
    }
  }

  room.timerInterval = setInterval(() => {
    state.timer--;
    if (state.timer <= 0) {
      clearInterval(room.timerInterval);
      calculateAndShowScoring(roomId);
    } else {
      broadcastRoomState(roomId);
    }
  }, 1000);
}

// Calculate Scores & Show Round Breakdown
function calculateAndShowScoring(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const { state, privateRoles } = room;
  const isDoublePoints = state.activeEvent?.type === 'DOUBLE_POINTS';
  const multiplier = isDoublePoints ? 2 : 1;
  const accusation = state.lastAccusation;

  const roundResults: GameState['roundResults'] = [];

  state.players.forEach(p => {
    const role = privateRoles.get(p.id) || 'FARMER';
    const roleDef = ROLE_DEFINITIONS[role];
    let pointsGained = 0;
    let breakdown = '';

    if (role === 'RAJA') {
      pointsGained = (roleDef.basePoints || 1000) * multiplier;
      breakdown = `Royal Sovereign (${pointsGained}pts)`;
      p.stats.timesRaja++;
    } else if (role === 'RANI') {
      pointsGained = (roleDef.basePoints || 500) * multiplier;
      breakdown = `Queen Majesty (${pointsGained}pts)`;
    } else if (role === 'MINISTER') {
      pointsGained = (roleDef.basePoints || 400) * multiplier;
      breakdown = `Royal Counselor (${pointsGained}pts)`;
    } else if (role === 'POLICE') {
      if (accusation?.isCorrect) {
        pointsGained = (roleDef.basePoints || 300) * multiplier;
        breakdown = `Caught Thief! (+${pointsGained}pts)`;
      } else {
        pointsGained = 0;
        breakdown = 'Wrong Accusation (0pts)';
      }
    } else if (role === 'THIEF') {
      if (accusation?.isCorrect) {
        pointsGained = 0;
        breakdown = 'Caught in the Act (0pts)';
      } else {
        const surviveBonus = 100 * multiplier;
        pointsGained = surviveBonus;
        breakdown = `Escaped Police! (+${surviveBonus}pts)`;
      }
    } else {
      // Commoner roles
      let base = (roleDef.basePoints || 50) * multiplier;
      if (accusation && accusation.targetPlayerId === p.id && !accusation.isCorrect) {
        // Falsely accused compensation
        const compensation = (state.activeEvent?.type === 'JOKER_CHAOS' ? 100 : 50) * multiplier;
        base += compensation;
        breakdown = `${roleDef.name} (+${base}pts with +${compensation} falsely accused bounty)`;
      } else {
        breakdown = `${roleDef.name} (+${base}pts)`;
      }
      pointsGained = base;
    }

    // Apply special ability steals if any
    const abilityData = room.roleAbilities.get(p.id);
    if (abilityData?.stealAmount && !p.isProtected) {
      pointsGained -= abilityData.stealAmount;
      breakdown += ` [Stolen -${abilityData.stealAmount}]`;
    }

    p.roundScoreChange = pointsGained;
    p.score += pointsGained;

    roundResults.push({
      playerId: p.id,
      playerName: p.name,
      role,
      pointsGained,
      totalScore: p.score,
      breakdown
    });
  });

  state.roundResults = roundResults;
  state.phase = 'ROUND_SCORING';
  state.timer = 8;
  broadcastRoomState(roomId);

  clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    state.timer--;
    if (state.timer <= 0) {
      clearInterval(room.timerInterval);
      if (state.currentRound >= state.maxRounds) {
        finishGame(roomId);
      } else {
        state.currentRound++;
        startRound(roomId);
      }
    } else {
      broadcastRoomState(roomId);
    }
  }, 1000);
}

// Final Leaderboard & Match Summary
function finishGame(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const { state } = room;
  state.phase = 'FINAL_RESULTS';
  state.timer = 0;

  // Sort players by final score
  state.players.sort((a, b) => b.score - a.score);

  broadcastRoomState(roomId);
  broadcastSystemChat(
    roomId,
    `🏆 Game Complete! Winner is ${state.players[0]?.name} with ${state.players[0]?.score} points! 🎉`
  );
}

// Socket.io Connection Logic
io.on('connection', (socket: Socket) => {
  let currentRoomId: string | null = null;
  let currentPlayerId = socket.id;

  // Mount Stopwatch Precision Game Engine Handlers
  setupStopwatchSocketHandlers(io, socket);

  // Mount Bulls & Cows Game Engine Handlers
  setupBullsCowsSocketHandlers(io, socket);

  // Mount Cricket Card Battle Game Engine Handlers
  setupCricketSocketHandlers(io, socket);

  // Room Creation
  socket.on('room:create', ({ playerName, avatar, settings }: { playerName: string; avatar: string; settings?: Partial<RoomSettings> }) => {
    const roomId = generateRoomCode();
    currentRoomId = roomId;

    const hostPlayer: Player = {
      id: socket.id,
      name: playerName || 'Player 1',
      avatar: avatar || '👑',
      isHost: true,
      isReady: true,
      score: 0,
      roundScoreChange: 0,
      stats: {
        thievesCaught: 0,
        escapedAsThief: 0,
        timesRaja: 0,
        correctAccusations: 0,
        wrongAccusations: 0,
        abilitiesUsed: 0
      }
    };

    const defaultSettings: RoomSettings = {
      mode: 'normal',
      communicationMode: 'debate',
      maxRounds: 5,
      minPlayers: 4,
      maxPlayers: 12,
      turnDuration: 60,
      chatEnabled: true,
      isPrivate: false,
      ...settings
    };

    const initialGameState: GameState = {
      roomId,
      mode: defaultSettings.mode,
      hostId: socket.id,
      players: [hostPlayer],
      currentRound: 1,
      maxRounds: defaultSettings.maxRounds,
      phase: 'LOBBY',
      timer: 0,
      settings: defaultSettings
    };

    rooms.set(roomId, {
      state: initialGameState,
      privateRoles: new Map(),
      roleAbilities: new Map()
    });

    socket.join(roomId);
    socket.emit('room:created', { roomId, gameState: initialGameState });
    broadcastRoomState(roomId);
    broadcastSystemChat(roomId, `👑 Room ${roomId} created by ${hostPlayer.name}. Share code to invite friends!`);
    io.emit('room:publicListUpdated');
  });

  // List Public Rooms for Raja Rani
  socket.on('room:listPublic', () => {
    const publicRooms = Array.from(rooms.values())
      .filter(r => r.state.phase === 'LOBBY' && !r.state.settings.isPrivate && r.state.players.length < r.state.settings.maxPlayers)
      .map(r => ({
        roomId: r.state.roomId,
        hostName: r.state.players.find(p => p.isHost)?.name || 'Host',
        hostAvatar: r.state.players.find(p => p.isHost)?.avatar || '👑',
        playerCount: r.state.players.length,
        maxPlayers: r.state.settings.maxPlayers,
        mode: r.state.mode,
        maxRounds: r.state.maxRounds
      }));
    socket.emit('room:publicList', publicRooms);
  });

  // Quick Match / Join or Create Public Room
  socket.on('room:quickMatch', ({ playerName, avatar, mode }: { playerName: string; avatar: string; mode?: GameMode }) => {
    // 1. Find existing open public room matching criteria
    const openRoom = Array.from(rooms.values()).find(
      r => r.state.phase === 'LOBBY' &&
           !r.state.settings.isPrivate &&
           r.state.players.length < r.state.settings.maxPlayers &&
           (!mode || r.state.mode === mode)
    );

    if (openRoom) {
      // Join existing room
      const roomId = openRoom.state.roomId;
      currentRoomId = roomId;
      const newPlayer: Player = {
        id: socket.id,
        name: playerName || `Player ${openRoom.state.players.length + 1}`,
        avatar: avatar || '🧑',
        isHost: false,
        isReady: false,
        score: 0,
        roundScoreChange: 0,
        stats: {
          thievesCaught: 0,
          escapedAsThief: 0,
          timesRaja: 0,
          correctAccusations: 0,
          wrongAccusations: 0,
          abilitiesUsed: 0
        }
      };

      openRoom.state.players.push(newPlayer);
      socket.join(roomId);
      socket.emit('room:joined', { roomId, gameState: openRoom.state });
      broadcastRoomState(roomId);
      broadcastSystemChat(roomId, `⚡ ${newPlayer.name} joined via Public Quick Match!`);
      io.emit('room:publicListUpdated');
    } else {
      // Create new public room
      const roomId = generateRoomCode();
      currentRoomId = roomId;

      const hostPlayer: Player = {
        id: socket.id,
        name: playerName || 'Player 1',
        avatar: avatar || '👑',
        isHost: true,
        isReady: true,
        score: 0,
        roundScoreChange: 0,
        stats: {
          thievesCaught: 0,
          escapedAsThief: 0,
          timesRaja: 0,
          correctAccusations: 0,
          wrongAccusations: 0,
          abilitiesUsed: 0
        }
      };

      const defaultSettings: RoomSettings = {
        mode: mode || 'normal',
        communicationMode: 'debate',
        maxRounds: 5,
        minPlayers: 4,
        maxPlayers: 8,
        turnDuration: 60,
        chatEnabled: true,
        isPrivate: false
      };

      const initialGameState: GameState = {
        roomId,
        mode: defaultSettings.mode,
        hostId: socket.id,
        players: [hostPlayer],
        currentRound: 1,
        maxRounds: defaultSettings.maxRounds,
        phase: 'LOBBY',
        timer: 0,
        settings: defaultSettings
      };

      rooms.set(roomId, {
        state: initialGameState,
        privateRoles: new Map(),
        roleAbilities: new Map()
      });

      socket.join(roomId);
      socket.emit('room:created', { roomId, gameState: initialGameState });
      broadcastRoomState(roomId);
      broadcastSystemChat(roomId, `🌐 Public Room ${roomId} created! Waiting for other online players to join.`);
      io.emit('room:publicListUpdated');
    }
  });

  // Instant Solo / Bot Match
  socket.on('room:createSoloBot', ({ playerName, avatar, mode, communicationMode }: { playerName: string; avatar: string; mode?: GameMode; communicationMode?: CommunicationMode }) => {
    const roomId = generateRoomCode();
    currentRoomId = roomId;

    const hostPlayer: Player = {
      id: socket.id,
      name: playerName || 'Player 1',
      avatar: avatar || '👑',
      isHost: true,
      isReady: true,
      score: 0,
      roundScoreChange: 0,
      stats: {
        thievesCaught: 0,
        escapedAsThief: 0,
        timesRaja: 0,
        correctAccusations: 0,
        wrongAccusations: 0,
        abilitiesUsed: 0
      }
    };

    const botList: Player[] = [
      {
        id: `bot-${Date.now()}-1`,
        name: 'Arun (AI)',
        avatar: '🦁',
        isHost: false,
        isReady: true,
        isBot: true,
        score: 0,
        roundScoreChange: 0,
        stats: { thievesCaught: 0, escapedAsThief: 0, timesRaja: 0, correctAccusations: 0, wrongAccusations: 0, abilitiesUsed: 0 }
      },
      {
        id: `bot-${Date.now()}-2`,
        name: 'Priya (AI)',
        avatar: '🐯',
        isHost: false,
        isReady: true,
        isBot: true,
        score: 0,
        roundScoreChange: 0,
        stats: { thievesCaught: 0, escapedAsThief: 0, timesRaja: 0, correctAccusations: 0, wrongAccusations: 0, abilitiesUsed: 0 }
      },
      {
        id: `bot-${Date.now()}-3`,
        name: 'Vikram (AI)',
        avatar: '🦅',
        isHost: false,
        isReady: true,
        isBot: true,
        score: 0,
        roundScoreChange: 0,
        stats: { thievesCaught: 0, escapedAsThief: 0, timesRaja: 0, correctAccusations: 0, wrongAccusations: 0, abilitiesUsed: 0 }
      }
    ];

    const defaultSettings: RoomSettings = {
      mode: mode || 'normal',
      communicationMode: communicationMode || 'debate',
      maxRounds: 5,
      minPlayers: 4,
      maxPlayers: 4,
      turnDuration: 45,
      chatEnabled: true,
      isPrivate: true
    };

    const initialGameState: GameState = {
      roomId,
      mode: defaultSettings.mode,
      hostId: socket.id,
      players: [hostPlayer, ...botList],
      currentRound: 1,
      maxRounds: defaultSettings.maxRounds,
      phase: 'LOBBY',
      timer: 0,
      settings: defaultSettings
    };

    rooms.set(roomId, {
      state: initialGameState,
      privateRoles: new Map(),
      roleAbilities: new Map()
    });

    socket.join(roomId);
    socket.emit('room:created', { roomId, gameState: initialGameState });
    broadcastRoomState(roomId);
    broadcastSystemChat(roomId, `🤖 Practice Room started with 3 AI Courtiers. Click 'Start Game' to play!`);
  });

  // Room Joining
  socket.on('room:join', ({ roomId, playerName, avatar }: { roomId: string; playerName: string; avatar: string }) => {
    const upperCode = (roomId || '').trim().toUpperCase();
    console.log(`[RajaRani] Socket ${socket.id} attempting to join room: ${upperCode} as "${playerName}"`);
    const room = rooms.get(upperCode);

    if (!room) {
      console.log(`[RajaRani] Room ${upperCode} not found in memory`);
      socket.emit('room:error', { message: `Room "${upperCode}" not found. Please check your 6-digit code.` });
      return;
    }

    if (room.state.players.length >= room.state.settings.maxPlayers && !room.state.players.some(p => p.id === socket.id)) {
      socket.emit('room:error', { message: 'Room is full (Maximum 12 players).' });
      return;
    }

    if (room.state.phase !== 'LOBBY') {
      socket.emit('room:error', { message: 'A game is already in progress in this room.' });
      return;
    }

    currentRoomId = upperCode;
    socket.join(upperCode);

    const existingPlayer = room.state.players.find(p => p.id === socket.id);
    if (existingPlayer) {
      if (playerName) existingPlayer.name = playerName;
      if (avatar) existingPlayer.avatar = avatar;
    } else {
      const newPlayer: Player = {
        id: socket.id,
        name: playerName || `Player ${room.state.players.length + 1}`,
        avatar: avatar || '🧑',
        isHost: false,
        isReady: false,
        score: 0,
        roundScoreChange: 0,
        stats: {
          thievesCaught: 0,
          escapedAsThief: 0,
          timesRaja: 0,
          correctAccusations: 0,
          wrongAccusations: 0,
          abilitiesUsed: 0
        }
      };
      room.state.players.push(newPlayer);
      broadcastSystemChat(upperCode, `👋 ${newPlayer.name} joined the court room.`);
    }

    socket.emit('room:joined', { roomId: upperCode, gameState: room.state });
    broadcastRoomState(upperCode);
  });

  // Add Bot Player (Host only)
  socket.on('room:addBot', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    if (room.state.players.length >= room.state.settings.maxPlayers) {
      socket.emit('room:error', { message: 'Room is already at max capacity (12 players).' });
      return;
    }

    const availableNames = BOT_NAMES.filter(n => !room.state.players.some(p => p.name.includes(n)));
    const botName = (availableNames[0] || `Courtier ${room.state.players.length + 1}`) + ' (Bot)';
    const botAvatar = BOT_AVATARS[room.state.players.length % BOT_AVATARS.length];

    const botPlayer: Player = {
      id: `bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: botName,
      avatar: botAvatar,
      isHost: false,
      isReady: true,
      isBot: true,
      score: 0,
      roundScoreChange: 0,
      stats: {
        thievesCaught: 0,
        escapedAsThief: 0,
        timesRaja: 0,
        correctAccusations: 0,
        wrongAccusations: 0,
        abilitiesUsed: 0
      }
    };

    room.state.players.push(botPlayer);
    broadcastRoomState(currentRoomId);
    broadcastSystemChat(currentRoomId, `🤖 Bot ${botName} added to the lobby.`);
  });

  // Remove Bot Player (Host only)
  socket.on('room:removeBot', ({ botId }: { botId: string }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    const idx = room.state.players.findIndex(p => p.id === botId && p.isBot);
    if (idx !== -1) {
      const removed = room.state.players.splice(idx, 1)[0];
      broadcastRoomState(currentRoomId);
      broadcastSystemChat(currentRoomId, `🤖 Removed bot ${removed.name}.`);
    }
  });

  // Ready Toggle (Support both room:toggleReady and room:ready)
  const handlePlayerToggleReady = () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      broadcastRoomState(currentRoomId);
      broadcastSystemChat(currentRoomId, `${player.name} is ${player.isReady ? '✅ READY' : '⏳ NOT READY'}`);
    }
  };

  socket.on('room:ready', handlePlayerToggleReady);
  socket.on('room:toggleReady', handlePlayerToggleReady);

  // Host Updates Settings
  socket.on('room:updateSettings', (settings: Partial<RoomSettings>) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    room.state.settings = { ...room.state.settings, ...settings };
    if (settings.mode) {
      room.state.mode = settings.mode;
    }
    if (settings.maxRounds) {
      room.state.maxRounds = settings.maxRounds;
    }

    broadcastRoomState(currentRoomId);
  });

  // Host Kicks Player
  socket.on('room:kick', ({ targetPlayerId }: { targetPlayerId: string }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id || room.state.phase !== 'LOBBY') return;

    const idx = room.state.players.findIndex(p => p.id === targetPlayerId);
    if (idx !== -1) {
      const kicked = room.state.players.splice(idx, 1)[0];
      io.to(targetPlayerId).emit('room:kicked');
      broadcastRoomState(currentRoomId);
      broadcastSystemChat(currentRoomId, `🚪 ${kicked.name} was removed by the host.`);
    }
  });

  // Host Starts Game
  socket.on('game:start', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id) return;

    if (room.state.players.length < 4) {
      socket.emit('room:error', { message: 'Need at least 4 players (or add bots) to start!' });
      return;
    }

    const unreadyRealPlayers = room.state.players.filter(p => !p.isBot && !p.isReady);
    if (unreadyRealPlayers.length > 0) {
      socket.emit('room:error', { message: 'All players must be READY before starting.' });
      return;
    }

    startGame(currentRoomId);
  });

  // Police Accusation Action
  socket.on('police:accuse', ({ targetPlayerId }: { targetPlayerId: string }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state.phase !== 'POLICE_TURN') return;

    // Verify socket is indeed the Police
    const callerRole = room.privateRoles.get(socket.id);
    if (callerRole !== 'POLICE') {
      socket.emit('room:error', { message: 'Only the Police can make an accusation!' });
      return;
    }

    // Kings choice constraint if active
    if (room.state.activeEvent?.type === 'KINGS_CHOICE' && room.state.kingsChoicePlayerIds && room.state.kingsChoicePlayerIds.length > 0) {
      if (!room.state.kingsChoicePlayerIds.includes(targetPlayerId)) {
        socket.emit('room:error', { message: 'King’s Choice is active! You must accuse one of the 3 decreed suspects.' });
        return;
      }
    }

    processAccusation(currentRoomId, socket.id, targetPlayerId);
  });

  // Special Abilities Action (Special Mode)
  socket.on('ability:use', ({ abilityType, targetPlayerId, secondTargetPlayerId }: { abilityType: string; targetPlayerId?: string; secondTargetPlayerId?: string }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state.mode !== 'special') return;

    const callerRole = room.privateRoles.get(socket.id);
    const callerPlayer = room.state.players.find(p => p.id === socket.id);
    if (!callerPlayer || callerPlayer.hasUsedAbility) {
      socket.emit('ability:result', { success: false, message: 'You have already used your ability this round!' });
      return;
    }

    callerPlayer.hasUsedAbility = true;
    callerPlayer.stats.abilitiesUsed++;

    if (callerRole === 'MINISTER' && targetPlayerId) {
      const targetRole = room.privateRoles.get(targetPlayerId);
      const isThief = targetRole === 'THIEF';
      socket.emit('ability:result', {
        success: true,
        title: '🧙 Minister Investigation Report',
        message: isThief ? '🚨 Intel Report: Suspect shows guilty criminal body language!' : '🔎 Intel Report: Suspect is CONFIRMED NOT THE THIEF.'
      });
      broadcastSystemChat(currentRoomId, `🧙 Minister performed a secret investigation.`);
    } else if (callerRole === 'SPY') {
      const innocents = room.state.players.filter(p => room.privateRoles.get(p.id) !== 'THIEF' && p.id !== socket.id);
      const randomInnocent = innocents[Math.floor(Math.random() * innocents.length)];
      socket.emit('ability:result', {
        success: true,
        title: '🕵️ Spy Secret Intercept',
        message: randomInnocent ? `Classified Wiretap: ${randomInnocent.name} is guaranteed innocent!` : 'No additional intel available.'
      });
      broadcastSystemChat(currentRoomId, `🕵️ Spy intercepted a clandestine transmission.`);
    } else if (callerRole === 'RANI' && targetPlayerId) {
      const target = room.state.players.find(p => p.id === targetPlayerId);
      if (target) {
        target.isProtected = true;
      }
      socket.emit('ability:result', {
        success: true,
        title: '👸 Royal Protection Deployed',
        message: `You granted divine royal shield to ${target?.name || 'yourself'}.`
      });
      broadcastSystemChat(currentRoomId, `👸 Rani bestowed royal court protection.`);
    } else if (callerRole === 'RAJA' && targetPlayerId && secondTargetPlayerId) {
      const roleA = room.privateRoles.get(targetPlayerId);
      const roleB = room.privateRoles.get(secondTargetPlayerId);
      const targetA = room.state.players.find(p => p.id === targetPlayerId);
      const targetB = room.state.players.find(p => p.id === secondTargetPlayerId);

      const isASpecial = roleA === 'MINISTER' || roleA === 'POLICE' || roleA === 'SPY' || roleA === 'THIEF';
      const isBSpecial = roleB === 'MINISTER' || roleB === 'POLICE' || roleB === 'SPY' || roleB === 'THIEF';

      socket.emit('ability:result', {
        success: true,
        title: '👑 Royal Decree Assessment',
        message: `${targetA?.name}: ${isASpecial ? 'Power Role' : 'Commoner'} | ${targetB?.name}: ${isBSpecial ? 'Power Role' : 'Commoner'}`
      });
      broadcastSystemChat(currentRoomId, `👑 The King issued a royal decree to assess suspects.`);
    } else if (callerRole === 'THIEF' && targetPlayerId) {
      room.roleAbilities.set(targetPlayerId, { stealAmount: 50 });
      socket.emit('ability:result', {
        success: true,
        title: '🥷 Midnight Heist Targeted',
        message: `Target acquired. You will steal 50 points if you remain undetected!`
      });
    }

    broadcastRoomState(currentRoomId);
  });

  // Chat message
  socket.on('chat:send', ({ text }: { text: string }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || !room.state.settings.chatEnabled) return;
    if (room.state.settings.communicationMode === 'face_to_face') {
      socket.emit('room:error', { message: 'In-person / Face-to-Face mode is active: text clues are muted. Look at each other in person!' });
      return;
    }

    const player = room.state.players.find(p => p.id === socket.id);
    if (!player) return;

    const sanitized = (text || '').trim().substring(0, 140);
    if (!sanitized) return;

    const chatMsg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: socket.id,
      playerName: player.name,
      avatar: player.avatar,
      text: sanitized,
      timestamp: Date.now()
    };

    io.to(currentRoomId).emit('chat:message', chatMsg);
  });

  // Emote reaction
  socket.on('chat:emote', ({ emote }: { emote: string }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (!player) return;

    const emoteEvt: EmoteEvent = {
      id: `emote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: socket.id,
      playerName: player.name,
      emote: emote || '👀',
      timestamp: Date.now()
    };

    io.to(currentRoomId).emit('chat:emote', emoteEvt);
  });

  // Alibi & Defense Proclamation Shout
  socket.on('court:claimAlibi', ({ claimText, claimedRole }: { claimText: string; claimedRole?: string }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || (room.state.phase !== 'POLICE_TURN' && room.state.phase !== 'DISCUSSION')) return;

    const sender = room.state.players.find(p => p.id === socket.id);
    if (!sender) return;

    const alibiEvt = {
      id: `alibi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: sender.id,
      playerName: sender.name,
      avatar: sender.avatar,
      claimedRole: claimedRole || 'Innocent',
      claimText: (claimText || '').trim().substring(0, 140),
      timestamp: Date.now()
    };

    io.to(currentRoomId).emit('court:alibiBroadcast', alibiEvt);
    broadcastSystemChat(currentRoomId, `🗣️ ${sender.name} declared: "${alibiEvt.claimText}"`);
  });

  // Police inspects a suspect (adds heartbeat / visual focus)
  socket.on('police:inspectSuspect', ({ targetPlayerId }: { targetPlayerId: string }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state.phase !== 'POLICE_TURN') return;

    const targetPlayer = room.state.players.find(p => p.id === targetPlayerId);
    if (targetPlayer) {
      io.to(currentRoomId).emit('police:suspectInspected', {
        targetPlayerId,
        targetPlayerName: targetPlayer.name
      });
    }
  });

  // Replay Game (Host only)
  socket.on('game:restart', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id) return;

    room.state.currentRound = 1;
    room.state.phase = 'LOBBY';
    room.state.players.forEach(p => {
      p.score = 0;
      p.roundScoreChange = 0;
      p.isReady = p.isBot ? true : (p.id === room.state.hostId);
    });

    broadcastRoomState(currentRoomId);
    broadcastSystemChat(currentRoomId, '🔄 Game reset! Ready up for a new match!');
  });

  // ==========================================
  // REAL-TIME VOICE & LIVE SPEECH HANDLERS
  // ==========================================

  // Player joins voice channel for a room
  socket.on('voice:joinRoom', ({ roomId, playerId, playerName, avatar, isMuted }: { roomId: string; playerId: string; playerName: string; avatar: string; isMuted: boolean }) => {
    if (!roomId) return;
    if (!roomVoiceUsers.has(roomId)) {
      roomVoiceUsers.set(roomId, new Map());
    }

    const roomVoices = roomVoiceUsers.get(roomId)!;
    const userVoice = {
      socketId: socket.id,
      playerId: playerId || socket.id,
      playerName: playerName || 'Player',
      avatar: avatar || '🧑',
      isMuted: isMuted !== undefined ? isMuted : true,
      isSpeaking: false,
      audioLevel: 0
    };

    roomVoices.set(socket.id, userVoice);

    // Broadcast updated voice users list to the joining player and notify room
    const userList = Array.from(roomVoices.values());
    socket.emit('voice:userList', userList);
    socket.to(roomId).emit('voice:userJoined', userVoice);
  });

  // Voice Mute / Unmute state update
  socket.on('voice:muteState', ({ roomId, playerId, isMuted }: { roomId: string; playerId: string; isMuted: boolean }) => {
    if (!roomId) return;
    const roomVoices = roomVoiceUsers.get(roomId);
    if (roomVoices && roomVoices.has(socket.id)) {
      const u = roomVoices.get(socket.id)!;
      u.isMuted = isMuted;
      if (isMuted) u.isSpeaking = false;
      io.to(roomId).emit('voice:userMuted', { playerId: u.playerId, isMuted });
    }
  });

  // Real-time Voice Activity Detection (Speaking status & Audio waveform level)
  socket.on('voice:speaking', ({ roomId, playerId, isSpeaking, audioLevel }: { roomId: string; playerId: string; isSpeaking: boolean; audioLevel: number }) => {
    if (!roomId) return;
    const roomVoices = roomVoiceUsers.get(roomId);
    if (roomVoices && roomVoices.has(socket.id)) {
      const u = roomVoices.get(socket.id)!;
      u.isSpeaking = isSpeaking;
      u.audioLevel = audioLevel;
      socket.to(roomId).emit('voice:userSpeaking', { playerId: u.playerId, isSpeaking, audioLevel });
    }
  });

  // Real-time Speech-to-Text transcript broadcast
  socket.on('voice:transcript', ({ roomId, transcript }: { roomId: string; transcript: any }) => {
    if (!roomId || !transcript) return;
    socket.to(roomId).emit('voice:transcript', transcript);
  });

  // WebRTC Audio Mesh Signaling forwarder
  socket.on('voice:signal', ({ targetSocketId, targetPlayerId, signal }: { targetSocketId?: string; targetPlayerId?: string; signal: any }) => {
    if (targetSocketId) {
      io.to(targetSocketId).emit('voice:signal', {
        fromSocketId: socket.id,
        signal
      });
    } else if (targetPlayerId && currentRoomId) {
      const roomVoices = roomVoiceUsers.get(currentRoomId);
      if (roomVoices) {
        for (const [sId, vUser] of roomVoices.entries()) {
          if (vUser.playerId === targetPlayerId) {
            io.to(sId).emit('voice:signal', {
              fromSocketId: socket.id,
              fromPlayerId: vUser.playerId,
              signal
            });
            break;
          }
        }
      }
    }
  });

  // Leave Voice room
  socket.on('voice:leaveRoom', ({ roomId, playerId }: { roomId: string; playerId: string }) => {
    if (roomId && roomVoiceUsers.has(roomId)) {
      const roomVoices = roomVoiceUsers.get(roomId)!;
      roomVoices.delete(socket.id);
      socket.to(roomId).emit('voice:userLeft', { playerId: playerId || socket.id });
    }
  });

  // Broadcast presence count on connect and disconnect
  const broadcastLivePresence = () => {
    const totalOnline = io.engine.clientsCount;
    let totalInRooms = 0;
    for (const room of rooms.values()) {
      totalInRooms += room.state.players.filter(p => !p.isBot).length;
    }
    io.emit('presence:stats', {
      onlineUsers: totalOnline,
      activeRooms: rooms.size,
      playersInGame: totalInRooms,
      timestamp: Date.now()
    });
  };

  broadcastLivePresence();

  // Leave room or disconnect
  const handleLeave = () => {
    broadcastLivePresence();
    if (!currentRoomId) return;

    // Clean up voice state
    if (roomVoiceUsers.has(currentRoomId)) {
      const roomVoices = roomVoiceUsers.get(currentRoomId)!;
      roomVoices.delete(socket.id);
      socket.to(currentRoomId).emit('voice:userLeft', { playerId: socket.id });
    }

    const room = rooms.get(currentRoomId);
    if (!room) return;

    const leavingPlayerIdx = room.state.players.findIndex(p => p.id === socket.id);
    if (leavingPlayerIdx !== -1) {
      const leavingPlayer = room.state.players.splice(leavingPlayerIdx, 1)[0];
      broadcastSystemChat(currentRoomId, `👋 ${leavingPlayer.name} left the room.`);

      // If no players remain, clean up room
      if (room.state.players.length === 0 || room.state.players.every(p => p.isBot)) {
        clearInterval(room.timerInterval);
        rooms.delete(currentRoomId);
        return;
      }

      // Reassign host if host left
      if (leavingPlayer.isHost) {
        const nextRealPlayer = room.state.players.find(p => !p.isBot) || room.state.players[0];
        if (nextRealPlayer) {
          nextRealPlayer.isHost = true;
          room.state.hostId = nextRealPlayer.id;
          broadcastSystemChat(currentRoomId, `👑 ${nextRealPlayer.name} is now the room host.`);
        }
      }

      broadcastRoomState(currentRoomId);
    }
  };

  socket.on('room:leave', handleLeave);
  socket.on('disconnect', handleLeave);
});

// Master Admin Authentication & Session Verification Endpoints
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPassword = String(password).trim();

  if (cleanEmail === ADMIN_EMAIL && cleanPassword === ADMIN_PASSWORD) {
    const token = generateAdminToken(cleanEmail);
    console.log(`[AdminAuth] Master Admin authenticated successfully: ${cleanEmail}`);
    return res.json({
      success: true,
      token,
      email: cleanEmail,
      name: 'Sakthivel K',
      message: 'Master Admin authenticated successfully.'
    });
  }

  console.warn(`[AdminAuth] Failed login attempt for email: ${cleanEmail}`);
  return res.status(401).json({
    success: false,
    message: 'Authentication failed: Invalid Admin Email or Master Password.'
  });
});

app.post('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = req.body?.token || tokenFromHeader;

  if (!token || typeof token !== 'string') {
    return res.json({ success: false, isAdmin: false, message: 'No token provided.' });
  }

  const isValid = verifyAdminToken(token);
  if (isValid) {
    return res.json({
      success: true,
      isAdmin: true,
      email: ADMIN_EMAIL,
      name: 'Sakthivel K'
    });
  }

  return res.json({
    success: false,
    isAdmin: false,
    message: 'Invalid or expired admin session token.'
  });
});

app.get('/api/admin/status', (req, res) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = (req.query.token as string) || tokenFromHeader;

  if (!token || typeof token !== 'string') {
    return res.json({ isAdmin: false });
  }

  const isValid = verifyAdminToken(token);
  return res.json({
    isAdmin: isValid,
    email: isValid ? ADMIN_EMAIL : undefined,
    name: isValid ? 'Sakthivel K' : undefined
  });
});

// Live Stats endpoint for Admin dashboard
app.get('/api/stats', (req, res) => {
  let totalPlayersInCourt = 0;
  const roomSummaries: Array<{ id: string; players: number; mode: string; phase: string }> = [];

  for (const [code, r] of rooms.entries()) {
    const realCount = r.state.players.filter(p => !p.isBot).length;
    totalPlayersInCourt += realCount;
    roomSummaries.push({
      id: code,
      players: r.state.players.length,
      mode: r.state.mode,
      phase: r.state.phase
    });
  }

  res.json({
    status: 'ok',
    onlineUsers: Math.max(io.engine.clientsCount, 1),
    activeRooms: rooms.size,
    courtPlayers: totalPlayersInCourt,
    rooms: roomSummaries,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: Date.now()
  });
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    onlineUsers: io.engine.clientsCount,
    activeRooms: rooms.size,
    timestamp: Date.now()
  });
});

// Vite Middleware setup
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`👑 Raja Rani game server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
