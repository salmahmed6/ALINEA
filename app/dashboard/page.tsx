'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlineaLogo } from '@/components/alinea-logo';
import { useWallet } from '@/hooks/use-wallet';
import { getUserProfile, getUserStats, getWeeklyTrends } from '@/lib/storage';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, Settings, Zap } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { address, setConnected, setAddress } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      router.push('/');
      return;
    }

    const loadData = () => {
      const userProfile = getUserProfile(address);
      if (userProfile) {
        setProfile(userProfile);
        const userStats = getUserStats(address);
        setStats(userStats);
        const weeklyTrends = getWeeklyTrends(address);
        setTrends(weeklyTrends);
      }
      setIsLoading(false);
    };

    loadData();
  }, [address, router]);

  const handleDisconnect = () => {
    setConnected(false);
    setAddress(null);
    router.push('/');
  };

  if (isLoading || !profile || !stats) {
    return (
      <div className="min-h-screen bg-gradient-dark text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 text-primary mx-auto mb-4 animate-spin">
            <AlineaLogo />
          </div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const archetype = profile.archetype;
  const riskLevel = stats.avgEmotionalScore > 70 ? 'High' : stats.avgEmotionalScore > 40 ? 'Moderate' : 'Low';

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur animate-fade-in-down">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 text-accent glow-accent">
                <AlineaLogo />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-accent">ALINEA</h1>
                <p className="text-xs text-muted-foreground">Your Emotional Trading Guard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Connected Wallet</p>
                <p className="font-mono font-semibold">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-muted-foreground hover:text-foreground hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Welcome Section */}
          <div className="mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Welcome back</h2>
            <p className="text-lg text-muted-foreground">
              Your archetype: <span className="text-accent font-semibold capitalize">{archetype.replace('-', ' ')}</span>
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {/* Total Trades */}
            <div className="bg-card/40 backdrop-blur border border-accent/30 rounded-xl p-6 hover-lift animate-fade-in-up glow-accent" style={{ animationDelay: '0.1s' }}>
              <p className="text-muted-foreground text-sm mb-2">Total Trades</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{stats.totalTrades}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.tradesCompleted} completed, {stats.tradesBlocked} blocked
              </p>
            </div>

            {/* Success Rate */}
            <div className="bg-card/40 backdrop-blur border border-primary/30 rounded-xl p-6 hover-lift animate-fade-in-up glow-primary" style={{ animationDelay: '0.2s' }}>
              <p className="text-muted-foreground text-sm mb-2">Success Rate</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stats.successRate}%</p>
              <p className="text-xs text-muted-foreground mt-2">Protected by coaching</p>
            </div>

            {/* Avg Emotional Score */}
            <div className="bg-card/40 backdrop-blur border border-secondary/30 rounded-xl p-6 hover-lift animate-fade-in-up glow-primary" style={{ animationDelay: '0.3s' }}>
              <p className="text-muted-foreground text-sm mb-2">Avg Emotional Score</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">{stats.avgEmotionalScore}</p>
              <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
            </div>

            {/* Risk Level */}
            <div className="bg-card/40 backdrop-blur border border-primary/30 rounded-xl p-6 hover-lift animate-fade-in-up glow-primary" style={{ animationDelay: '0.4s' }}>
              <p className="text-muted-foreground text-sm mb-2">Current Risk</p>
              <p
                className={`text-4xl font-bold ${riskLevel === 'High'
                    ? 'text-destructive'
                    : riskLevel === 'Moderate'
                      ? 'text-accent'
                      : 'text-primary'
                  }`}
              >
                {riskLevel}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Based on recent patterns</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* Weekly Score Trend */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Emotional Score Trend (4 Weeks)</h3>
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="date" stroke="#999999" />
                    <YAxis stroke="#999999" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px' }}
                      labelStyle={{ color: '#f5f5f5' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#9d4edd"
                      dot={{ fill: '#9d4edd', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No trades recorded yet</p>
              )}
            </div>

            {/* Trades vs Blocks */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Trades Completed vs Blocked</h3>
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="date" stroke="#999999" />
                    <YAxis stroke="#999999" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333333', borderRadius: '8px' }}
                      labelStyle={{ color: '#f5f5f5' }}
                    />
                    <Bar dataKey="tradesCompleted" fill="#9d4edd" name="Completed" />
                    <Bar dataKey="tradesBlocked" fill="#c77dff" name="Blocked" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No data available</p>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Connect a Web3 wallet to begin intercepting live transactions (mock in MVP)
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Set up your trading strategy preferences in settings
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Review historical trades and learn from patterns
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Track your weekly progress toward better decision-making
              </li>
            </ul>
          </div>

          {/* Test Zone */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Try It Out</h3>
                <p className="text-muted-foreground mb-6">
                  Ready to see ALINEA in action? Simulate a transaction and get real-time emotional scoring + AI coach feedback.
                </p>
                <Button
                  onClick={() => router.push('/test-transaction')}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3"
                >
                  Start Transaction Test
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
