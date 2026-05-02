'use client';

import { useState, useEffect } from 'react';
import { EmotionalScore, CoachMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

interface TransactionInterceptorProps {
  emotionalScore: EmotionalScore;
  transaction: {
    to: string;
    value: string;
    type: 'buy' | 'sell';
  };
  onConfirm: () => void;
  onCancel: () => void;
  coachMessage?: CoachMessage;
  isLoading?: boolean;
}

export function TransactionInterceptor({
  emotionalScore,
  transaction,
  onConfirm,
  onCancel,
  coachMessage,
  isLoading = false,
}: TransactionInterceptorProps) {
  const [coachLoading, setCoachLoading] = useState(!coachMessage);

  useEffect(() => {
    setCoachLoading(!coachMessage);
  }, [coachMessage]);

  const getLevelColor = (level: 'clean' | 'yellow' | 'orange' | 'block') => {
    switch (level) {
      case 'clean':
        return { 
          bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10', 
          border: 'border-green-500/50', 
          icon: 'text-green-500', 
          text: 'text-green-500',
          glow: 'glow-[0_0_20px_rgba(34,197,94,0.3)]'
        };
      case 'yellow':
        return { 
          bg: 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10', 
          border: 'border-yellow-500/50', 
          icon: 'text-yellow-500', 
          text: 'text-yellow-500',
          glow: 'shadow-lg shadow-yellow-500/20'
        };
      case 'orange':
        return { 
          bg: 'bg-gradient-to-br from-orange-500/10 to-red-500/10', 
          border: 'border-orange-500/50', 
          icon: 'text-orange-500', 
          text: 'text-orange-500',
          glow: 'shadow-lg shadow-orange-500/20'
        };
      case 'block':
        return { 
          bg: 'bg-gradient-to-br from-destructive/10 to-red-500/10', 
          border: 'border-destructive/50', 
          icon: 'text-destructive', 
          text: 'text-destructive',
          glow: 'shadow-lg shadow-destructive/30'
        };
    }
  };

  const colors = getLevelColor(emotionalScore.level);

  const signalEntries = Object.entries(emotionalScore.signals).map(([key, value]) => ({
    label: key.replace(/([A-Z])/g, ' $1').trim(),
    value: Math.round(value),
  }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className={`bg-gradient-dark border ${colors.border} rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto hover-lift animate-fade-in-up ${colors.glow}`}>
        {/* Header */}
        <div className={`${colors.bg} border-b ${colors.border} p-6 animate-slide-in-down`}>
          <div className="flex items-start gap-4">
            <div className={`${colors.icon} animate-bounce`}>
              {emotionalScore.level === 'clean' ? (
                <CheckCircle className="w-8 h-8" />
              ) : emotionalScore.level === 'block' ? (
                <XCircle className="w-8 h-8" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                Emotional Transaction Check
              </h2>
              <p className="text-muted-foreground">
                Before you confirm, here's what ALINEA detected
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Score Display */}
          <div className="text-center animate-slide-in-right">
            <div className="mb-4">
              <div className={`text-6xl font-bold bg-gradient-to-r ${
                emotionalScore.level === 'clean' ? 'from-green-400 to-emerald-400' :
                emotionalScore.level === 'yellow' ? 'from-yellow-400 to-amber-400' :
                emotionalScore.level === 'orange' ? 'from-orange-400 to-red-400' :
                'from-red-500 to-destructive'
              } bg-clip-text text-transparent mb-2 animate-pulse-glow`}>
                {emotionalScore.score}
              </div>
              <div className={`text-xl font-semibold capitalize ${colors.text}`}>
                {emotionalScore.level} Risk
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              {emotionalScore.level === 'clean'
                ? 'Your emotional state is aligned. This trade looks sound.'
                : emotionalScore.level === 'yellow'
                  ? 'Some caution flags detected. Consider pausing.'
                  : emotionalScore.level === 'orange'
                    ? 'Significant emotional signals. Reconsider this trade.'
                    : 'Very high risk indicators. This trade is blocked.'}
            </p>
          </div>

          {/* Signal Breakdown */}
          <div className="space-y-3 animate-slide-in-left">
            <h3 className="font-semibold text-lg">Behavioral Signal Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              {signalEntries.map((signal, idx) => (
                <div key={signal.label} className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20 hover-lift hover:border-primary/50" style={{ animationDelay: `${0.05 * idx}s` }}>
                  <p className="text-xs text-muted-foreground mb-2 capitalize">{signal.label}</p>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-primary">{signal.value}</div>
                    <div className="text-xs text-muted-foreground">/100</div>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-1.5 mt-3 overflow-hidden border border-primary/20">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500 shadow-lg shadow-primary/50"
                      style={{ width: `${signal.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Coach Message */}
          <div className="bg-muted/30 border border-border rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <h3 className="font-semibold">Your Coach Says</h3>
            </div>
            {coachLoading ? (
              <p className="text-muted-foreground italic">Listening to your coach...</p>
            ) : coachMessage ? (
              <p className="text-lg leading-relaxed">{coachMessage.message}</p>
            ) : (
              <p className="text-muted-foreground">Unable to reach coach. Proceed with caution.</p>
            )}
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6 animate-fade-in-up">
            <h3 className="font-semibold">Transaction Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Action:</span>
                <span className="font-semibold capitalize text-primary">{transaction.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-mono text-accent">{transaction.value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To:</span>
                <span className="font-mono text-xs text-foreground/70">{transaction.to.slice(0, 10)}...{transaction.to.slice(-8)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border/50 p-6 flex gap-4 bg-gradient-dark/50 animate-slide-in-up">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
            className="flex-1 py-6 text-base border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-smooth"
          >
            Cancel Transaction
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || emotionalScore.level === 'block'}
            className="flex-1 bg-gradient-primary hover:shadow-lg hover:shadow-primary/50 text-primary-foreground py-6 text-base rounded-lg transition-smooth hover-lift relative overflow-hidden group"
          >
            <span className="relative z-10">{isLoading ? 'Processing...' : 'Confirm Transaction'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-smooth"></div>
          </Button>
        </div>

        {emotionalScore.level === 'block' && (
          <div className="border-t border-border p-6 bg-gradient-to-r from-destructive/10 to-red-500/10 text-center text-sm text-destructive font-semibold animate-pulse">
            ⚠️ This transaction is blocked due to high emotional risk. Please wait and reconsider.
          </div>
        )}
      </div>
    </div>
  );
}
