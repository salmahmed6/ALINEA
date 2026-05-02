import { Pool } from 'pg';
import CryptoJS from 'crypto-js';

// Initialize Neon connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Database operations with encryption support
 */
export const db = {
  // Get a connection from the pool
  query: async (text: string, params?: unknown[]) => {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error('[DB] Query error:', error);
      throw error;
    }
  },

  // Get a single row
  queryOne: async (text: string, params?: unknown[]) => {
    const result = await pool.query(text, params);
    return result.rows[0];
  },

  // Get multiple rows
  queryMany: async (text: string, params?: unknown[]) => {
    const result = await pool.query(text, params);
    return result.rows;
  },
};

/**
 * Encryption utilities for sensitive data
 */
export const encryption = {
  // Encrypt data using AES
  encrypt: (data: string, key: string = process.env.ENCRYPTION_KEY || 'default-key') => {
    return CryptoJS.AES.encrypt(data, key).toString();
  },

  // Decrypt data
  decrypt: (encryptedData: string, key: string = process.env.ENCRYPTION_KEY || 'default-key') => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  },

  // Hash sensitive data (one-way)
  hash: (data: string) => {
    return CryptoJS.SHA256(data).toString();
  },
};

/**
 * User operations
 */
export const users = {
  // Create user from wallet
  create: async (walletAddress: string, ensMame?: string) => {
    const query = `
      INSERT INTO users (wallet_address, ens_name)
      VALUES ($1, $2)
      ON CONFLICT (wallet_address) DO UPDATE
      SET last_login = CURRENT_TIMESTAMP, is_active = true
      RETURNING id, wallet_address, created_at;
    `;
    return db.queryOne(query, [walletAddress.toLowerCase(), ensMame]);
  },

  // Get user by wallet
  getByWallet: async (walletAddress: string) => {
    const query = 'SELECT * FROM users WHERE wallet_address = $1';
    return db.queryOne(query, [walletAddress.toLowerCase()]);
  },

  // Get user by ID
  getById: async (userId: string) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    return db.queryOne(query, [userId]);
  },

  // Update user archetype
  updateArchetype: async (userId: string, archetype: string) => {
    const query = 'UPDATE users SET archetype = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    return db.queryOne(query, [archetype, userId]);
  },
};

/**
 * Trade history operations
 */
export const trades = {
  // Record a trade
  create: async (
    userId: string,
    tradeData: {
      transactionHash?: string;
      blockchain: string;
      actionType: string;
      tokenIn: string;
      tokenOut: string;
      amountIn: string;
      amountOut: string;
      emotionalScore: number;
      signals: Record<string, number>;
      status: string;
      gasUsed?: string;
    }
  ) => {
    const query = `
      INSERT INTO trade_history 
      (user_id, transaction_hash, blockchain, action_type, token_in, token_out, 
       amount_in, amount_out, emotional_score, signals, status, gas_used)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    return db.queryOne(query, [
      userId,
      tradeData.transactionHash || null,
      tradeData.blockchain,
      tradeData.actionType,
      tradeData.tokenIn,
      tradeData.tokenOut,
      tradeData.amountIn,
      tradeData.amountOut,
      tradeData.emotionalScore,
      JSON.stringify(tradeData.signals),
      tradeData.status,
      tradeData.gasUsed || null,
    ]);
  },

  // Get user's trade history
  getByUserId: async (userId: string, limit = 100) => {
    const query = `
      SELECT * FROM trade_history 
      WHERE user_id = $1 
      ORDER BY timestamp DESC 
      LIMIT $2;
    `;
    return db.queryMany(query, [userId, limit]);
  },

  // Get recent trades for weekly stats
  getWeeklyTrades: async (userId: string) => {
    const query = `
      SELECT * FROM trade_history 
      WHERE user_id = $1 
      AND timestamp > CURRENT_TIMESTAMP - INTERVAL '7 days'
      ORDER BY timestamp DESC;
    `;
    return db.queryMany(query, [userId]);
  },
};

/**
 * Achievement operations
 */
export const achievements = {
  // Award achievement
  award: async (userId: string, achievementType: string, nftContractAddress?: string, nftTokenId?: string) => {
    const query = `
      INSERT INTO achievements (user_id, achievement_type, nft_contract_address, nft_token_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;
    return db.queryOne(query, [userId, achievementType, nftContractAddress || null, nftTokenId || null]);
  },

  // Get user achievements
  getByUserId: async (userId: string) => {
    const query = 'SELECT * FROM achievements WHERE user_id = $1 ORDER BY earned_at DESC';
    return db.queryMany(query, [userId]);
  },
};

/**
 * Session operations
 */
export const sessions = {
  // Create session
  create: async (userId: string, sessionToken: string, expiresAt: Date) => {
    const query = `
      INSERT INTO sessions (user_id, session_token, expires)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    return db.queryOne(query, [userId, sessionToken, expiresAt]);
  },

  // Get session
  getByToken: async (sessionToken: string) => {
    const query = 'SELECT * FROM sessions WHERE session_token = $1 AND expires > CURRENT_TIMESTAMP';
    return db.queryOne(query, [sessionToken]);
  },

  // Delete session
  delete: async (sessionToken: string) => {
    const query = 'DELETE FROM sessions WHERE session_token = $1';
    return db.query(query, [sessionToken]);
  },
};

/**
 * Audit logging
 */
export const auditLog = {
  record: async (
    userId: string,
    action: string,
    details: Record<string, unknown>,
    req?: any
  ) => {
    const query = `
      INSERT INTO audit_logs (user_id, action, ip_address, user_agent, status, details)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    return db.queryOne(query, [
      userId,
      action,
      req?.ip || 'unknown',
      req?.headers?.['user-agent'] || 'unknown',
      'success',
      JSON.stringify(details),
    ]);
  },
};

/**
 * Weekly stats operations
 */
export const weeklyStats = {
  // Update or create weekly stats
  upsert: async (userId: string, weekStart: Date, stats: Record<string, number>) => {
    const query = `
      INSERT INTO weekly_stats 
      (user_id, week_start, total_trades, trades_completed, trades_blocked, avg_emotional_score, success_rate)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, week_start) DO UPDATE SET
        total_trades = $3,
        trades_completed = $4,
        trades_blocked = $5,
        avg_emotional_score = $6,
        success_rate = $7
      RETURNING *;
    `;
    return db.queryOne(query, [
      userId,
      weekStart,
      stats.totalTrades,
      stats.tradesCompleted,
      stats.tradesBlocked,
      stats.avgEmotionalScore,
      stats.successRate,
    ]);
  },

  // Get weekly stats
  getByUserId: async (userId: string) => {
    const query = `
      SELECT * FROM weekly_stats 
      WHERE user_id = $1 
      ORDER BY week_start DESC 
      LIMIT 12;
    `;
    return db.queryMany(query, [userId]);
  },
};

export default db;
