import { auth } from '@/auth';
import { trades, users, auditLog } from '@/lib/db';
import { computeEmotionalScore } from '@/lib/signals';
import { getMarketMood } from '@/lib/coingecko';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import rateLimit from '@/lib/rate-limit';

/**
 * Validate transaction request
 */
const transactionSchema = z.object({
  blockchain: z.enum(['ethereum', 'polygon', 'base', 'arbitrum']),
  actionType: z.string().min(1),
  tokenIn: z.string().min(1),
  tokenOut: z.string().min(1),
  amountIn: z.string().regex(/^\d+(\.\d+)?$/),
  amountOut: z.string().regex(/^\d+(\.\d+)?$/),
  transactionHash: z.string().optional(),
});

/**
 * Rate limiter (using Redis in production)
 */
const limiter = rateLimit.createLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // 500 unique IPs
});

/**
 * Middleware: Verify auth token
 */
async function verifyAuth(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

/**
 * Middleware: Check rate limit
 */
async function checkRateLimit(ip: string, userId: string) {
  try {
    const key = `${userId}:${ip}`;
    const limit = await limiter.check(key, 100); // 100 requests per minute

    if (!limit.success) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('[RateLimit] Error:', error);
    return true; // Allow on error
  }
}

/**
 * POST /api/transactions/analyze
 * Analyze a transaction and compute emotional score
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const withinLimit = await checkRateLimit(ip, user.id);
    if (!withinLimit) {
      await auditLog.record(user.id, 'RATE_LIMIT_EXCEEDED', { ip }, request as any);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    // Get market mood for signal analysis
    const marketMood = await getMarketMood();

    // Compute emotional score
    const emotionalScore = await computeEmotionalScore({
      ...validatedData,
      marketMood,
    });

    // Record trade in database
    const trade = await trades.create(user.id, {
      blockchain: validatedData.blockchain,
      actionType: validatedData.actionType,
      tokenIn: validatedData.tokenIn,
      tokenOut: validatedData.tokenOut,
      amountIn: validatedData.amountIn,
      amountOut: validatedData.amountOut,
      emotionalScore: emotionalScore.score,
      signals: emotionalScore.signals,
      status: emotionalScore.level === 'block' ? 'blocked' : 'pending',
      transactionHash: validatedData.transactionHash,
    });

    // Log the analysis
    await auditLog.record(
      user.id,
      'TRANSACTION_ANALYZED',
      {
        tradeId: trade.id,
        score: emotionalScore.score,
        level: emotionalScore.level,
        amountIn: validatedData.amountIn,
      },
      request as any
    );

    return NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        emotionalScore: emotionalScore.score,
        level: emotionalScore.level,
        signals: emotionalScore.signals,
        recommendation: emotionalScore.level === 'block' ? 'CANCEL' : 'CONSIDER',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[TransactionAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transactions/history
 * Get user's transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get transactions
    const userTrades = await trades.getByUserId(user.id, 100);

    return NextResponse.json({
      success: true,
      transactions: userTrades,
      count: userTrades.length,
    });
  } catch (error) {
    console.error('[TransactionHistoryAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
