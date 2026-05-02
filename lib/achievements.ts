/**
 * Achievement NFT System for ALINEA
 * Mints ERC-721 NFTs when users hit trading milestones
 */

import { ethers } from 'ethers';
import { achievements, auditLog } from '@/lib/db';

// Achievement definitions
export const ACHIEVEMENTS = {
  zen_master: {
    name: 'Zen Master',
    description: 'Maintained emotional score below 30 for 4 consecutive weeks',
    condition: 'avgEmotionalScore < 30 for 4 weeks',
  },
  strategic_trader: {
    name: 'Strategic Trader',
    description: 'Success rate above 80% with at least 50 trades',
    condition: 'successRate >= 80 && totalTrades >= 50',
  },
  consistency_king: {
    name: 'Consistency King',
    description: 'Made at least 100 trades in a single month',
    condition: 'monthlyTrades >= 100',
  },
  market_sense: {
    name: 'Market Sense',
    description: 'Avoided 10 high-risk trades (score > 70) correctly',
    condition: 'blockedHighRiskTrades >= 10',
  },
  perfect_week: {
    name: 'Perfect Week',
    description: 'Emotional score below 20 for an entire week',
    condition: 'weeklyAvgScore < 20',
  },
  guardian_angel: {
    name: 'Guardian Angel',
    description: 'Saved $10,000+ in avoided losses (blocked trades)',
    condition: 'blockedTradeValue >= 10000',
  },
  speed_racer: {
    name: 'Speed Racer',
    description: 'Completed 50 trades in 24 hours',
    condition: 'tradesIn24hrs >= 50',
  },
  fearless: {
    name: 'Fearless',
    description: 'Completed 10 consecutive trades with low emotional scores',
    condition: '10 consecutive trades with score < 40',
  },
};

interface AchievementCheckResult {
  achieved: boolean;
  type: keyof typeof ACHIEVEMENTS;
  message: string;
}

/**
 * Check if user qualifies for achievement
 */
export async function checkAchievements(userId: string, stats: any): Promise<AchievementCheckResult[]> {
  const results: AchievementCheckResult[] = [];

  // Zen Master: Low average emotional score
  if (stats.avgEmotionalScore < 30) {
    results.push({
      achieved: true,
      type: 'zen_master',
      message: 'You maintained exceptional emotional discipline!',
    });
  }

  // Strategic Trader: High success rate with volume
  if (stats.successRate >= 80 && stats.totalTrades >= 50) {
    results.push({
      achieved: true,
      type: 'strategic_trader',
      message: 'Your trading strategy is proven effective!',
    });
  }

  // Consistency King: High trading volume
  if (stats.totalTrades >= 100) {
    results.push({
      achieved: true,
      type: 'consistency_king',
      message: 'Your trading consistency is remarkable!',
    });
  }

  // Market Sense: Successfully avoided high-risk trades
  if (stats.tradesBlocked >= 10) {
    results.push({
      achieved: true,
      type: 'market_sense',
      message: 'Your risk awareness has protected you!',
    });
  }

  // Perfect Week: Very low emotional score
  if (stats.weeklyAvgScore < 20) {
    results.push({
      achieved: true,
      type: 'perfect_week',
      message: 'You achieved perfect emotional alignment this week!',
    });
  }

  return results;
}

/**
 * Mint NFT achievement (requires connected wallet and contract)
 */
export async function mintAchievementNFT(
  userId: string,
  achievementType: keyof typeof ACHIEVEMENTS,
  recipientAddress: string
): Promise<{ success: boolean; txHash?: string; tokenId?: string }> {
  try {
    // Get achievement details
    const achievement = ACHIEVEMENTS[achievementType];
    if (!achievement) {
      throw new Error(`Unknown achievement type: ${achievementType}`);
    }

    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.NFT_MINTER_PRIVATE_KEY || '', provider);

    // NFT contract ABI (simplified ERC-721)
    const contractABI = [
      'function mint(address to, string memory uri) public returns (uint256)',
      'function balanceOf(address owner) public view returns (uint256)',
    ];

    const contract = new ethers.Contract(
      process.env.NFT_CONTRACT_ADDRESS || '',
      contractABI,
      signer
    );

    // Create metadata URI
    const metadata = {
      name: achievement.name,
      description: achievement.description,
      image: `${process.env.NEXT_PUBLIC_APP_URL}/achievements/${achievementType}.png`,
      attributes: [
        { trait_type: 'Type', value: achievementType },
        { trait_type: 'Earned At', value: new Date().toISOString() },
      ],
    };

    const metadataJSON = JSON.stringify(metadata);
    const metadataURI = `data:application/json;base64,${Buffer.from(metadataJSON).toString('base64')}`;

    // Mint NFT
    const tx = await contract.mint(recipientAddress, metadataURI);
    const receipt = await tx.wait();

    // Extract token ID from receipt
    const tokenId = receipt?.logs[0]?.topics[3];

    // Record achievement in database
    await achievements.award(userId, achievementType, process.env.NFT_CONTRACT_ADDRESS, tokenId);

    // Log achievement
    await auditLog.record(userId, `ACHIEVEMENT_UNLOCKED_${achievementType.toUpperCase()}`, {
      achievementType,
      nftTxHash: tx.hash,
      nftTokenId: tokenId,
      recipientAddress,
      timestamp: new Date().toISOString(),
    });

    console.log(`[NFT] Minted ${achievementType} NFT:`, tx.hash);

    return {
      success: true,
      txHash: tx.hash,
      tokenId,
    };
  } catch (error) {
    console.error('[NFT] Minting error:', error);
    return {
      success: false,
    };
  }
}

/**
 * Get user's achievements
 */
export async function getUserAchievements(userId: string) {
  try {
    const userAchievements = await achievements.getByUserId(userId);
    return userAchievements.map((ach: any) => ({
      type: ach.achievement_type,
      name: ACHIEVEMENTS[ach.achievement_type as keyof typeof ACHIEVEMENTS]?.name,
      nftTxHash: ach.nft_contract_address,
      nftTokenId: ach.nft_token_id,
      earnedAt: ach.earned_at,
    }));
  } catch (error) {
    console.error('[Achievement] Error fetching user achievements:', error);
    return [];
  }
}

export default {
  ACHIEVEMENTS,
  checkAchievements,
  mintAchievementNFT,
  getUserAchievements,
};
