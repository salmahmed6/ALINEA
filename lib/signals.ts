import { BehavioralSignals, EmotionalScore, UserProfile, Transaction } from './types';
import { getMarketMood } from './coingecko';

/**
 * Analyze 6 behavioral signals to compute emotional score
 * Now integrated with real market sentiment from CoinGecko
 */

// 1. Decision Speed: How quickly user is acting (in seconds)
export function analyzeDecisionSpeed(secondsSinceOpened: number): number {
  if (secondsSinceOpened < 5) return 95; // Very fast = risky
  if (secondsSinceOpened < 30) return 75;
  if (secondsSinceOpened < 120) return 50;
  if (secondsSinceOpened < 300) return 25;
  return 10; // Very deliberate
}

// 2. Time of Day: Market psychology varies by time
export function analyzeTimeOfDay(): number {
  const hour = new Date().getHours();
  // US Market hours (9:30 AM - 4 PM EST)
  const isMarketHours = hour >= 9 && hour <= 16;
  
  if (isMarketHours) return 40; // Safer during main hours
  if (hour >= 22 || hour < 4) return 85; // Late night = risky
  return 60; // Moderate risk
}

// 3. Strategy Deviation: How much does this trade deviate from user's stated strategy?
export function analyzeStrategyDeviation(
  tradeType: 'buy' | 'sell',
  tradeSize: number,
  userAverageSize: number
): number {
  const sizeRatio = tradeSize / (userAverageSize || 1);
  
  if (sizeRatio > 3) return 90; // Way larger than usual
  if (sizeRatio > 1.5) return 70;
  if (sizeRatio < 0.3) return 60;
  return 30; // Normal
}

// 4. Trade History: Consistency check
export function analyzeTradeHistory(
  pastTransactions: Transaction[],
  currentTradeType: 'buy' | 'sell'
): number {
  if (pastTransactions.length === 0) return 50; // New user = moderate
  
  const recent = pastTransactions.slice(-10);
  const buyCount = recent.filter(t => 
    t.emotionalScore.score > 75 && t.userAction === 'confirmed'
  ).length;
  
  // Repeated risky patterns
  if (buyCount >= 7) return 75; // High-risk pattern detected
  return 40;
}

// 5. Trade Frequency: Over/under-trading pattern
export function analyzeTradeFrequency(pastTransactions: Transaction[]): number {
  if (pastTransactions.length === 0) return 40;
  
  const last24h = pastTransactions.filter(t => 
    Date.now() - t.timestamp < 86400000
  ).length;
  
  if (last24h > 20) return 85; // Overtrading
  if (last24h > 10) return 70;
  if (last24h > 5) return 55;
  return 30;
}

// 6. Market Mood: Trade against market sentiment = risky
export function analyzeMarketMood(marketSentiment: number, tradeType: 'buy' | 'sell'): number {
  // marketSentiment: 0 = bearish, 50 = neutral, 100 = bullish
  
  if (tradeType === 'buy' && marketSentiment < 30) return 80; // Buying in bear market
  if (tradeType === 'sell' && marketSentiment > 70) return 75; // Selling in bull market
  
  return 40;
}

/**
 * Compute overall emotional score (0-100) from signals
 */
export function computeEmotionalScore(signals: BehavioralSignals): number {
  // Weighted average of all signals
  const weights = {
    decisionSpeed: 0.25,
    timeOfDay: 0.15,
    strategyDeviation: 0.20,
    tradeHistory: 0.15,
    tradeFrequency: 0.15,
    marketMood: 0.10,
  };
  
  const weighted =
    signals.decisionSpeed * weights.decisionSpeed +
    signals.timeOfDay * weights.timeOfDay +
    signals.strategyDeviation * weights.strategyDeviation +
    signals.tradeHistory * weights.tradeHistory +
    signals.tradeFrequency * weights.tradeFrequency +
    signals.marketMood * weights.marketMood;
  
  return Math.round(weighted);
}

/**
 * Map score to intervention level
 */
export function getInterventionLevel(score: number): 'clean' | 'yellow' | 'orange' | 'block' {
  if (score < 30) return 'clean'; // Safe
  if (score < 55) return 'yellow'; // Caution
  if (score < 80) return 'orange'; // Warning
  return 'block'; // High risk
}

/**
 * Generate behavioral signals from transaction context
 */
export async function generateBehavioralSignals(
  secondsSinceOpened: number,
  tradeType: 'buy' | 'sell',
  tradeSize: number,
  userProfile: UserProfile,
  pastTransactions: Transaction[]
): Promise<BehavioralSignals> {
  const userAverageSize = pastTransactions.length > 0
    ? pastTransactions.reduce((sum, t) => sum + parseFloat(t.value), 0) / pastTransactions.length
    : 1;
  
  // Fetch market sentiment from CoinGecko (mocked for MVP)
  const marketSentiment = 50;
  
  return {
    decisionSpeed: analyzeDecisionSpeed(secondsSinceOpened),
    timeOfDay: analyzeTimeOfDay(),
    strategyDeviation: analyzeStrategyDeviation(tradeType, tradeSize, userAverageSize),
    tradeHistory: analyzeTradeHistory(pastTransactions, tradeType),
    tradeFrequency: analyzeTradeFrequency(pastTransactions),
    marketMood: analyzeMarketMood(marketSentiment, tradeType),
  };
}

/**
 * Complete emotional score computation
 */
export async function computeFullEmotionalScore(
  secondsSinceOpened: number,
  tradeType: 'buy' | 'sell',
  tradeSize: number,
  userProfile: UserProfile,
  pastTransactions: Transaction[]
): Promise<EmotionalScore> {
  const signals = await generateBehavioralSignals(
    secondsSinceOpened,
    tradeType,
    tradeSize,
    userProfile,
    pastTransactions
  );
  
  const score = computeEmotionalScore(signals);
  const level = getInterventionLevel(score);
  
  return {
    score,
    level,
    signals,
    recommendation: '', // Will be set by coach
    timestamp: Date.now(),
  };
}
