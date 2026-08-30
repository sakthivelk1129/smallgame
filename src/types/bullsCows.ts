export type WordLength = 3 | 4 | 5 | 6 | 7;
export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type BullsCowsGameMode = 'SAME_TARGET' | 'SECRET_TARGET' | 'SPEED_BULLS';
export type GamePhase = 'LOBBY' | 'PLAYING' | 'ROUND_RESULTS' | 'FINAL_PODIUM';

export interface LetterStatus {
  letter: string;
  type: 'BULL' | 'COW' | 'ABSENT'; // 🐂 = BULL, 🐄 = COW, ✕ = ABSENT
}

export interface GuessRecord {
  id: string;
  guess: string;
  bulls: number;
  cows: number;
  letterStatuses: LetterStatus[];
  timestamp: number;
  solved: boolean;
}

export interface BullsCowsPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
  score: number;
  roundScore: number;
  guessesCount: number;
  timeTaken: number; // in seconds
  hasSolved: boolean;
  solveTime?: number;
  guessHistory: GuessRecord[];
}

export interface BullsCowsRoomSettings {
  wordLength: WordLength;
  difficulty: GameDifficulty;
  gameMode: BullsCowsGameMode;
  maxRounds: number;
  timeLimit: number; // in seconds (e.g. 90s for standard, 45s for SPEED_BULLS)
  allowRepeatedLetters: boolean; // default false
  maxPlayers: number;
}

export interface BullsCowsGameState {
  roomId: string;
  isSinglePlayer: boolean;
  phase: GamePhase;
  currentRound: number;
  maxRounds: number;
  settings: BullsCowsRoomSettings;
  hostId: string;
  players: BullsCowsPlayer[];
  timeRemaining: number;
  roundWinnerId?: string;
  roundWinningWord?: string; // Revealed ONLY after round ends
  recentTargetWords: string[];
}

export interface BullsCowsChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  text?: string;
  emote?: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface WordMetadata {
  word: string;
  length: WordLength;
  difficulty: GameDifficulty;
  frequency: number;
  letterPattern?: string;
}
