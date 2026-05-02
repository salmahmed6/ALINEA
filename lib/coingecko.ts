/**
 * CoinGecko API Integration for Market Sentiment
 * Provides real-time price data and market conditions for emotional signal analysis
 */

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

interface MarketData {
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap: number;
  marketCapChange24h: number;
  volume24h: number;
  volatility: number;
  fear_greed_index?: number;
}

/**
 * Get market sentiment score (0-100)
 * Factors: price volatility, market movement, volume
 */
export async function getMarketSentiment(): Promise<number> {
  try {
    // Fetch market data from CoinGecko
    const response = await fetch(
      `${COINGECKO_API_BASE}/global?vs_currency=usd`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error('[CoinGecko] API error:', response.status);
      return 50; // Neutral if API fails
    }

    const data = await response.json();

    // Calculate sentiment based on market metrics
    const btcChange = data.btc_market_cap_change_percentage_24h_usd || 0;
    const ethChange = data.eth_market_cap_change_percentage_24h_usd || 0;
    const altcoinChange = data.altcoin_market_cap_change_percentage_24h_usd || 0;

    // Weighted sentiment calculation
    const sentiment = Math.max(
      0,
      Math.min(100, 50 + (btcChange * 0.5 + ethChange * 0.3 + altcoinChange * 0.2) / 2)
    );

    return Math.round(sentiment);
  } catch (error) {
    console.error('[CoinGecko] Market sentiment error:', error);
    return 50; // Return neutral sentiment on error
  }
}

/**
 * Get token price data
 */
export async function getTokenPrice(tokenId: string): Promise<MarketData | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${tokenId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const tokenData = data[tokenId];

    if (!tokenData) {
      return null;
    }

    return {
      currentPrice: tokenData.usd || 0,
      priceChange24h: tokenData.usd_24h_change || 0,
      priceChangePercent24h: tokenData.usd_24h_change || 0,
      marketCap: tokenData.usd_market_cap || 0,
      marketCapChange24h: 0,
      volume24h: tokenData.usd_24h_vol || 0,
      volatility: Math.abs(tokenData.usd_24h_change || 0),
    };
  } catch (error) {
    console.error('[CoinGecko] Token price error:', error);
    return null;
  }
}

/**
 * Get Fear & Greed Index (from alternative API)
 */
export async function getFearGreedIndex(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.alternative.me/fng/?limit=1',
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return 50;
    }

    const data = await response.json();
    return parseInt(data.data[0]?.value || '50', 10);
  } catch (error) {
    console.error('[FearGreed] API error:', error);
    return 50;
  }
}

/**
 * Calculate market mood signal (-100 to 100)
 * Used as emotional signal in transaction scoring
 */
export async function getMarketMood(): Promise<number> {
  const sentiment = await getMarketSentiment();
  const fng = await getFearGreedIndex();

  // Combine metrics (50% market sentiment, 50% fear/greed)
  const combinedMood = sentiment * 0.5 + fng * 0.5;

  // Convert to -100 to 100 scale
  return Math.round(combinedMood - 50);
}

/**
 * Check if market is in crash/recovery mode
 */
export async function isMarketCrash(): Promise<boolean> {
  const sentiment = await getMarketSentiment();
  return sentiment < 30; // Extreme fear
}

export default {
  getMarketSentiment,
  getTokenPrice,
  getFearGreedIndex,
  getMarketMood,
  isMarketCrash,
};
