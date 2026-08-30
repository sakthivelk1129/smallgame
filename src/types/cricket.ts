export type CricketRole = 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
export type CardRarity = 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON';
export type SpecialAbilityType = 'STAT_BOOST' | 'RESELECT' | 'SHIELD' | 'DOUBLE_STAT' | 'NONE';

export type StatKey = 
  | 'rank'
  | 'batting'
  | 'strikeRate'
  | 'power'
  | 'consistency'
  | 'bowling'
  | 'pace'
  | 'accuracy'
  | 'wicketAbility';

export interface CricketCard {
  cardId: string; // e.g. "CRIC-0001" to "CRIC-1000"
  playerName: string;
  country: string;
  countryCode: string;
  flagEmoji: string;
  role: CricketRole;
  imageUrl: string;
  jerseyNumber?: number;
  rank: number; // 1 to 1000 (Rank #1 is highest/best)
  
  // 4 Batting Stats (1-100)
  batting: number; // Batting Skill / Average
  strikeRate: number; // Strike Rate
  power: number; // Six hitting / boundary power
  consistency: number; // Match consistency
  
  // 4 Bowling Stats (1-100)
  bowling: number; // Bowling Skill / Average
  pace: number; // Bowling speed / spin velocity
  accuracy: number; // Line & Length discipline
  wicketAbility: number; // Wicket taking strike rate
  
  rarity: CardRarity;
  specialAbility?: SpecialAbilityType;
}

export type CricketGameMode = 'FIXED_ROUNDS' | 'ELIMINATION';
export type CricketRuleVariant = 'CLASSIC' | 'SPECIAL_ABILITIES';
export type RuleVariant = CricketRuleVariant;

export type CricketPhase = 
  | 'LOBBY'
  | 'PRE_GAME_SHUFFLE'
  | 'STAT_SELECTION'
  | 'REVEAL_COMPARE'
  | 'TIE_BREAKER'
  | 'ROUND_SUMMARY'
  | 'FINAL_PODIUM';

export interface CricketPlayerState {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
  hasShuffled?: boolean;
  deckCount: number;
  topCard?: CricketCard; // Available to client for their own card
  currentPlayedCard?: CricketCard; // Revealed during comparison
  eliminated: boolean;
  eliminationRank?: number;
  roundsWon: number;
  cardsWon: number;
  currentStreak: number;
  longestStreak: number;
  favouriteStat?: StatKey;
  statUsageCount?: Partial<Record<StatKey, number>>;
  specialAbilityUsed?: boolean;
}

export interface CricketRoomSettings {
  maxPlayers: number; // 2 to 8
  cardsPerPlayer: number; // 5, 8, 10, 15, 20
  gameMode: CricketGameMode; // FIXED_ROUNDS or ELIMINATION
  maxRounds: number; // For FIXED_ROUNDS: 10, 20, 30, 50, 100
  ruleVariant: CricketRuleVariant; // CLASSIC or SPECIAL_ABILITIES
  showNextCard: boolean; // Optional: default false
  timeLimitPerTurn: number; // default 15s for stat selection, 10s for reveal
  isPrivate?: boolean;
}

export interface CricketTableCard {
  playerId: string;
  playerName: string;
  avatar: string;
  card: CricketCard;
  statValue: number;
  isWinner?: boolean;
  isTied?: boolean;
}

export interface CricketGameState {
  roomId: string;
  isSinglePlayer: boolean;
  phase: CricketPhase;
  currentRound: number;
  maxRounds: number;
  cardsPerPlayer?: number;
  settings: CricketRoomSettings;
  hostId: string;
  starterId: string; // The player whose turn it is to select the stat
  starterName?: string;
  selectedStat?: StatKey;
  statLocked: boolean;
  timeRemaining: number;
  players: CricketPlayerState[];
  tableCards: CricketTableCard[];
  accumulatedPotCardsCount: number;
  activePotCards?: CricketCard[];
  roundWinnerId?: string;
  roundWinnerName?: string;
  winningStatValue?: number;
  isTie?: boolean;
  tiedPlayerIds?: string[];
  finalRankings?: {
    playerId: string;
    name: string;
    avatar: string;
    rank: number;
    cardsLeft: number;
    roundsWon: number;
    longestStreak: number;
    bestStat?: string;
  }[];
}

export interface CricketChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  text?: string;
  emote?: string;
  timestamp: number;
  isSystem?: boolean;
}
