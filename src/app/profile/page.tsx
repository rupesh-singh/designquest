'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { 
  User, 
  Trophy, 
  Target, 
  Calendar, 
  Flame, 
  Award,
  Shield,
  FileSearch
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuthStore();
  const [stats, setStats] = useState<{
    totalSolved: number;
    totalCases: number;
    moduleProgress: { title: string; completed: number; total: number }[];
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/modules');
        const data = await res.json();
        const modules = data.modules || [];
        const progress = data.progress || {};

        let totalSolved = 0;
        let totalCases = 0;
        const moduleProgress: { title: string; completed: number; total: number }[] = [];

        modules.forEach((m: { id: string; title: string }) => {
          const p = progress[m.id] || { completed: 0, total: 0 };
          totalSolved += p.completed;
          totalCases += p.total;
          if (p.total > 0) {
            moduleProgress.push({ title: m.title, completed: p.completed, total: p.total });
          }
        });

        setStats({ totalSolved, totalCases, moduleProgress });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    }

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Calculate level progress (simple formula: 100 XP per level)
  const xpForCurrentLevel = (user.level - 1) * 100;
  const xpForNextLevel = user.level * 100;
  const xpProgress = user.xpPoints - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const levelProgressPercent = (xpProgress / xpNeeded) * 100;

  // Get rank title based on level
  const getRankTitle = (level: number) => {
    if (level >= 20) return { title: 'Chief Architect', icon: '👑' };
    if (level >= 15) return { title: 'Senior Investigator', icon: '🎖️' };
    if (level >= 10) return { title: 'Lead Detective', icon: '🔰' };
    if (level >= 5) return { title: 'Field Agent', icon: '🔍' };
    return { title: 'Junior Agent', icon: '📋' };
  };

  const rank = getRankTitle(user.level);
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <p className="text-amber-600 font-mono text-sm tracking-wider mb-1">AGENT DOSSIER</p>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
      </div>

      {/* Agent Card */}
      <Card className="mb-6 bg-gradient-to-r from-[#1a1a1a] to-[#141414] border-l-4 border-l-amber-600">
        <CardContent className="py-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-amber-600/20 border-2 border-amber-600/50 flex items-center justify-center text-4xl">
              {rank.icon}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {user.displayName || user.username}
                </h2>
                <span className="bg-amber-600/20 text-amber-500 px-2 py-0.5 rounded text-xs font-mono">
                  LVL {user.level}
                </span>
              </div>
              <p className="text-amber-600 font-medium mb-3">{rank.title}</p>
              
              {/* Level Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-400">Level Progress</span>
                  <span className="text-neutral-500">{xpProgress} / {xpNeeded} XP</span>
                </div>
                <ProgressBar value={levelProgressPercent} max={100} color="amber" />
              </div>

              <p className="text-neutral-500 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Agent since {memberSince}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Trophy className="w-5 h-5 text-amber-500" />}
          label="Total XP"
          value={user.xpPoints.toLocaleString()}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-emerald-500" />}
          label="Cases Solved"
          value={stats?.totalSolved.toString() || '0'}
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-red-500" />}
          label="Current Streak"
          value={`${user.currentStreak} days`}
        />
        <StatCard
          icon={<Award className="w-5 h-5 text-purple-500" />}
          label="Best Streak"
          value={`${user.longestStreak} days`}
        />
      </div>

      {/* Case Progress */}
      <Card className="bg-[#141414]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-white">Case File Progress</h3>
          </div>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-neutral-800 rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-neutral-800 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : stats && stats.moduleProgress.length > 0 ? (
            <div className="space-y-4">
              {stats.moduleProgress.map((module, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-300">{module.title}</span>
                    <span className="text-neutral-500">
                      {module.completed} / {module.total}
                    </span>
                  </div>
                  <ProgressBar 
                    value={(module.completed / module.total) * 100} 
                    max={100} 
                    color={module.completed === module.total ? 'emerald' : 'amber'} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400">No case files started yet.</p>
              <p className="text-neutral-500 text-sm">Head to Cases to begin your first investigation.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="bg-[#141414]">
      <CardContent className="py-4 text-center">
        <div className="flex justify-center mb-2">{icon}</div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-neutral-500 text-sm">{label}</p>
      </CardContent>
    </Card>
  );
}
