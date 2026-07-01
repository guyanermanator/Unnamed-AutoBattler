export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthRequest {
  googleToken: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  profile: ProfileData;
}

export interface ProfileData {
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  experience: number;
  gold: number;
  highestFloor: number;
  totalWins: number;
  totalLosses: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveRunRequest {
  runId: string;
  state: {
    team: string[];
    inventory: string[];
    gold: number;
    floor: number;
    dungeonProgress: unknown;
  };
}

export interface LoadRunResponse {
  runId: string;
  state: {
    team: string[];
    inventory: string[];
    gold: number;
    floor: number;
    dungeonProgress: unknown;
  };
  savedAt: string;
}

export interface OpponentData {
  userId: string;
  username: string;
  team: string[];
  rating: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  highestFloor: number;
  totalWins: number;
  rating: number;
}
