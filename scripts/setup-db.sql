-- ALINEA Production Database Schema with RLS
-- This schema handles user profiles, trade history, security logs, and achievements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (stores wallet addresses and encrypted metadata)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  ens_name VARCHAR(255),
  archetype VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- User profiles (encrypted sensitive data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  encrypted_settings BYTEA,
  encrypted_preferences BYTEA,
  preferred_language VARCHAR(10) DEFAULT 'en',
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trade history (all user transactions with emotional scores)
CREATE TABLE IF NOT EXISTS trade_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_hash VARCHAR(66),
  blockchain VARCHAR(50) NOT NULL, -- 'ethereum', 'polygon', 'base', 'arbitrum'
  action_type VARCHAR(50) NOT NULL, -- 'swap', 'bridge', 'mint', etc
  token_in VARCHAR(255),
  token_out VARCHAR(255),
  amount_in DECIMAL(38, 18),
  amount_out DECIMAL(38, 18),
  emotional_score INT,
  signals JSONB,
  status VARCHAR(50), -- 'pending', 'completed', 'blocked', 'failed'
  gas_used DECIMAL(38, 18),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Behavioral signals log (detailed signal breakdown for analysis)
CREATE TABLE IF NOT EXISTS signal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES trade_history(id) ON DELETE CASCADE,
  signal_type VARCHAR(50), -- 'speed', 'timing', 'strategy', 'history', 'frequency', 'market_mood'
  signal_value INT,
  weight DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly stats (aggregated weekly metrics)
CREATE TABLE IF NOT EXISTS weekly_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE,
  total_trades INT DEFAULT 0,
  trades_completed INT DEFAULT 0,
  trades_blocked INT DEFAULT 0,
  avg_emotional_score INT,
  success_rate INT,
  best_decision_score INT,
  worst_decision_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start)
);

-- Achievements/Badges
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100), -- 'zen_master', 'strategic_trader', 'consistency_king', etc
  nft_contract_address VARCHAR(42),
  nft_token_id VARCHAR(255),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security audit log (track all sensitive operations)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50), -- 'success', 'failed', 'blocked'
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for NextAuth)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email logs (track sent emails)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_type VARCHAR(50), -- 'weekly_report', 'alert', 'verification', etc
  recipient_email VARCHAR(255),
  status VARCHAR(50), -- 'sent', 'failed', 'bounced'
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_trade_history_user_id ON trade_history(user_id);
CREATE INDEX idx_trade_history_timestamp ON trade_history(timestamp);
CREATE INDEX idx_signal_logs_user_id ON signal_logs(user_id);
CREATE INDEX idx_signal_logs_trade_id ON signal_logs(trade_id);
CREATE INDEX idx_weekly_stats_user_id ON weekly_stats(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid()::UUID = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid()::UUID = id);

-- RLS Policies for user_profiles table
CREATE POLICY "user_profiles_select_own" ON user_profiles FOR SELECT USING (auth.uid()::UUID = user_id);
CREATE POLICY "user_profiles_update_own" ON user_profiles FOR UPDATE USING (auth.uid()::UUID = user_id);

-- RLS Policies for trade_history table
CREATE POLICY "trade_history_select_own" ON trade_history FOR SELECT USING (auth.uid()::UUID = user_id);
CREATE POLICY "trade_history_insert_own" ON trade_history FOR INSERT WITH CHECK (auth.uid()::UUID = user_id);

-- RLS Policies for signal_logs table
CREATE POLICY "signal_logs_select_own" ON signal_logs FOR SELECT USING (auth.uid()::UUID = user_id);

-- RLS Policies for weekly_stats table
CREATE POLICY "weekly_stats_select_own" ON weekly_stats FOR SELECT USING (auth.uid()::UUID = user_id);

-- RLS Policies for achievements table
CREATE POLICY "achievements_select_own" ON achievements FOR SELECT USING (auth.uid()::UUID = user_id);

-- RLS Policies for audit_logs table (users can only see their own audit logs)
CREATE POLICY "audit_logs_select_own" ON audit_logs FOR SELECT USING (auth.uid()::UUID = user_id);

-- RLS Policies for sessions table
CREATE POLICY "sessions_select_own" ON sessions FOR SELECT USING (auth.uid()::UUID = user_id);

-- RLS Policies for email_logs table
CREATE POLICY "email_logs_select_own" ON email_logs FOR SELECT USING (auth.uid()::UUID = user_id);

-- Create materialized view for user stats (for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats_view AS
SELECT 
  u.id,
  u.wallet_address,
  COUNT(DISTINCT th.id) as total_trades,
  COUNT(DISTINCT CASE WHEN th.status = 'completed' THEN th.id END) as trades_completed,
  COUNT(DISTINCT CASE WHEN th.status = 'blocked' THEN th.id END) as trades_blocked,
  ROUND(AVG(th.emotional_score)) as avg_emotional_score,
  ROUND(COUNT(DISTINCT CASE WHEN th.status = 'completed' THEN th.id)::numeric / 
        NULLIF(COUNT(DISTINCT th.id), 0) * 100) as success_rate,
  MAX(th.timestamp) as last_trade,
  u.created_at
FROM users u
LEFT JOIN trade_history th ON u.id = th.user_id
GROUP BY u.id, u.wallet_address, u.created_at;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_user_stats_view_id ON user_stats_view(id);
