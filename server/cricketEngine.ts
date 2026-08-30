import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  CricketCard,
  CricketGameState,
  CricketPlayerState,
  CricketRoomSettings,
  CricketGameMode,
  CricketTableCard,
  CricketChatMessage,
  StatKey
} from '../src/types/cricket.js';
import {
  getCricketDatabase,
  sampleUniqueCricketCards
} from '../src/data/cricketDatabase.js';

interface CricketInternalPlayerData {
  deck: CricketCard[];
  specialAbilityUsed: boolean;
}

interface CricketRoomData {
  state: CricketGameState;
  playerDecks: Map<string, CricketCard[]>; // playerId -> full deck (server authoritative)
  activePotCards: CricketCard[]; // accumulated cards on table & ties
  roundTimer?: NodeJS.Timeout;
  botTimeouts?: NodeJS.Timeout[];
  isProcessingRoundEnd?: boolean;
}

const cricketRooms = new Map<string, CricketRoomData>();

function generateCricketRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CRIC';
  for (let i = 0; i < 2; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const BOT_NAMES = [
  'Arun (Bot)', 'Karthik (Bot)', 'Vijay (Bot)', 'Priya (Bot)', 
  'David (Bot)', 'Stokes (Bot)', 'Rashid (Bot)', 'Bumrah (Bot)'
];
const BOT_AVATARS = ['🏏', '🏆', '🦁', '⚡', '🔥', '👑', '🎯', '🚀'];

/**
 * Sanitize state before sending to a specific client
 * Prevents players from peeking at opponents' future hidden decks
 */
function getSanitizedCricketState(roomId: string, requestingPlayerId?: string): CricketGameState | null {
  const room = cricketRooms.get(roomId);
  if (!room) return null;

  const { state, playerDecks } = room;

  const sanitizedPlayers: CricketPlayerState[] = state.players.map(p => {
    const deck = playerDecks.get(p.id) || [];
    const isOwner = requestingPlayerId && p.id === requestingPlayerId;

    return {
      ...p,
      deckCount: deck.length,
      // Only the card owner can see their own top card (or if round already revealed it)
      topCard: isOwner ? deck[0] : undefined
    };
  });

  return {
    ...state,
    players: sanitizedPlayers
  };
}

function broadcastCricketState(io: SocketIOServer, roomId: string) {
  const room = cricketRooms.get(roomId);
  if (!room) return;

  // Send tailored sanitized state to each connected socket in the room
  const sockets = io.sockets.adapter.rooms.get(roomId);
  if (sockets) {
    for (const socketId of sockets) {
      const clientState = getSanitizedCricketState(roomId, socketId);
      if (clientState) {
        io.to(socketId).emit('cricket:stateUpdate', clientState);
      }
    }
  }
}

function sendSystemMessage(io: SocketIOServer, roomId: string, text: string) {
  const msg: CricketChatMessage = {
    id: `sys-${Date.now()}-${Math.random()}`,
    playerId: 'SYSTEM',
    playerName: 'Umpire',
    avatar: '🏏',
    text,
    timestamp: Date.now(),
    isSystem: true
  };
  io.to(roomId).emit('cricket:chatMessage', msg);
}

/**
 * Bot Turn Automation
 */
function handleBotTurns(io: SocketIOServer, roomId: string) {
  const room = cricketRooms.get(roomId);
  if (!room || room.state.phase === 'FINAL_PODIUM' || room.state.phase === 'ROUND_SUMMARY') return;

  const { state, playerDecks } = room;

  // 1. If in STAT_SELECTION phase and starter is a bot
  if (state.phase === 'STAT_SELECTION' && !state.statLocked) {
    const starter = state.players.find(p => p.id === state.starterId);
    if (starter?.isBot) {
      const timeout = setTimeout(() => {
        const deck = playerDecks.get(starter.id) || [];
        const topCard = deck[0];
        if (!topCard) return;

        // Choose best stat on bot's top card
        const candidateStats: { key: StatKey; score: number }[] = [
          { key: 'rank', score: 1000 - topCard.rank }, // lower rank is better score
          { key: 'batting', score: topCard.batting },
          { key: 'strikeRate', score: topCard.strikeRate },
          { key: 'power', score: topCard.power },
          { key: 'consistency', score: topCard.consistency },
          { key: 'bowling', score: topCard.bowling },
          { key: 'pace', score: topCard.pace },
          { key: 'accuracy', score: topCard.accuracy },
          { key: 'wicketAbility', score: topCard.wicketAbility }
        ];

        candidateStats.sort((a, b) => b.score - a.score);
        const bestStat = candidateStats[0].key;

        serverSelectStat(io, roomId, starter.id, bestStat);
      }, 1500);

      room.botTimeouts?.push(timeout);
    }
  }

  // 2. If in REVEAL_COMPARE phase, bots auto-play top card
  if (state.phase === 'REVEAL_COMPARE') {
    state.players.forEach(p => {
      if (p.isBot && !p.eliminated) {
        const alreadyPlayed = state.tableCards.some(tc => tc.playerId === p.id);
        if (!alreadyPlayed) {
          const delay = 800 + Math.random() * 1200;
          const timeout = setTimeout(() => {
            serverPlayCard(io, roomId, p.id);
          }, delay);
          room.botTimeouts?.push(timeout);
        }
      }
    });
  }
}

/**
 * Server-authoritative Stat Selection
 */
function serverSelectStat(io: SocketIOServer, roomId: string, playerId: string, statKey: StatKey) {
  const room = cricketRooms.get(roomId);
  if (!room) return;

  const { state, playerDecks } = room;
  if (state.phase !== 'STAT_SELECTION' || state.statLocked) return;
  if (state.starterId !== playerId) return;

  const starter = state.players.find(p => p.id === playerId);
  if (!starter) return;

  const starterDeck = playerDecks.get(playerId) || [];
  const topCard = starterDeck[0];
  if (!topCard) return;

  state.selectedStat = statKey;
  state.statLocked = true;
  state.phase = 'REVEAL_COMPARE';
  state.timeRemaining = 10;

  // Track stat usage
  starter.favouriteStat = statKey;
  starter.statUsageCount = starter.statUsageCount || {};
  starter.statUsageCount[statKey] = (starter.statUsageCount[statKey] || 0) + 1;

  // Starter automatically places their top card
  const statVal = statKey === 'rank' ? topCard.rank : (topCard[statKey] as number);
  state.tableCards = [{
    playerId: starter.id,
    playerName: starter.name,
    avatar: starter.avatar,
    card: topCard,
    statValue: statVal
  }];

  sendSystemMessage(io, roomId, `🎯 ${starter.name} selected ${statKey.toUpperCase()}! Reveal your cards!`);
  broadcastCricketState(io, roomId);

  // Clear previous timer and start 10s reveal timer
  if (room.roundTimer) clearInterval(room.roundTimer);

  room.roundTimer = setInterval(() => {
    state.timeRemaining--;
    if (state.timeRemaining <= 0) {
      if (room.roundTimer) clearInterval(room.roundTimer);
      // Auto-play cards for any player who hasn't played
      state.players.forEach(p => {
        if (!p.eliminated && !state.tableCards.some(tc => tc.playerId === p.id)) {
          serverPlayCard(io, roomId, p.id);
        }
      });
    }
  }, 1000);

  handleBotTurns(io, roomId);
}

/**
 * Server-authoritative Play Card
 */
function serverPlayCard(io: SocketIOServer, roomId: string, playerId: string) {
  const room = cricketRooms.get(roomId);
  if (!room) return;

  const { state, playerDecks } = room;
  if (state.phase !== 'REVEAL_COMPARE' && state.phase !== 'TIE_BREAKER') return;
  if (!state.selectedStat) return;

  const player = state.players.find(p => p.id === playerId);
  if (!player || player.eliminated) return;

  if (state.tableCards.some(tc => tc.playerId === playerId)) return;

  const deck = playerDecks.get(playerId) || [];
  const topCard = deck[0];
  if (!topCard) return;

  const statKey = state.selectedStat;
  let statVal = statKey === 'rank' ? topCard.rank : (topCard[statKey] as number);

  // Special ability check if enabled
  if (state.settings.ruleVariant === 'SPECIAL_ABILITIES' && topCard.specialAbility === 'STAT_BOOST' && statKey !== 'rank') {
    statVal = Math.min(100, statVal + 5);
  }

  state.tableCards.push({
    playerId: player.id,
    playerName: player.name,
    avatar: player.avatar,
    card: topCard,
    statValue: statVal
  });

  broadcastCricketState(io, roomId);

  // Check if all active non-eliminated players have played
  const activePlayers = state.players.filter(p => !p.eliminated && (playerDecks.get(p.id)?.length || 0) > 0);
  if (state.tableCards.length >= activePlayers.length) {
    if (room.roundTimer) clearInterval(room.roundTimer);
    evaluateRoundWinner(io, roomId);
  }
}

/**
 * Evaluates round results, handles ties, transfers cards to winner's bottom deck
 */
function evaluateRoundWinner(io: SocketIOServer, roomId: string) {
  const room = cricketRooms.get(roomId);
  if (!room || room.isProcessingRoundEnd) return;

  room.isProcessingRoundEnd = true;
  const { state, playerDecks } = room;
  const statKey = state.selectedStat!;

  // Sort played cards: For rank, lowest wins; for other stats, highest wins
  const sortedTable = [...state.tableCards].sort((a, b) => {
    if (statKey === 'rank') {
      return a.statValue - b.statValue; // lowest rank #1 wins
    }
    return b.statValue - a.statValue; // highest stat wins
  });

  const bestEntry = sortedTable[0];
  if (!bestEntry) {
    room.isProcessingRoundEnd = false;
    return;
  }

  // Check for ties at the top
  const tiedEntries = sortedTable.filter(e => e.statValue === bestEntry.statValue);

  if (tiedEntries.length > 1) {
    // ⚔ TIE DETECTED!
    state.isTie = true;
    state.tiedPlayerIds = tiedEntries.map(e => e.playerId);

    // Collect current played cards into pot
    state.tableCards.forEach(tc => {
      const pDeck = playerDecks.get(tc.playerId);
      if (pDeck && pDeck.length > 0) {
        const removed = pDeck.shift(); // remove top card
        if (removed) room.activePotCards.push(removed);
      }
    });

    state.accumulatedPotCardsCount = room.activePotCards.length;
    sendSystemMessage(io, roomId, `⚡ TIE between ${tiedEntries.map(e => e.playerName).join(' & ')} with ${statKey.toUpperCase()}: ${bestEntry.statValue}! Revealing next card!`);
    
    // Clear table for tied players to play next card
    state.tableCards = [];
    state.phase = 'REVEAL_COMPARE';
    state.timeRemaining = 8;
    room.isProcessingRoundEnd = false;

    broadcastCricketState(io, roomId);
    handleBotTurns(io, roomId);
    return;
  }

  // 🏆 Clear Winner Found!
  const winnerId = bestEntry.playerId;
  const winner = state.players.find(p => p.id === winnerId);
  state.roundWinnerId = winnerId;
  state.roundWinnerName = winner?.name || 'Winner';
  state.winningStatValue = bestEntry.statValue;
  state.isTie = false;
  state.tiedPlayerIds = [];

  // Remove top card from all players who played
  const roundCardsWon: CricketCard[] = [...room.activePotCards];
  state.tableCards.forEach(tc => {
    tc.isWinner = tc.playerId === winnerId;
    const pDeck = playerDecks.get(tc.playerId);
    if (pDeck && pDeck.length > 0) {
      const removed = pDeck.shift();
      if (removed) roundCardsWon.push(removed);
    }
  });

  room.activePotCards = [];
  state.accumulatedPotCardsCount = 0;

  // Add all won cards to the bottom of the winner's deck
  const winnerDeck = playerDecks.get(winnerId);
  if (winnerDeck) {
    winnerDeck.push(...roundCardsWon);
  }

  // Update winner stats
  if (winner) {
    winner.roundsWon++;
    winner.cardsWon += roundCardsWon.length;
    winner.currentStreak++;
    if (winner.currentStreak > winner.longestStreak) {
      winner.longestStreak = winner.currentStreak;
    }
  }

  // Reset streaks for other players
  state.players.forEach(p => {
    if (p.id !== winnerId) p.currentStreak = 0;
  });

  // Check for eliminations (0 cards remaining)
  state.players.forEach(p => {
    const deck = playerDecks.get(p.id) || [];
    if (deck.length === 0 && !p.eliminated) {
      p.eliminated = true;
      const remainingActive = state.players.filter(pl => (playerDecks.get(pl.id)?.length || 0) > 0).length;
      p.eliminationRank = remainingActive + 1;
      sendSystemMessage(io, roomId, `❌ ${p.name} has been eliminated!`);
    }
  });

  state.phase = 'ROUND_SUMMARY';
  sendSystemMessage(io, roomId, `🏆 ${winner?.name} won Round ${state.currentRound} with ${bestEntry.card.playerName} (${statKey.toUpperCase()}: ${bestEntry.statValue})! +${roundCardsWon.length} cards collected!`);
  broadcastCricketState(io, roomId);

  // Check Game End Conditions
  const activeRemainingPlayers = state.players.filter(p => !p.eliminated && (playerDecks.get(p.id)?.length || 0) > 0);
  const isLastCardMode = state.settings.gameMode === 'ELIMINATION';
  const isFixedRoundsDone = state.settings.gameMode === 'FIXED_ROUNDS' && state.currentRound >= state.maxRounds;

  const isGameOver = activeRemainingPlayers.length <= 1 || isFixedRoundsDone;

  setTimeout(() => {
    if (isGameOver) {
      endCricketGame(io, roomId);
    } else {
      // Advance to next round: winner becomes the starting player!
      state.currentRound++;
      state.starterId = winnerId;
      state.starterName = winner?.name;
      state.selectedStat = undefined;
      state.statLocked = false;
      state.tableCards = [];
      state.phase = 'STAT_SELECTION';
      state.timeRemaining = 15;
      room.isProcessingRoundEnd = false;

      broadcastCricketState(io, roomId);

      // Start 15s stat selection timer
      if (room.roundTimer) clearInterval(room.roundTimer);
      room.roundTimer = setInterval(() => {
        state.timeRemaining--;
        if (state.timeRemaining <= 0) {
          if (room.roundTimer) clearInterval(room.roundTimer);
          // Auto-select best stat for starter
          const sDeck = playerDecks.get(state.starterId) || [];
          const sTop = sDeck[0];
          if (sTop) {
            const stats: StatKey[] = ['power', 'batting', 'strikeRate', 'bowling', 'pace', 'wicketAbility', 'rank'];
            serverSelectStat(io, roomId, state.starterId, stats[0]);
          }
        }
      }, 1000);

      handleBotTurns(io, roomId);
    }
  }, 4000);
}

/**
 * End Game and generate Final Podium
 */
function endCricketGame(io: SocketIOServer, roomId: string) {
  const room = cricketRooms.get(roomId);
  if (!room) return;

  const { state, playerDecks } = room;
  state.phase = 'FINAL_PODIUM';

  // Calculate final ranks based on cards left, then rounds won
  const rankings = state.players.map(p => ({
    playerId: p.id,
    name: p.name,
    avatar: p.avatar,
    cardsLeft: playerDecks.get(p.id)?.length || 0,
    roundsWon: p.roundsWon,
    longestStreak: p.longestStreak,
    bestStat: p.favouriteStat
  })).sort((a, b) => {
    if (b.cardsLeft !== a.cardsLeft) return b.cardsLeft - a.cardsLeft;
    return b.roundsWon - a.roundsWon;
  }).map((entry, idx) => ({
    ...entry,
    rank: idx + 1
  }));

  state.finalRankings = rankings;
  const champ = rankings[0];
  sendSystemMessage(io, roomId, `🎉 MATCH OVER! 🏆 CHAMPION: ${champ.name} with ${champ.cardsLeft} cards collected!`);
  broadcastCricketState(io, roomId);
}

/**
 * Start Match & Deal Unique Cards
 */
function startCricketMatch(io: SocketIOServer, roomId: string) {
  const room = cricketRooms.get(roomId);
  if (!room) return;

  const { state, playerDecks } = room;
  const cardsPerPlayer = state.settings.cardsPerPlayer || 10;
  const totalCardsNeeded = state.players.length * cardsPerPlayer;

  // Sample unique cards without replacement from 1,000 cards global pool
  const dealtCards = sampleUniqueCricketCards(totalCardsNeeded);

  // Distribute unique cards to each player's deck
  state.players.forEach((p, idx) => {
    const pCards = dealtCards.slice(idx * cardsPerPlayer, (idx + 1) * cardsPerPlayer);
    playerDecks.set(p.id, pCards);
    p.deckCount = pCards.length;
    p.roundsWon = 0;
    p.cardsWon = 0;
    p.currentStreak = 0;
    p.longestStreak = 0;
    p.eliminated = false;
    p.hasShuffled = false;
  });

  // Randomly choose first starting player
  const randomIndex = Math.floor(Math.random() * state.players.length);
  const firstStarter = state.players[randomIndex];
  state.starterId = firstStarter.id;
  state.starterName = firstStarter.name;

  state.currentRound = 1;
  state.tableCards = [];
  state.activePotCards = [];
  state.phase = 'PRE_GAME_SHUFFLE';
  state.timeRemaining = 8;

  sendSystemMessage(io, roomId, `🎲 Starting match! Dealing ${cardsPerPlayer} unique cards each from 1,000 player pool. ${firstStarter.name} will start Round 1!`);
  broadcastCricketState(io, roomId);

  // Allow 8s for pre-game shuffle, then transition to STAT_SELECTION
  setTimeout(() => {
    if (state.phase === 'PRE_GAME_SHUFFLE') {
      state.phase = 'STAT_SELECTION';
      state.timeRemaining = 15;
      broadcastCricketState(io, roomId);

      if (room.roundTimer) clearInterval(room.roundTimer);
      room.roundTimer = setInterval(() => {
        state.timeRemaining--;
        if (state.timeRemaining <= 0) {
          if (room.roundTimer) clearInterval(room.roundTimer);
          const sDeck = playerDecks.get(state.starterId) || [];
          const sTop = sDeck[0];
          if (sTop) {
            serverSelectStat(io, roomId, state.starterId, 'batting');
          }
        }
      }, 1000);

      handleBotTurns(io, roomId);
    }
  }, 8000);
}

/**
 * Socket.IO handlers for Cricket Card Battle
 */
export function setupCricketSocketHandlers(io: SocketIOServer, socket: Socket) {
  let currentRoomId: string | null = null;

  // Create Room
  socket.on('cricket:createRoom', ({
    playerName,
    avatar,
    settings,
    isSinglePlayer
  }: {
    playerName: string;
    avatar: string;
    settings?: Partial<CricketRoomSettings>;
    isSinglePlayer?: boolean;
  }) => {
    const roomId = generateCricketRoomCode();
    currentRoomId = roomId;

    const hostPlayer: CricketPlayerState = {
      id: socket.id,
      name: playerName || 'Captain',
      avatar: avatar || '🏏',
      isHost: true,
      isReady: true,
      deckCount: 0,
      eliminated: false,
      roundsWon: 0,
      cardsWon: 0,
      currentStreak: 0,
      longestStreak: 0
    };

    const defaultSettings: CricketRoomSettings = {
      maxPlayers: 8,
      cardsPerPlayer: 10,
      gameMode: 'FIXED_ROUNDS',
      maxRounds: 20,
      ruleVariant: 'CLASSIC',
      showNextCard: false,
      timeLimitPerTurn: 15,
      ...settings
    };

    const initialGameState: CricketGameState = {
      roomId,
      isSinglePlayer: !!isSinglePlayer,
      phase: 'LOBBY',
      currentRound: 1,
      maxRounds: defaultSettings.maxRounds,
      cardsPerPlayer: defaultSettings.cardsPerPlayer,
      settings: defaultSettings,
      hostId: socket.id,
      starterId: socket.id,
      starterName: hostPlayer.name,
      statLocked: false,
      timeRemaining: 15,
      players: [hostPlayer],
      tableCards: [],
      accumulatedPotCardsCount: 0
    };

    cricketRooms.set(roomId, {
      state: initialGameState,
      playerDecks: new Map(),
      activePotCards: []
    });

    socket.join(roomId);
    socket.emit('cricket:roomCreated', {
      roomId,
      gameState: getSanitizedCricketState(roomId, socket.id)
    });
    io.emit('cricket:publicRoomsListUpdated');
  });

  // List Public Cricket Rooms
  socket.on('cricket:listPublicRooms', () => {
    const publicRooms = Array.from(cricketRooms.values())
      .filter(r => r.state.phase === 'LOBBY' && !r.state.settings.isPrivate && !r.state.isSinglePlayer && r.state.players.length < r.state.settings.maxPlayers)
      .map(r => ({
        roomId: r.state.roomId,
        hostName: r.state.players.find(p => p.isHost)?.name || 'Captain',
        hostAvatar: r.state.players.find(p => p.isHost)?.avatar || '🏏',
        playerCount: r.state.players.length,
        maxPlayers: r.state.settings.maxPlayers,
        gameMode: r.state.settings.gameMode,
        maxRounds: r.state.settings.maxRounds,
        cardsPerPlayer: r.state.settings.cardsPerPlayer
      }));
    socket.emit('cricket:publicRoomsList', publicRooms);
  });

  // Quick Match / Auto Matchmaking for Cricket Battle
  socket.on('cricket:quickMatch', ({
    playerName,
    avatar,
    gameMode
  }: {
    playerName: string;
    avatar: string;
    gameMode?: CricketGameMode;
  }) => {
    // 1. Check for open public room
    const openRoom = Array.from(cricketRooms.values()).find(
      r => r.state.phase === 'LOBBY' &&
           !r.state.settings.isPrivate &&
           !r.state.isSinglePlayer &&
           r.state.players.length < r.state.settings.maxPlayers &&
           (!gameMode || r.state.settings.gameMode === gameMode)
    );

    if (openRoom) {
      const roomId = openRoom.state.roomId;
      currentRoomId = roomId;
      socket.join(roomId);

      const newPlayer: CricketPlayerState = {
        id: socket.id,
        name: playerName || `Player ${openRoom.state.players.length + 1}`,
        avatar: avatar || '🏏',
        isHost: false,
        isReady: true,
        deckCount: 0,
        eliminated: false,
        roundsWon: 0,
        cardsWon: 0,
        currentStreak: 0,
        longestStreak: 0
      };

      openRoom.state.players.push(newPlayer);
      sendSystemMessage(io, roomId, `⚡ ${newPlayer.name} joined via Public Quick Match!`);

      socket.emit('cricket:roomJoined', {
        roomId,
        gameState: getSanitizedCricketState(roomId, socket.id)
      });
      broadcastCricketState(io, roomId);
      io.emit('cricket:publicRoomsListUpdated');
    } else {
      // Create new public room
      const roomId = generateCricketRoomCode();
      currentRoomId = roomId;

      const hostPlayer: CricketPlayerState = {
        id: socket.id,
        name: playerName || 'Captain',
        avatar: avatar || '🏏',
        isHost: true,
        isReady: true,
        deckCount: 0,
        eliminated: false,
        roundsWon: 0,
        cardsWon: 0,
        currentStreak: 0,
        longestStreak: 0
      };

      const defaultSettings: CricketRoomSettings = {
        maxPlayers: 6,
        cardsPerPlayer: 10,
        gameMode: gameMode || 'FIXED_ROUNDS',
        maxRounds: 20,
        ruleVariant: 'CLASSIC',
        showNextCard: false,
        timeLimitPerTurn: 15,
        isPrivate: false
      };

      const initialGameState: CricketGameState = {
        roomId,
        isSinglePlayer: false,
        phase: 'LOBBY',
        currentRound: 1,
        maxRounds: defaultSettings.maxRounds,
        cardsPerPlayer: defaultSettings.cardsPerPlayer,
        settings: defaultSettings,
        hostId: socket.id,
        starterId: socket.id,
        starterName: hostPlayer.name,
        statLocked: false,
        timeRemaining: 15,
        players: [hostPlayer],
        tableCards: [],
        accumulatedPotCardsCount: 0
      };

      cricketRooms.set(roomId, {
        state: initialGameState,
        playerDecks: new Map(),
        activePotCards: []
      });

      socket.join(roomId);
      socket.emit('cricket:roomCreated', {
        roomId,
        gameState: getSanitizedCricketState(roomId, socket.id)
      });
      sendSystemMessage(io, roomId, `🌐 Public Cricket Room created! Waiting for opponents.`);
      io.emit('cricket:publicRoomsListUpdated');
    }
  });

  // Solo Bot Match for Cricket Battle
  socket.on('cricket:createSoloBot', ({
    playerName,
    avatar,
    cardsPerPlayer = 10,
    maxRounds = 15
  }: {
    playerName: string;
    avatar: string;
    cardsPerPlayer?: number;
    maxRounds?: number;
  }) => {
    const roomId = generateCricketRoomCode();
    currentRoomId = roomId;

    const hostPlayer: CricketPlayerState = {
      id: socket.id,
      name: playerName || 'Captain',
      avatar: avatar || '🏏',
      isHost: true,
      isReady: true,
      deckCount: 0,
      eliminated: false,
      roundsWon: 0,
      cardsWon: 0,
      currentStreak: 0,
      longestStreak: 0
    };

    const botPlayer: CricketPlayerState = {
      id: `bot-cricket-${Date.now()}`,
      name: 'Sachin (AI Bot)',
      avatar: '🤖',
      isHost: false,
      isReady: true,
      isBot: true,
      deckCount: 0,
      eliminated: false,
      roundsWon: 0,
      cardsWon: 0,
      currentStreak: 0,
      longestStreak: 0
    };

    const defaultSettings: CricketRoomSettings = {
      maxPlayers: 2,
      cardsPerPlayer: cardsPerPlayer || 10,
      gameMode: 'FIXED_ROUNDS',
      maxRounds: maxRounds || 15,
      ruleVariant: 'CLASSIC',
      showNextCard: false,
      timeLimitPerTurn: 15,
      isPrivate: true
    };

    const initialGameState: CricketGameState = {
      roomId,
      isSinglePlayer: true,
      phase: 'LOBBY',
      currentRound: 1,
      maxRounds: defaultSettings.maxRounds,
      cardsPerPlayer: defaultSettings.cardsPerPlayer,
      settings: defaultSettings,
      hostId: socket.id,
      starterId: socket.id,
      starterName: hostPlayer.name,
      statLocked: false,
      timeRemaining: 15,
      players: [hostPlayer, botPlayer],
      tableCards: [],
      accumulatedPotCardsCount: 0
    };

    cricketRooms.set(roomId, {
      state: initialGameState,
      playerDecks: new Map(),
      activePotCards: []
    });

    socket.join(roomId);
    socket.emit('cricket:roomCreated', {
      roomId,
      gameState: getSanitizedCricketState(roomId, socket.id)
    });
  });

  // Join Room
  socket.on('cricket:joinRoom', ({
    roomId,
    playerName,
    avatar
  }: {
    roomId: string;
    playerName: string;
    avatar: string;
  }) => {
    const cleanId = (roomId || '').trim().toUpperCase();
    console.log(`[Cricket] Socket ${socket.id} attempting to join room: ${cleanId} as "${playerName}"`);
    const room = cricketRooms.get(cleanId);

    if (!room) {
      console.log(`[Cricket] Room ${cleanId} not found in memory`);
      socket.emit('cricket:error', { message: `Cricket room "${cleanId}" not found. Please check your room code.` });
      return;
    }

    const { state } = room;
    if (state.phase !== 'LOBBY') {
      socket.emit('cricket:error', { message: 'Match is already in progress.' });
      return;
    }

    if (state.players.length >= state.settings.maxPlayers && !state.players.some(p => p.id === socket.id)) {
      socket.emit('cricket:error', { message: 'Room is at maximum capacity (8 players).' });
      return;
    }

    currentRoomId = cleanId;
    socket.join(cleanId);

    const existingPlayer = state.players.find(p => p.id === socket.id);
    if (existingPlayer) {
      if (playerName) existingPlayer.name = playerName;
      if (avatar) existingPlayer.avatar = avatar;
    } else {
      const newPlayer: CricketPlayerState = {
        id: socket.id,
        name: playerName || `Player ${state.players.length + 1}`,
        avatar: avatar || '🏏',
        isHost: false,
        isReady: false,
        deckCount: 0,
        eliminated: false,
        roundsWon: 0,
        cardsWon: 0,
        currentStreak: 0,
        longestStreak: 0
      };

      state.players.push(newPlayer);
      sendSystemMessage(io, cleanId, `🏏 ${newPlayer.name} joined the cricket pavilion!`);
    }

    socket.emit('cricket:roomJoined', {
      roomId: cleanId,
      gameState: getSanitizedCricketState(cleanId, socket.id)
    });

    broadcastCricketState(io, cleanId);
  });

  // Toggle Ready
  socket.on('cricket:toggleReady', () => {
    if (!currentRoomId) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room) return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = !player.isReady;
      broadcastCricketState(io, currentRoomId);
    }
  });

  // Update Settings
  socket.on('cricket:updateSettings', (newSettings: Partial<CricketRoomSettings>) => {
    if (!currentRoomId) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id) return;

    room.state.settings = { ...room.state.settings, ...newSettings };
    room.state.maxRounds = room.state.settings.maxRounds;
    room.state.cardsPerPlayer = room.state.settings.cardsPerPlayer;
    broadcastCricketState(io, currentRoomId);
  });

  // Add Bot Player
  socket.on('cricket:addBot', () => {
    if (!currentRoomId) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id) return;

    if (room.state.players.length >= room.state.settings.maxPlayers) {
      socket.emit('cricket:error', { message: 'Room is full.' });
      return;
    }

    const botIndex = room.state.players.filter(p => p.isBot).length;
    const botName = BOT_NAMES[botIndex % BOT_NAMES.length];
    const botAvatar = BOT_AVATARS[botIndex % BOT_AVATARS.length];
    const botId = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const botPlayer: CricketPlayerState = {
      id: botId,
      name: botName,
      avatar: botAvatar,
      isHost: false,
      isReady: true,
      isBot: true,
      deckCount: 0,
      eliminated: false,
      roundsWon: 0,
      cardsWon: 0,
      currentStreak: 0,
      longestStreak: 0
    };

    room.state.players.push(botPlayer);
    sendSystemMessage(io, currentRoomId, `🤖 ${botName} added to lineup.`);
    broadcastCricketState(io, currentRoomId);
  });

  // Remove Bot
  socket.on('cricket:removeBot', ({ botId }: { botId: string }) => {
    if (!currentRoomId) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id) return;

    room.state.players = room.state.players.filter(p => p.id !== botId);
    broadcastCricketState(io, currentRoomId);
  });

  // Kick Player
  socket.on('cricket:kickPlayer', ({ playerId }: { playerId: string }) => {
    if (!currentRoomId) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id || playerId === socket.id) return;

    room.state.players = room.state.players.filter(p => p.id !== playerId);
    io.to(playerId).emit('cricket:kicked');
    broadcastCricketState(io, currentRoomId);
  });

  // Pre-game Shuffle Deck
  socket.on('cricket:shuffleDeck', () => {
    if (!currentRoomId) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room || room.state.phase !== 'PRE_GAME_SHUFFLE') return;

    const player = room.state.players.find(p => p.id === socket.id);
    if (player && !player.hasShuffled) {
      player.hasShuffled = true;
      const deck = room.playerDecks.get(socket.id);
      if (deck && deck.length > 1) {
        // Shuffle player's own deck order
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }
      }
      sendSystemMessage(io, currentRoomId, `🔀 ${player.name} shuffled their starting deck.`);
      broadcastCricketState(io, currentRoomId);
    }
  });

  // Start Game
  socket.on('cricket:startGame', () => {
    if (!currentRoomId) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id) return;

    if (room.state.players.length < 2) {
      socket.emit('cricket:error', { message: 'Need at least 2 players (or add a bot) to start.' });
      return;
    }

    startCricketMatch(io, currentRoomId);
  });

  // Select Stat (Starter turn)
  socket.on('cricket:selectStat', ({ statKey }: { statKey: StatKey }) => {
    if (!currentRoomId) return;
    serverSelectStat(io, currentRoomId, socket.id, statKey);
  });

  // Play Card (All players reveal top card)
  socket.on('cricket:playCard', () => {
    if (!currentRoomId) return;
    serverPlayCard(io, currentRoomId, socket.id);
  });

  // Restart Game
  socket.on('cricket:restartGame', () => {
    if (!currentRoomId) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room || room.state.hostId !== socket.id) return;

    room.state.phase = 'LOBBY';
    room.state.currentRound = 1;
    room.state.tableCards = [];
    room.activePotCards = [];
    room.playerDecks.clear();

    room.state.players.forEach(p => {
      p.isReady = p.isHost || !!p.isBot;
      p.deckCount = 0;
      p.eliminated = false;
      p.roundsWon = 0;
      p.cardsWon = 0;
      p.currentStreak = 0;
      p.longestStreak = 0;
    });

    broadcastCricketState(io, currentRoomId);
  });

  // Chat Message
  socket.on('cricket:chatSend', ({ text }: { text: string }) => {
    if (!currentRoomId || !text) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room) return;

    const sender = room.state.players.find(p => p.id === socket.id);
    if (!sender) return;

    const msg: CricketChatMessage = {
      id: `chat-${Date.now()}-${Math.random()}`,
      playerId: socket.id,
      playerName: sender.name,
      avatar: sender.avatar,
      text: text.slice(0, 100),
      timestamp: Date.now()
    };
    io.to(currentRoomId).emit('cricket:chatMessage', msg);
  });

  // Emote
  socket.on('cricket:chatEmote', ({ emote }: { emote: string }) => {
    if (!currentRoomId || !emote) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room) return;

    const sender = room.state.players.find(p => p.id === socket.id);
    if (!sender) return;

    const msg: CricketChatMessage = {
      id: `emote-${Date.now()}-${Math.random()}`,
      playerId: socket.id,
      playerName: sender.name,
      avatar: sender.avatar,
      emote,
      timestamp: Date.now()
    };
    io.to(currentRoomId).emit('cricket:chatMessage', msg);
  });

  // Leave Room / Disconnect
  const handleLeave = () => {
    if (!currentRoomId) return;
    const room = cricketRooms.get(currentRoomId);
    if (!room) return;

    const leavingPlayer = room.state.players.find(p => p.id === socket.id);
    room.state.players = room.state.players.filter(p => p.id !== socket.id);

    if (room.state.players.length === 0) {
      if (room.roundTimer) clearInterval(room.roundTimer);
      cricketRooms.delete(currentRoomId);
    } else {
      if (room.state.hostId === socket.id) {
        room.state.hostId = room.state.players[0].id;
        room.state.players[0].isHost = true;
      }
      if (leavingPlayer) {
        sendSystemMessage(io, currentRoomId, `🚪 ${leavingPlayer.name} left the match.`);
      }
      broadcastCricketState(io, currentRoomId);
    }

    socket.leave(currentRoomId);
    currentRoomId = null;
  };

  socket.on('cricket:leaveRoom', handleLeave);
  socket.on('disconnect', handleLeave);
}
