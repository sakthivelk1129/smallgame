export type GameMode = 'normal' | 'special';
export type CommunicationMode = 'debate' | 'face_to_face';

export type GamePhase =
  | 'LOBBY'
  | 'STARTING'
  | 'ROLE_ASSIGNMENT'
  | 'ROLE_REVEAL'
  | 'RAJA_REVEAL'
  | 'EVENT_ANNOUNCEMENT'
  | 'DISCUSSION'
  | 'POLICE_TURN'
  | 'ACCUSATION_REVEAL'
  | 'ROUND_SCORING'
  | 'FINAL_RESULTS';

export type RoleType =
  | 'RAJA'
  | 'RANI'
  | 'MINISTER'
  | 'POLICE'
  | 'SPY'
  | 'RICH_MAN'
  | 'FARMER'
  | 'COOK'
  | 'SERVANT'
  | 'ACTOR'
  | 'JOKER'
  | 'THIEF';

export interface RoleDefinition {
  id: RoleType;
  name: string;
  emoji: string;
  basePoints: number;
  description: string;
  mission: string;
  color: string;
  bgGradient: string;
  specialAbilityName?: string;
  specialAbilityDesc?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
  score: number;
  roundScoreChange: number;
  currentRole?: RoleType; // Only sent to the specific player (Anti-cheat)
  hasUsedAbility?: boolean;
  isProtected?: boolean; // Rani protection
  revealedRole?: RoleType; // During reveal phase or Raja
  stats: {
    thievesCaught: number;
    escapedAsThief: number;
    timesRaja: number;
    correctAccusations: number;
    wrongAccusations: number;
    abilitiesUsed: number;
  };
}

export type SpecialEvent =
  | 'DOUBLE_POINTS'
  | 'DARK_ROUND'
  | 'ROLE_SWAP'
  | 'SPEED_ROUND'
  | 'KINGS_CHOICE'
  | 'JOKER_CHAOS';

export interface GameEventDetails {
  type: SpecialEvent;
  title: string;
  description: string;
  icon: string;
}

export interface RoomSettings {
  mode: GameMode;
  communicationMode: CommunicationMode; // 'debate' (type & confuse/give clues) or 'face_to_face' (no chat clues, look face-to-face)
  maxRounds: number;
  minPlayers: number;
  maxPlayers: number;
  turnDuration: number; // up to 180s (3 minutes max)
  chatEnabled: boolean;
  isPrivate: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface EmoteEvent {
  id: string;
  playerId: string;
  playerName: string;
  emote: string;
  timestamp: number;
}

export interface AlibiClaim {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  claimedRole?: string;
  claimText: string;
  timestamp: number;
}

export interface AccusationData {
  policePlayerId: string;
  policePlayerName: string;
  targetPlayerId: string;
  targetPlayerName: string;
  targetRole: RoleType;
  isCorrect: boolean;
  jokerEscaped?: boolean;
  guessesLeft?: number;
}

export interface GameState {
  roomId: string;
  mode: GameMode;
  hostId: string;
  players: Player[];
  currentRound: number;
  maxRounds: number;
  phase: GamePhase;
  timer: number;
  rajaPlayerId?: string;
  policePlayerId?: string;
  activeEvent?: GameEventDetails | null;
  lastAccusation?: AccusationData | null;
  roundResults?: {
    playerId: string;
    playerName: string;
    role: RoleType;
    pointsGained: number;
    totalScore: number;
    breakdown: string;
  }[];
  kingsChoicePlayerIds?: string[];
  settings: RoomSettings;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  gamesPlayed: number;
  gamesWon: number;
  isGuest: boolean;
  email?: string;
}

export interface LiveSpeechTranscript {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
  isCourtHerald?: boolean;
}

export interface VoiceUserState {
  playerId: string;
  playerName: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking: boolean;
  audioLevel?: number;
}
