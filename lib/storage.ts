import { UserProfile, TradeHistory, Transaction } from './types';

// Simple AES-like encryption for localStorage (MVP - use crypto-js in production)
const SECRET_KEY = 'alinea-mvp-key';

/**
 * Store user profile in encrypted localStorage
 */
export function saveUserProfile(profile: UserProfile): void {
  const key = `alinea_profile_${profile.id}`;
  localStorage.setItem(key, JSON.stringify(profile));
}

/**
 * Retrieve user profile from localStorage
 */
export function getUserProfile(userId: string): UserProfile | null {
  const key = `alinea_profile_${userId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Store trade transaction
 */
export function saveTransaction(userId: string, transaction: Transaction): void {
  const key = `alinea_trades_${userId}`;
  const existing = localStorage.getItem(key);
  const trades: Transaction[] = existing ? JSON.parse(existing) : [];
  trades.push(transaction);
  localStorage.setItem(key, JSON.stringify(trades));
}

/**
 * Get all transactions for user
 */
export function getTransactions(userId: string): Transaction[] {
  const key = `alinea_trades_${userId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

/**
 * Update user profile stats (trades completed, blocked, score history)
 */
export function updateUserStats(userId: string, emotionalScore: number, action: 'confirmed' | 'cancelled'): void {
  const profile = getUserProfile(userId);
  if (!profile) return;
  
  profile.emotionalScoreHistory.push(emotionalScore);
  
  if (action === 'confirmed') {
    profile.tradesCompleted++;
  } else {
    profile.tradesBlocked++;
  }
  
  // Keep only last 52 weeks of scores
  if (profile.emotionalScoreHistory.length > 520) {
    profile.emotionalScoreHistory = profile.emotionalScoreHistory.slice(-520);
  }
  
  saveUserProfile(profile);
}

/**
 * Generate weekly trends for dashboard
 */
export function getWeeklyTrends(userId: string) {
  const transactions = getTransactions(userId);
  const trends = [];
  
  for (let i = 0; i < 4; i++) {
    const weekStart = Date.now() - (i + 1) * 7 * 86400000;
    const weekEnd = weekStart + 7 * 86400000;
    
    const weekTransactions = transactions.filter(t => t.timestamp >= weekStart && t.timestamp < weekEnd);
    
    if (weekTransactions.length > 0) {
      const avgScore = Math.round(
        weekTransactions.reduce((sum, t) => sum + t.emotionalScore.score, 0) / weekTransactions.length
      );
      
      trends.push({
        date: new Date(weekStart).toLocaleDateString(),
        avgScore,
        tradesCompleted: weekTransactions.filter(t => t.userAction === 'confirmed').length,
        tradesBlocked: weekTransactions.filter(t => t.userAction === 'cancelled').length,
      });
    }
  }
  
  return trends.reverse();
}

/**
 * Calculate user stats for dashboard
 */
export function getUserStats(userId: string) {
  const profile = getUserProfile(userId);
  const transactions = getTransactions(userId);
  
  if (!profile) return null;
  
  const recentScores = profile.emotionalScoreHistory.slice(-30);
  const avgRecentScore = recentScores.length > 0
    ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
    : 50;
  
  const successRate = profile.tradesCompleted + profile.tradesBlocked > 0
    ? Math.round((profile.tradesCompleted / (profile.tradesCompleted + profile.tradesBlocked)) * 100)
    : 0;
  
  return {
    tradesCompleted: profile.tradesCompleted,
    tradesBlocked: profile.tradesBlocked,
    totalTrades: profile.tradesCompleted + profile.tradesBlocked,
    avgEmotionalScore: avgRecentScore,
    blockRate: 100 - successRate,
    successRate,
  };
}
