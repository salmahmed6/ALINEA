// ALINEA Core Types

export type UserArchetype = 
  | 'calm-authority'
  | 'radical-honesty'
  | 'deep-respect'
  | 'premium-intelligence';

export interface UserProfile {
  id: string;
  archetype: UserArchetype;
  walletAddress: string;
  createdAt: number;
  emotionalScoreHistory: number[];
  tradesCompleted: number;
  tradesBlocked: number;
}

export interface BehavioralSignals {
  decisionSpeed: number; // 0-100: how fast is user acting
  timeOfDay: number; // 0-100: market hours vs off-hours bias
  strategyDeviation: number; // 0-100: deviation from stated strategy
  tradeHistory: number; // 0-100: consistency with past decisions
  tradeFrequency: number; // 0-100: over/under-trading pattern
  marketMood: number; // 0-100: market sentiment vs user action
}

export interface EmotionalScore {
  score: number; // 0-100
  level: 'clean' | 'yellow' | 'orange' | 'block';
  signals: BehavioralSignals;
  recommendation: string;
  timestamp: number;
}

export interface Transaction {
  hash?: string;
  from: string;
  to: string;
  value: string;
  data?: string;
  timestamp: number;
  emotionalScore: EmotionalScore;
  userAction: 'confirmed' | 'cancelled';
}

export interface TradeHistory {
  userId: string;
  transactions: Transaction[];
  weeklyTrends: {
    date: string;
    avgScore: number;
    tradesCompleted: number;
    tradesBlocked: number;
  }[];
}

export interface CoachMessage {
  message: string;
  tone: 'supportive' | 'cautionary' | 'blocking';
  archetype: UserArchetype;
}
