'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlineaLogo } from '@/components/alinea-logo';
import { TransactionInterceptor } from '@/components/transaction-interceptor';
import { useWallet } from '@/hooks/use-wallet';
import { getUserProfile, getTransactions, updateUserStats, saveTransaction } from '@/lib/storage';
import { computeFullEmotionalScore } from '@/lib/signals';
import { EmotionalScore, Transaction, CoachMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function TestTransactionPage() {
  const router = useRouter();
  const { address } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [showInterceptor, setShowInterceptor] = useState(false);
  const [emotionalScore, setEmotionalScore] = useState<EmotionalScore | null>(null);
  const [coachMessage, setCoachMessage] = useState<CoachMessage | null>(null);
  const [transaction, setTransaction] = useState({ to: '0x0000000000000000000000000000000000000001', value: '1.5', type: 'buy' as 'buy' | 'sell' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCoach, setIsLoadingCoach] = useState(false);

  useEffect(() => {
    if (!address) {
      router.push('/');
      return;
    }

    const userProfile = getUserProfile(address);
    if (!userProfile) {
      router.push('/');
      return;
    }
    setProfile(userProfile);
  }, [address, router]);

  const handleSimulateTransaction = async () => {
    if (!profile || !address) return;

    setIsProcessing(true);
    try {
      const pastTransactions = getTransactions(address);
      const score = await computeFullEmotionalScore(
        Math.random() * 300 + 5, // Random seconds (5-305)
        transaction.type,
        parseFloat(transaction.value),
        profile,
        pastTransactions
      );

      setEmotionalScore(score);
      setShowInterceptor(true);

      // Fetch coach message
      setIsLoadingCoach(true);
      try {
        const coachResponse = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emotionalScore: score,
            userArchetype: profile.archetype,
            recentTrades: pastTransactions.slice(-5),
          }),
        });

        if (coachResponse.ok) {
          const coachData = await coachResponse.json();
          setCoachMessage(coachData);
        }
      } catch (error) {
        console.error('[v0] Coach fetch error:', error);
      } finally {
        setIsLoadingCoach(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmTransaction = () => {
    if (!profile || !address || !emotionalScore) return;

    const newTransaction: Transaction = {
      from: address,
      to: transaction.to,
      value: transaction.value,
      timestamp: Date.now(),
      emotionalScore,
      userAction: 'confirmed',
    };

    saveTransaction(address, newTransaction);
    updateUserStats(address, emotionalScore.score, 'confirmed');

    setShowInterceptor(false);
    setCoachMessage(null);

    // Show success message
    alert('Transaction recorded! Check your dashboard to see the impact.');
  };

  const handleCancelTransaction = () => {
    if (!profile || !address || !emotionalScore) return;

    const newTransaction: Transaction = {
      from: address,
      to: transaction.to,
      value: transaction.value,
      timestamp: Date.now(),
      emotionalScore,
      userAction: 'cancelled',
    };

    saveTransaction(address, newTransaction);
    updateUserStats(address, emotionalScore.score, 'cancelled');

    setShowInterceptor(false);
    setCoachMessage(null);

    alert('Transaction cancelled. Good decision-making!');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 text-accent">
              <AlineaLogo />
            </div>
            <h1 className="text-xl font-bold">Test Transaction</h1>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-lg p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Simulate a Transaction</h2>
            <p className="text-muted-foreground">
              Test ALINEA&apos;s real-time emotional scoring and AI coach. Fill in transaction details and hit simulate.
            </p>
          </div>

          <div className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-semibold mb-3">Transaction Type</label>
              <div className="flex gap-4">
                {(['buy', 'sell'] as const).map((type) => (
                  <Button
                    key={type}
                    onClick={() => setTransaction({ ...transaction, type })}
                    variant={transaction.type === type ? 'default' : 'outline'}
                    className="flex-1 capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold mb-3">Amount</label>
              <Input
                type="text"
                value={transaction.value}
                onChange={(e) => setTransaction({ ...transaction, value: e.target.value })}
                placeholder="1.5 ETH"
                className="bg-muted border-border"
              />
            </div>

            {/* To Address */}
            <div>
              <label className="block text-sm font-semibold mb-3">To Address</label>
              <Input
                type="text"
                value={transaction.to}
                onChange={(e) => setTransaction({ ...transaction, to: e.target.value })}
                placeholder="0x..."
                className="bg-muted border-border font-mono"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              Your profile: <span className="font-semibold capitalize">{profile.archetype.replace('-', ' ')}</span>
            </p>
            <p>
              Past trades: <span className="font-semibold">{profile.tradesCompleted + profile.tradesBlocked}</span>
            </p>
          </div>

          {/* CTA */}
          <Button
            onClick={handleSimulateTransaction}
            disabled={isProcessing}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
          >
            {isProcessing ? 'Analyzing...' : 'Simulate Transaction'}
          </Button>
        </div>
      </div>

      {/* Interceptor Modal */}
      {showInterceptor && emotionalScore && (
        <TransactionInterceptor
          emotionalScore={emotionalScore}
          transaction={transaction}
          onConfirm={handleConfirmTransaction}
          onCancel={handleCancelTransaction}
          coachMessage={coachMessage || undefined}
          isLoading={isLoadingCoach}
        />
      )}
    </div>
  );
}
