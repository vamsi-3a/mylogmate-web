import { Link } from 'react-router-dom';
import {
  Pencil,
  Search,
  Sparkles,
  ArrowRight,
  Check,
  PlayCircle,
  Users,
  Briefcase,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ── Landing Page ──────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] font-sans">
      <StickyNav />
      <Hero />
      <WhatIsIt />
      <HowItWorks />
      <WhoItsFor />
      <WhyLoveIt />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ── Sticky Nav ────────────────────────────────────────────────────────────

function StickyNav() {
  return (
    <nav
      className="sticky top-0 z-40 flex items-center justify-between px-6 sm:px-10 py-4"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(229,231,235,0.6)',
      }}
    >
      <Logo size={22} />

      <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-ink-2">
        <a href="#what" className="hover:text-ink transition-colors">What is it</a>
        <a href="#how" className="hover:text-ink transition-colors">How it works</a>
        <a href="#who" className="hover:text-ink transition-colors">Who it's for</a>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="text-[14px] font-semibold text-ink-2 hover:text-ink transition-colors"
        >
          Log in
        </Link>
        <Link to="/signup">
          <Button size="sm">Sign up free</Button>
        </Link>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
      {/* Eyebrow chip */}
      <div className="inline-flex items-center gap-2 bg-accent-tint border border-accent/25 rounded-full px-4 py-1.5 mb-6">
        <Sparkles size={13} className="text-accent-active" />
        <span className="text-[12.5px] font-semibold text-accent-active">
          AI-powered work logging
        </span>
      </div>

      {/* Logo mark */}
      <div className="flex justify-center mb-4">
        <Logo size={48} showWordmark={false} />
      </div>

      {/* Headline */}
      <h1 className="text-[48px] sm:text-[64px] font-extrabold text-ink dark:text-white leading-[1.05] tracking-heading mb-3">
        MyLogMate
      </h1>
      <p className="text-[22px] sm:text-[26px] font-bold italic text-ink-2 mb-5"
        style={{ letterSpacing: '-0.01em' }}>
        Log once. Recall anytime.
      </p>
      <p className="text-[16px] text-ink-2 max-w-xl mx-auto leading-relaxed mb-8 text-pretty">
        Document your daily work in seconds, tag it, and let AI surface exactly what you
        need when it's review time — for yourself, your team, or your projects.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
        <Link to="/signup">
          <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
            Start logging free
          </Button>
        </Link>
        <Link to="/login">
          <Button size="lg" variant="secondary">
            Log in
          </Button>
        </Link>
      </div>

      {/* Demo video placeholder */}
      <div className="relative w-full aspect-video max-w-3xl mx-auto rounded-card-xl overflow-hidden bg-gradient-to-br from-accent-tint to-[#EFF5EE] border border-gray-200 dark:border-[#2A2A2A] shadow-card-lg">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-card">
            <PlayCircle size={32} className="text-accent" />
          </div>
          <p className="text-[14px] font-medium text-ink-2">See how it works</p>
        </div>
        {/* Decorative logs */}
        <div className="absolute top-6 left-6 bg-white/90 rounded-xl p-3 shadow-card text-left max-w-[200px]">
          <p className="text-[11px] font-semibold text-accent-active mb-1">#shipped</p>
          <p className="text-[12px] text-ink leading-snug">Shipped the v2 onboarding to 25% of new signups.</p>
        </div>
        <div className="absolute bottom-6 right-6 bg-white/90 rounded-xl p-3 shadow-card text-left max-w-[220px]">
          <p className="text-[11px] text-ink-3 mb-1 flex items-center gap-1"><Sparkles size={10} className="text-accent" /> AI recall</p>
          <p className="text-[12px] text-ink leading-snug">"What moved activation in May?" → Activation up 6pp…</p>
        </div>
      </div>
    </section>
  );
}

// ── What Is It ────────────────────────────────────────────────────────────

function WhatIsIt() {
  return (
    <section id="what" className="max-w-5xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[12.5px] font-semibold text-ink-3 uppercase tracking-[0.06em] mb-3">
            What is MyLogMate?
          </p>
          <h2 className="text-[36px] font-bold text-ink dark:text-white tracking-heading leading-tight mb-4">
            Your work, organized and searchable
          </h2>
          <p className="text-[16px] text-ink-2 leading-relaxed mb-6">
            MyLogMate is a private work journal with AI recall. Log what you shipped, who you
            mentored, and what decisions you made — then ask about it in plain English later.
          </p>
          <ul className="space-y-3">
            {[
              'Daily, weekly, or custom date entries',
              'Tag by theme: #shipped, #review, #meeting…',
              'AI that reads your actual logs — no hallucination',
              'Private by default, encrypted at rest',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] text-ink-2">
                <Check size={16} className="text-[#3F9663] mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Pencil, title: 'Log', desc: 'Write a quick note about your day', tint: 'bg-accent-tint' },
            { icon: Search, title: 'Recall', desc: 'Find anything with AI search', tint: 'bg-cream-tint' },
            { icon: ShieldCheck, title: 'Private', desc: 'Encrypted. Only you can read it', tint: 'bg-sage-tint' },
            { icon: TrendingUp, title: 'Review', desc: 'Use it at performance review time', tint: 'bg-accent-tint' },
          ].map(({ icon: Icon, title, desc, tint }) => (
            <div key={title} className={cn('rounded-card-lg p-5 border border-black/5', tint)}>
              <Icon size={20} className="text-ink-2 mb-3" strokeWidth={1.75} />
              <p className="text-[15px] font-bold text-ink mb-1">{title}</p>
              <p className="text-[13px] text-ink-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Log your work',
      desc: 'Write a sentence or a paragraph. Daily, weekly, or custom range. Add tags in one click.',
    },
    {
      n: '02',
      title: 'Keep going',
      desc: 'Build a habit. The more you log, the richer your history — and the better the AI gets.',
    },
    {
      n: '03',
      title: 'Ask anything',
      desc: 'At review time, ask: "What did I ship in Q2?" or "What blockers did Priya mention?" and get answers with sources.',
    },
  ];

  return (
    <section id="how" className="bg-gray-50 dark:bg-surface-1 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-[12.5px] font-semibold text-ink-3 uppercase tracking-[0.06em] mb-3">
          How it works
        </p>
        <h2 className="text-center text-[36px] font-bold text-ink dark:text-white tracking-heading mb-12">
          Three steps to a better review
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="flex flex-col">
              <span
                className="text-[48px] font-extrabold text-accent-tint dark:text-[#1F2A3A] mb-4 leading-none tabular"
                style={{ letterSpacing: '-0.03em', WebkitTextStroke: '2px #7EB0F7' }}
              >
                {n}
              </span>
              <h3 className="text-[20px] font-bold text-ink dark:text-white mb-2">{title}</h3>
              <p className="text-[15px] text-ink-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Who It's For ──────────────────────────────────────────────────────────

function WhoItsFor() {
  const personas = [
    {
      icon: Briefcase,
      title: 'Individual contributors',
      desc: 'Capture what you shipped every day. Never blank-page your self-review again.',
      tint: 'bg-accent-tint',
    },
    {
      icon: Users,
      title: 'Managers',
      desc: 'Log about your team. Recall who did what for fair, detailed performance reviews.',
      tint: 'bg-cream-tint',
    },
    {
      icon: TrendingUp,
      title: 'Ambitious professionals',
      desc: 'Build a record of your career. Interview prep, promotion case, or just peace of mind.',
      tint: 'bg-sage-tint',
    },
  ];

  return (
    <section id="who" className="max-w-5xl mx-auto px-6 py-20">
      <p className="text-center text-[12.5px] font-semibold text-ink-3 uppercase tracking-[0.06em] mb-3">
        Who it's for
      </p>
      <h2 className="text-center text-[36px] font-bold text-ink dark:text-white tracking-heading mb-12">
        Built for people who do the work
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {personas.map(({ icon: Icon, title, desc, tint }) => (
          <div
            key={title}
            className={cn('rounded-card-xl p-7 border border-black/5 dark:border-[#2A2A2A]', tint)}
          >
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-surface-2 border border-black/5 flex items-center justify-center mb-5">
              <Icon size={20} className="text-ink-2" strokeWidth={1.75} />
            </div>
            <h3 className="text-[18px] font-bold text-ink dark:text-white mb-2">{title}</h3>
            <p className="text-[14px] text-ink-2 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Why Love It ───────────────────────────────────────────────────────────

function WhyLoveIt() {
  const benefits = [
    {
      title: 'Built for recall, not just notes',
      desc: 'Unlike Notion or a journal, MyLogMate is designed around AI recall. Your logs are indexed, embedded, and queryable.',
    },
    {
      title: 'No tracking, ever',
      desc: "Your logs are private. We don't train on your data. We don't share it. It's yours.",
    },
    {
      title: 'Shockingly fast to log',
      desc: 'A log takes 30 seconds. We get out of your way so you can get back to the actual work.',
    },
    {
      title: 'Answers with sources',
      desc: 'The AI shows you exactly which log entries it pulled from. No guessing, no hallucination.',
    },
  ];

  return (
    <section className="bg-gray-50 dark:bg-surface-1 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-[12.5px] font-semibold text-ink-3 uppercase tracking-[0.06em] mb-3">
          Why you'll love it
        </p>
        <h2 className="text-center text-[36px] font-bold text-ink dark:text-white tracking-heading mb-12">
          Simple. Private. Powerful.
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {benefits.map(({ title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-surface-2 border border-gray-200 dark:border-[#2A2A2A] rounded-card-lg p-6 shadow-card"
            >
              <div className="w-8 h-8 rounded-full bg-accent-tint flex items-center justify-center mb-4">
                <Check size={14} className="text-accent-active" />
              </div>
              <h3 className="text-[17px] font-bold text-ink dark:text-white mb-2">{title}</h3>
              <p className="text-[14px] text-ink-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-24">
      <div
        className="max-w-3xl mx-auto px-6 text-center relative"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(147,181,255,.15), transparent 70%)',
        }}
      >
        <h2 className="text-[40px] sm:text-[48px] font-extrabold text-ink dark:text-white tracking-heading mb-4">
          Start logging today.
          <br />
          <span className="text-accent">Review with confidence.</span>
        </h2>
        <p className="text-[16px] text-ink-2 mb-8 max-w-md mx-auto">
          Free, private, and takes less than a minute to set up.
        </p>
        <Link to="/signup">
          <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
            Create your free account
          </Button>
        </Link>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-[#2A2A2A] px-6 sm:px-10 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size={20} />
        <p className="text-[13px] text-ink-3">
          © {new Date().getFullYear()} MyLogMate. Your logs stay private. Always.
        </p>
        <div className="flex gap-5 text-[13px] font-medium text-ink-3">
          <a href="#" className="hover:text-ink transition-colors">Privacy</a>
          <a href="#" className="hover:text-ink transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
