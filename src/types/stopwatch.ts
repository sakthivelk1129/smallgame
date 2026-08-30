export type StopwatchTeam = 'red' | 'blue' | 'none';
export type StopwatchFormat = 'single' | 'team';
export type StopwatchPlayMode = 'bot' | 'friends' | 'online_random';

export type StopwatchPhase = 
  | 'LOBBY'
  | 'TARGET_ANNOUNCEMENT'
  | 'ACTIVE_STOPWATCH'
  | 'ROUND_RESULT'
  | 'FINAL_RESULTS';

export interface StopwatchPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  team: StopwatchTeam;
  score: number;
  stoppedTime: number | null;
  difference: number | null;
  pointsGained: number;
  isExactMatch: boolean;
  hasStopped: boolean;
  bestDiff?: number;
  exactMatchesCount?: number;
}

export interface StopwatchSettings {
  rounds: number;
  format: StopwatchFormat;
  playMode: StopwatchPlayMode;
  minTarget: number;
  maxTarget: number;
  blindfoldMode: boolean;
  isPrivate: boolean;
  maxPlayers: number;
}

export interface StopwatchPlayerRoundResult {
  playerId: string;
  playerName: string;
  avatar: string;
  team: StopwatchTeam;
  stoppedTime: number;
  difference: number;
  pointsGained: number;
  isExactMatch: boolean;
  isWinner: boolean;
}

export interface StopwatchRoundResult {
  roundNumber: number;
  targetTime: number;
  playerResults: StopwatchPlayerRoundResult[];
  winningPlayerIds: string[];
  isDraw: boolean;
  winningTeam?: StopwatchTeam | 'draw';
  summaryText: string;
}

export interface StopwatchGameState {
  roomId: string;
  hostId: string;
  phase: StopwatchPhase;
  currentRound: number;
  maxRounds: number;
  targetTime: number;
  timerStartedAt: number | null;
  settings: StopwatchSettings;
  players: StopwatchPlayer[];
  teamScores: {
    red: number;
    blue: number;
  };
  roundHistory: StopwatchRoundResult[];
  countdownTimer: number;
}

export interface StopwatchChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}
