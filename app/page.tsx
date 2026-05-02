'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlineaLogo } from '@/components/alinea-logo';
import { useWalletConnect } from '@/hooks/use-wallet';
import { useWallet } from '@/hooks/use-wallet';
import { Zap, Brain, TrendingDown } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { connect } = useWalletConnect();
  const { address, isConnected } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const addr = await connect();
      if (addr) {
        // Redirect to onboarding
        router.push('/onboarding');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Header with Logo and Text */}
        <div className="absolute top-8 left-8 flex items-center gap-2 animate-fade-in-down">
          <div className="w-8 h-8 text-accent glow-accent animate-float">
            <AlineaLogo />
          </div>
          <span className="text-xl font-semibold text-accent">ALINEA</span>
        </div>

        {/* Hero Section */}
        <div className="max-w-2xl mx-auto text-center mb-16 pt-20">
          {/* Main Title */}
          <h1 className="text-7xl font-bold mb-4 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-black to-accent">
              ALINEA
            </span>
          </h1>
          <p className="text-2xl text-accent mb-8 font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Align your mind. Align your money.
          </p>
          <p className="text-lg text-foreground/90 mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Emotional trading costs you 75% of your potential gains. ALINEA is your cognitive coach—
            intercepting risky trades before they happen and guiding you toward smarter decisions with
            real-time behavioral analysis powered by AI.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              size="lg"
              className="bg-gradient-primary hover:shadow-2xl text-primary-foreground px-8 py-6 text-lg font-semibold rounded-lg transition-smooth hover-lift relative overflow-hidden group"
            >
              <span className="relative z-10">{isConnecting ? 'Connecting...' : 'Connect Wallet to Begin'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-smooth"></div>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mt-24 mb-16">
          <div
            className="bg-card/40 backdrop-blur border border-primary/30 rounded-xl p-8 hover-lift animate-fade-in-up glow-primary"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4 text-white shadow-lg">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary">Behavioral Analysis</h3>
            <p className="text-muted-foreground text-sm">
              6 psychological signals tracked in real-time. Speed, timing, history, frequency, and more.
            </p>
          </div>

          <div
            className="bg-card/40 backdrop-blur border border-accent/30 rounded-xl p-8 hover-lift animate-fade-in-up glow-accent"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center mb-4 text-white shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-accent">AI Coach</h3>
            <p className="text-muted-foreground text-sm">
              Claude-powered guidance tuned to your personality. Supportive, cautionary, or blocking.
            </p>
          </div>

          <div
            className="bg-card/40 backdrop-blur border border-secondary/30 rounded-xl p-8 hover-lift animate-fade-in-up glow-primary"
            style={{ animationDelay: '0.7s' }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center mb-4 text-white shadow-lg">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-secondary">Decision Protection</h3>
            <p className="text-muted-foreground text-sm">
              Pre-transaction interception. See your score before you commit. Cancel or confirm.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-20 pb-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <p className="text-accent">ALINEA — Cognitive Trading Guard</p>
        </div>
      </div>
    </div>
  );
}
