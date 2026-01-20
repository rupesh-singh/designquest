import Link from 'next/link';
import { ArrowRight, FileSearch, Shield, Briefcase, AlertTriangle, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(217,119,6,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(217,119,6,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
        
        {/* Red alert glow - more subtle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-700/8 blur-[150px] rounded-full" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="text-center">
            {/* Alert badge */}
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/30 text-red-500 px-4 py-2 rounded-full text-sm font-mono mb-8 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>CRITICAL INCIDENT DETECTED</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="text-white">Systems Are </span>
              <span className="text-red-600">Failing.</span>
              <br />
              <span className="text-neutral-500">Can You Solve It?</span>
            </h1>
            <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Real incidents. Real pressure. Servers crashing, databases melting, 
              users screaming. Step into the chaos and fix what's broken.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-amber-600 text-white hover:bg-amber-500 glow-amber">
                  Accept First Mission
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Continue Investigation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-600 font-mono text-sm tracking-widest mb-4">PROTOCOL</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              No textbooks. No lectures. Just you, a broken system, and a deadline.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              icon={<Briefcase className="w-6 h-6" />}
              title="Get Briefed"
              description="You receive an urgent incident report. Something's wrong. Users are affected. The clock is ticking."
            />
            <StepCard
              number="02"
              icon={<FileSearch className="w-6 h-6" />}
              title="Investigate"
              description="Analyze the situation. Consider the trade-offs. Every decision has consequences."
            />
            <StepCard
              number="03"
              icon={<Shield className="w-6 h-6" />}
              title="Resolve"
              description="Implement your solution. Learn why it works—or doesn't. Build real intuition."
            />
          </div>
        </div>
      </section>

      {/* Cases Preview */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-red-600 font-mono text-sm tracking-widest mb-4">CLASSIFIED</p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Active Case Files
            </h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Each case teaches you something different. Some are straightforward. 
              Others will make you question everything.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CaseCard 
              caseNumber="001" 
              title="The Meltdown" 
              description="Database at 95% CPU. 50,000 requests per minute. Your startup just went viral—and it's dying."
              tag="Caching"
              severity="critical"
            />
            <CaseCard 
              caseNumber="002" 
              title="Single Point of Failure" 
              description="One server down. Entire platform offline. 2 million users can't access their data."
              tag="Load Balancing"
              severity="high"
            />
            <CaseCard 
              caseNumber="003" 
              title="The Growing Pains" 
              description="Your database was fine at 1M rows. Now you have 100M. Queries that took 50ms now take 30 seconds."
              tag="Database Scaling"
              severity="medium"
            />
            <CaseCard 
              caseNumber="004" 
              title="The Traffic Spike" 
              description="A celebrity tweeted about your app. Traffic is 100x normal. Your credit card is on fire."
              tag="Auto-scaling"
              locked
            />
            <CaseCard 
              caseNumber="005" 
              title="The Consistency Problem" 
              description="User updated their profile. Some servers show the old data. Some show new. Chaos ensues."
              tag="Distributed Systems"
              locked
            />
            <CaseCard 
              caseNumber="006" 
              title="The DDoS Attack" 
              description="Millions of requests from suspicious IPs. Legitimate users can't get through. You have 10 minutes."
              tag="Rate Limiting"
              locked
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-600/5 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-600/10 border border-amber-600/30 text-amber-500 px-4 py-2 rounded-full text-sm font-mono mb-8">
            <Zap className="w-4 h-4" />
            <span>INCIDENT REPORTED</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Your First Case Awaits</h2>
          <p className="text-neutral-400 mb-10 text-lg">
            No sign-up speeches. No credit card. Just pick a case and start solving.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-amber-600 text-white hover:bg-amber-500 glow-amber">
              Begin Investigation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="flex items-center justify-center gap-2 text-neutral-500">
            <span className="text-xl">🔍</span>
            <span className="font-semibold text-neutral-300">DesignQuest</span>
            <span>• System Design Through Crisis</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center p-8 rounded-xl bg-[#141414] border border-neutral-800 hover:border-neutral-700 transition-all">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-600/10 border border-amber-600/30 mb-6 relative">
        <span className="text-amber-500">{icon}</span>
        <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-full">
          {number}
        </span>
      </div>
      <h3 className="font-semibold text-lg text-white mb-2">{title}</h3>
      <p className="text-neutral-400">{description}</p>
    </div>
  );
}

function CaseCard({ caseNumber, title, description, tag, locked, severity }: { 
  caseNumber: string; 
  title: string; 
  description: string; 
  tag: string;
  locked?: boolean;
  severity?: 'critical' | 'high' | 'medium';
}) {
  const severityColors = {
    critical: 'bg-red-600/20 text-red-500 border-red-600/30',
    high: 'bg-orange-600/20 text-orange-500 border-orange-600/30',
    medium: 'bg-yellow-600/20 text-yellow-500 border-yellow-600/30',
  };

  return (
    <div className={`bg-[#141414] rounded-lg p-6 border border-neutral-800 hover:border-neutral-700 transition-all group ${locked ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-neutral-500">CASE #{caseNumber}</span>
        {severity && !locked ? (
          <span className={`text-xs px-2 py-1 rounded border ${severityColors[severity]}`}>
            {severity.toUpperCase()}
          </span>
        ) : (
          <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded">{tag}</span>
        )}
      </div>
      <h3 className="font-semibold text-white mb-2 group-hover:text-amber-500 transition-colors">{title}</h3>
      <p className="text-sm text-neutral-400 mb-4">{description}</p>
      {locked ? (
        <div className="flex items-center gap-2 text-neutral-500 font-mono text-xs">
          <Lock className="w-3 h-3" />
          <span>CLASSIFIED</span>
        </div>
      ) : (
        <div className="text-xs text-amber-600 font-mono">{tag}</div>
      )}
    </div>
  );
}
