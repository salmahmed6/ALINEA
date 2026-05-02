'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlineaLogo } from '@/components/alinea-logo';
import { useWallet } from '@/hooks/use-wallet';
import { UserProfile, UserArchetype } from '@/lib/types';
import { saveUserProfile } from '@/lib/storage';
import { ArrowRight } from 'lucide-react';

const ARCHETYPES: Record<UserArchetype, { title: string; description: string; traits: string[] }> = {
  'calm-authority': {
    title: 'Calm Authority',
    description: 'Steady, experienced, composed. You trust your process and execute with confidence.',
    traits: ['Structured', 'Experienced', 'Disciplined', 'Measured'],
  },
  'radical-honesty': {
    title: 'Radical Honesty',
    description: 'Direct, no-nonsense, brutally truthful. You value clarity above comfort.',
    traits: ['Direct', 'Honest', 'Bold', 'Pragmatic'],
  },
  'deep-respect': {
    title: 'Deep Respect',
    description: 'Humble, respectful, autonomous. You honor the journey and trust your intuition.',
    traits: ['Respectful', 'Humble', 'Intuitive', 'Autonomous'],
  },
  'premium-intelligence': {
    title: 'Premium Intelligence',
    description: 'Sharp, sophisticated, nuanced. You understand complexity and thrive on precision.',
    traits: ['Intellectual', 'Sophisticated', 'Analytical', 'Precise'],
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { address } = useWallet();
  const { setUserProfile } = useWallet();
  const [selectedArchetype, setSelectedArchetype] = useState<UserArchetype | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!address) {
    router.push('/');
    return null;
  }

  const handleSelectArchetype = async () => {
    if (!selectedArchetype || !address) return;

    setIsLoading(true);
    try {
      const profile: UserProfile = {
        id: address,
        archetype: selectedArchetype,
        walletAddress: address,
        createdAt: Date.now(),
        emotionalScoreHistory: [],
        tradesCompleted: 0,
        tradesBlocked: 0,
      };

      saveUserProfile(profile);
      setUserProfile(profile);

      // Redirect to dashboard
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground flex flex-col px-4 py-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto w-full mb-16 animate-fade-in-down">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 text-accent glow-accent animate-float">
              <AlineaLogo />
            </div>
            <span className="text-xl font-semibold text-accent">ALINEA</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto w-full flex-1">
          {/* Title */}
          <div className="mb-16 animate-fade-in-up">
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Know Yourself. Align Your Decisions.
            </h1>
            <p className="text-lg text-muted-foreground">
              Select your investor archetype. ALINEA uses this to personalize your coaching voice.
            </p>
          </div>

          {/* Archetype Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {(Object.keys(ARCHETYPES) as UserArchetype[]).map((archetype, idx) => {
              const info = ARCHETYPES[archetype];
              const isSelected = selectedArchetype === archetype;

              return (
                <button
                  key={archetype}
                  onClick={() => setSelectedArchetype(archetype)}
                  className={`p-8 rounded-xl border-2 transition-smooth text-left hover-lift animate-fade-in-up ${
                    isSelected
                      ? 'bg-gradient-primary/10 border-primary shadow-lg glow-primary'
                      : 'bg-card/40 backdrop-blur border-border/50 hover:border-primary/50 hover:glow-primary'
                  }`}
                  style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
                >
                  {/* Title & Description */}
                  <h3 className={`text-xl font-semibold mb-2 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {info.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {info.description}
                  </p>

                  {/* Traits */}
                  <div className="flex flex-wrap gap-2">
                    {info.traits.map((trait) => (
                      <span
                        key={trait}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth ${
                          isSelected
                            ? 'bg-gradient-to-r from-primary to-accent text-white'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="mt-6 flex items-center gap-2 text-accent font-semibold animate-slide-in-right">
                      <span>Selected</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex gap-4 animate-fade-in-up">
            <Button
              onClick={handleSelectArchetype}
              disabled={!selectedArchetype || isLoading}
              className="bg-gradient-primary hover:shadow-lg hover:shadow-primary/50 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-lg transition-smooth hover-lift relative overflow-hidden group"
            >
              <span className="relative z-10">{isLoading ? 'Creating Profile...' : 'Continue to Dashboard'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-smooth"></div>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="px-8 py-6 text-lg border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-smooth"
            >
              Back
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-muted-foreground text-center mt-16 animate-fade-in-up">
          <p>Your archetype can be changed anytime in dashboard settings.</p>
        </div>
      </div>
    </div>
  );
}
