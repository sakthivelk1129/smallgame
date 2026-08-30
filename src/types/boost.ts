export type BoostGameMode = 'CLASSIC' | 'SPECIAL';

export type BoostGamePhase = 
  | 'LOBBY'
  | 'WORD_ENTRY'
  | 'SHUFFLING'
  | 'PLAYING'
  | 'BOOST_VALIDATION'
  | 'ROUND_END'
  | 'GAME_OVER';

export type BoostAbilityType = 
  | 'PEEK' 
  | 'SWAP' 
  | 'EXTRA_TIME' 
  | 'SHUFFLE' 
  | 'BLOCK' 
  | 'DOUBLE_PICK';

export interface BoostPlayerCard {
  id: string;
  position: number; // 0, 1, 2
  word?: string; // only defined for the owner player or in round reveal
}

export interface BoostPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  ready: boolean;
  connected: boolean;
  hasSubmittedWord: boolean;
  seatIndex: number;
  cards: BoostPlayerCard[]; // The 3 cards visible on the table (words hidden for opponents)
  score: number;
  roundWins: number;
  boostCount: number;
  fastestBoostSeconds?: number;
  specialAbility?: BoostAbilityType;
  hasUsedAbility?: boolean;
  isBlockedForTurn?: boolean;
}

export interface BoostRoundWinner {
  playerId: string;
  playerName: string;
  avatar: string;
  winningWord: string;
  pointsEarned: number;
  fastestBonus: number;
  durationSeconds: number;
  allPlayerHandsRevealed?: Array<{
    playerId: string;
    playerName: string;
    avatar: string;
    cards: Array<{ id: string; word: string }>;
  }>;
}

export interface BoostLeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  avatar: string;
  totalScore: number;
  roundWins: number;
  boostCount: number;
  fastestBoostSeconds?: number;
  isJointWinner?: boolean;
}

export interface BoostGameState {
  roomCode: string;
  hostId: string;
  isPrivate?: boolean;
  players: BoostPlayer[];
  maxPlayers: number;
  gameMode: BoostGameMode;
  totalRounds: number;
  currentRound: number;
  status: BoostGamePhase;
  currentTurnPlayerId: string;
  targetPickPlayerId: string; // The preceding player who is being picked from
  turnTimeRemaining: number;
  roundStartedAt: number;
  roundElapsedSeconds: number;
  roundWinner?: BoostRoundWinner;
  finalLeaderboard?: BoostLeaderboardEntry[];
  lastActionMessage?: string;
  activeBoostClaimant?: {
    playerId: string;
    playerName: string;
    avatar: string;
  };
}

export interface BoostPrivateState {
  mySubmittedWord?: string;
  myCards: Array<{ id: string; word: string; position: number }>;
  canBoost: boolean;
  matchingWord?: string;
  mySpecialAbility?: BoostAbilityType;
  hasUsedSpecialAbility: boolean;
  peekedCard?: { cardId: string; word: string } | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  isGuest: boolean;
  stats?: {
    rajaGamesPlayed: number;
    rajaGamesWon: number;
    boostGamesPlayed: number;
    boostGamesWon: number;
    boostTotalBoosts: number;
  };
}

