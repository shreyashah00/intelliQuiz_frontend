'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import {
  ArrowRight, Star, Upload, Sparkles, Play, Target,
  Lightbulb, Brain, Cpu, Layers, BarChart3, Users, Zap
} from 'lucide-react';

/* ── Only what Tailwind can't express: keyframes + gradient text + reveal ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Geist+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');

html { scroll-behavior: smooth; }
body { font-family: 'Outfit', sans-serif; overflow-x: hidden; }
.font-display     { font-family: 'Cabinet Grotesk', sans-serif; }
.font-mono-iq     { font-family: 'Geist Mono', monospace; }

@keyframes fadeUp    { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes glowPulse { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
@keyframes gradMove  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes shimmer   { 0%{background-position:-300% center} 100%{background-position:300% center} }
@keyframes borderGlo { 0%,100%{border-color:rgba(59,130,246,.2)} 50%{border-color:rgba(59,130,246,.6)} }
@keyframes orbDrift  { 0%{transform:translate(0,0)} 25%{transform:translate(30px,-20px)} 50%{transform:translate(-20px,30px)} 75%{transform:translate(20px,20px)} 100%{transform:translate(0,0)} }
@keyframes navSlide  { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:translateY(0)} }
@keyframes scanLine  { 0%{transform:translateY(-100%);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(2000%);opacity:0} }
@keyframes ping2     { 0%{transform:scale(1);opacity:1} 70%{transform:scale(2.4);opacity:0} 100%{transform:scale(1);opacity:0} }
@keyframes floatOrb  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)} }
@keyframes nlGlow    { 0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,0)} 50%{box-shadow:0 0 28px 4px rgba(59,130,246,.18)} }

.anim-nav        { animation: navSlide .5s cubic-bezier(.22,1,.36,1) both; }
.anim-fu1        { animation: fadeUp .65s .1s both; }
.anim-fu2        { animation: fadeUp .65s .2s both; }
.anim-fu3        { animation: fadeUp .65s .3s both; }
.anim-fu4        { animation: fadeUp .65s .4s both; }
.anim-fu5        { animation: fadeUp .65s .5s both; }
.anim-pulse      { animation: glowPulse 2s ease-in-out infinite; }
.anim-grad       { background-size:200% 200%; animation: gradMove 5s ease infinite; }
.anim-orb1       { animation: orbDrift 12s ease-in-out infinite; }
.anim-orb2       { animation: orbDrift 12s ease-in-out infinite; animation-delay:-6s; }
.anim-orb3       { animation: orbDrift 12s ease-in-out infinite; animation-delay:-3s; }
.anim-border     { animation: borderGlo 3s ease-in-out infinite; }
.anim-scan       { animation: scanLine 7s ease-in-out infinite; }
.anim-ping2      { animation: ping2 2.5s ease-out infinite; }
.anim-ping3      { animation: ping2 2.5s ease-out infinite .5s; }
.anim-float1     { animation: floatOrb 9s ease-in-out infinite; }
.anim-float2     { animation: floatOrb 11s ease-in-out infinite reverse; }
.anim-nl-glow    { animation: nlGlow 5s ease-in-out infinite; }

/* Gradient text utilities */
.grad-text {
  background: linear-gradient(135deg,#3b82f6 0%,#4f6ef7 50%,#6366f1 100%);
  background-size: 200% auto;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  animation: shimmer 4s linear infinite;
}
.grad-white {
  background: linear-gradient(90deg,#fff,#93c5fd);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.grad-blue {
  background: linear-gradient(90deg,#2563eb,#4f6ef7);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}

/* Hero / footer dot-grid overlays */
.hero-grid {
  position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(59,130,246,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.07) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 80%);
}
.footer-grid {
  position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(59,130,246,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.055) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse 90% 80% at 50% 100%,black 30%,transparent 75%);
}

/* Scroll reveal */
.reveal       { opacity:0;transform:translateY(28px);transition:all .8s cubic-bezier(.22,1,.36,1); }
.reveal-scale { opacity:0;transform:scale(.94);transition:all .7s cubic-bezier(.22,1,.36,1); }
.reveal.visible,.reveal-scale.visible { opacity:1;transform:none; }

/* Shimmer sweep on primary buttons */
.btn-shine { position:relative;overflow:hidden; }
.btn-shine::before {
  content:'';position:absolute;inset:0;
  background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%);
  transform:translateX(-100%);transition:.6s;
}
.btn-shine:hover::before { transform:translateX(100%); }

/* Footer link slide-dot */
.foot-link {
  display:flex;align-items:center;gap:8px;
  font-size:.875rem;color:#64748b;text-decoration:none;
  padding:6px 0;transition:all .2s;
}
.foot-link::before {
  content:'';width:4px;height:4px;border-radius:50%;background:#3b82f6;
  opacity:0;transition:all .2s;flex-shrink:0;
}
.foot-link:hover { color:#93c5fd;padding-left:4px; }
.foot-link:hover::before { opacity:1; }

/* Newsletter card top-edge shine */
.nl-card { position:relative; }
.nl-card::before {
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(99,102,241,.6),transparent);
}
`;

/* ── scroll reveal hook ── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal,.reveal-scale');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function formatNum(val, target, suffix) {
  if (target >= 1000) {
    if (val >= 1000)
      return (val / 1000).toFixed(val < target ? 1 : 0).replace(/\.0$/, '') + 'K' + suffix;
    return Math.round(val) + suffix;
  }
  return Math.round(val) + suffix;
}

function animateCount(el, target, suffix, delay = 0) {
  const duration = 1800;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const startTime = performance.now() + delay;
  const step = (now) => {
    const elapsed = Math.max(0, now - startTime);
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = formatNum(ease(progress) * target, target, suffix);
    if (progress < 1) requestAnimationFrame(step);
  };
  setTimeout(() => requestAnimationFrame(step), delay);
}

export function StatCards() {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, i) => {
      if (!card) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          const numEl = card.querySelector('[data-num]');
          const { target, suffix } = STATS[i];
          card.classList.add('[--bar-scale:1]');
          animateCount(numEl, target, suffix, i * 120);
          obs.disconnect();
        },
        { threshold: 0.2 }
      );
      obs.observe(card);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden border border-blue-100 divide-x divide-blue-100 shadow-[0_8px_32px_rgba(59,130,246,.10)] anim-fu5">
      {STATS.map((s, i) => (
        <div
          key={i}
          ref={(el) => (cardRefs.current[i] = el)}
          className="group relative bg-white px-5 py-7 text-center overflow-hidden hover:bg-blue-50 transition-colors duration-300"
        >
          {/* Animated bottom bar */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-blue-500 origin-left" style={{transform: 'scaleX(var(--bar-scale, 0))', transition: 'transform 0.5s ease'}}></div>
          <div data-num className="font-display font-black text-3xl tracking-tight grad-blue mb-1">0</div>
          <div className="text-xs text-slate-400 font-medium tracking-wider uppercase mb-1">{s.label}</div>
          <div className="text-xs text-slate-500">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Static data ── */
const FEATURES = [
  { icon: Upload,    title: 'Smart File Upload',     desc: 'Drop PDFs, slides, or images — our AI extracts key concepts instantly for quiz generation.' },
  { icon: Zap,       title: 'Instant Generation',    desc: 'State-of-the-art algorithms produce comprehensive, varied quizzes in under 10 seconds.' },
  { icon: Cpu,       title: 'Adaptive Intelligence', desc: "Difficulty adjusts in real-time to each learner's performance for a truly personalised path." },
  { icon: Users,     title: 'Live Collaboration',    desc: 'Teachers and students share quizzes, see live scores, and exchange feedback in real time.' },
  { icon: Layers,    title: 'Rich Content Library',  desc: 'Thousands of curated templates spanning every subject, grade level, and question type.' },
  { icon: BarChart3, title: 'Deep Analytics',        desc: 'Pinpoint knowledge gaps with per-question heatmaps, progress curves, and cohort benchmarks.' },
];
const STEPS = [
  { n:'01', title:'Upload',   desc:'Drop your study materials — PDFs, decks, images, or raw text.',             icon:Upload   },
  { n:'02', title:'Analyse',  desc:'AI reads your content, maps concepts and builds topic trees automatically.', icon:Brain    },
  { n:'03', title:'Generate', desc:'Smart algorithms craft questions, distractors and full explanations.',        icon:Sparkles },
  { n:'04', title:'Learn',    desc:'Students take quizzes and receive instant, detailed feedback at each step.', icon:Target   },
];
const TESTIMONIALS = [
  { init:'SJ', name:'Sarah Johnson',    role:'High School Teacher',  stars:5, text:'IntelliQuiz turned my hours-long assessment workflow into minutes. The quality is indistinguishable from hand-crafted questions.' },
  { init:'MC', name:'Dr. Michael Chen', role:'University Professor', stars:5, text:'Remarkably accurate AI. It understood my 80-page lecture notes and produced exam-ready questions I would have written myself.' },
  { init:'ER', name:'Emily Rodriguez',  role:'Student',              stars:5, text:'The adaptive difficulty kept me in a flow state. My exam score went up 22 points after just two weeks of practice.' },
];
const STATS = [
  { target: 10000,  suffix: '+', label: 'Active Teachers',   sub: 'educators worldwide'    },
  { target: 100000, suffix: '+', label: 'Quizzes Created',   sub: 'and counting'           },
  { target: 500000, suffix: '+', label: 'Students Engaged',  sub: 'across 60+ countries'   },
  { target: 98,     suffix: '%', label: 'Success Rate',      sub: 'satisfaction score'     },
];
const FOOTER_COLS = [
  { title:'Product',   links:[{l:'Features',href:'#features'},{l:'How it Works',href:'#how-it-works'},{l:'Reviews',href:'#testimonials'},{l:'Pricing',href:'#'},{l:'Changelog',href:'#'}] },
  { title:'Resources', links:[{l:'Documentation',href:'#'},{l:'API Reference',href:'#'},{l:'Blog',href:'#'},{l:'Community',href:'#'},{l:'Support',href:'#'}] },
  { title:'Account',   links:[{l:'Sign Up',href:'/signup'},{l:'Sign In',href:'/login'},{l:'Dashboard',href:'#'},{l:'Settings',href:'#'}] },
];

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  useReveal();
  return (
    <div className="min-h-screen bg-[#f0f4ff] text-slate-900">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ══ NAV ══════════════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-[999] h-16 bg-white/[.88] backdrop-blur-2xl border-b border-blue-100 shadow-[0_1px_24px_rgba(59,130,246,.07)] anim-nav">
        <div className="max-w-[1200px] mx-auto px-7 h-full flex items-center justify-between">

          <a href="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_4px_16px_rgba(59,130,246,.25)] hover:scale-110 hover:-rotate-6 transition-all duration-300">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-xl tracking-tight grad-blue">IntelliQuiz</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {[['#features','Features'],['#how-it-works','How it Works'],['#testimonials','Reviews']].map(([h,l]) => (
              <a key={h} href={h} className="text-sm font-medium text-slate-500 no-underline hover:text-blue-600 transition-colors duration-200">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="px-5 py-2 rounded-xl text-sm font-medium text-slate-500 no-underline border border-transparent hover:text-blue-600 hover:border-blue-100 transition-all duration-200">Sign In</Link>
            <Link href="/signup" className="btn-shine px-5 py-2 rounded-xl text-sm font-semibold text-white no-underline bg-gradient-to-br from-blue-500 to-indigo-500 border border-indigo-300/30 shadow-[0_4px_16px_rgba(59,130,246,.25)] hover:shadow-[0_6px_24px_rgba(79,110,247,.4)] hover:-translate-y-px transition-all duration-300">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════ */}
      <section className="relative pt-36 pb-28 px-7 overflow-hidden" style={{background:'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(99,102,241,.08) 0%,transparent 70%)'}}>
        <div className="hero-grid" />
        <div className="absolute rounded-full pointer-events-none anim-orb1" style={{width:600,height:600,top:-200,left:-100,background:'rgba(59,130,246,.10)',filter:'blur(90px)'}} />
        <div className="absolute rounded-full pointer-events-none anim-orb2" style={{width:500,height:500,top:-100,right:-150,background:'rgba(99,102,241,.08)',filter:'blur(90px)'}} />
        <div className="absolute rounded-full pointer-events-none anim-orb3" style={{width:300,height:300,bottom:0,left:'50%',background:'rgba(139,92,246,.06)',filter:'blur(90px)'}} />

        <div className="max-w-[860px] mx-auto text-center relative z-10">

          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-5 py-2 text-xs font-semibold tracking-widest uppercase text-blue-600 mb-9 shadow-[0_2px_16px_rgba(59,130,246,.10)] anim-fu1">
            <span className="w-2 h-2 rounded-full bg-blue-500 anim-pulse shadow-[0_0_8px_#3b82f6]" />
            <Sparkles className="w-3 h-3" />
            AI-Powered Education Platform
          </div>

          <h1 className="font-display font-black leading-none tracking-[-0.04em] text-slate-900 mb-7 anim-fu2" style={{fontSize:'clamp(48px,7vw,88px)'}}>
            The Smartest Way<br />to <span className="grad-text">Create Quizzes</span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto mb-14 anim-fu3">
            Upload any document. Our AI generates engaging, personalised quizzes in seconds — built for educators who demand quality at scale.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-20 anim-fu4">
            <Link href="/signup" className="btn-shine inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-bold text-base text-white no-underline bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 anim-grad border border-violet-300/30 shadow-[0_8px_32px_rgba(59,130,246,.35)] hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(59,130,246,.45)] transition-all duration-300">
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-bold text-base text-blue-600 no-underline bg-white border border-blue-100 shadow-[0_4px_16px_rgba(59,130,246,.08)] hover:bg-blue-50 hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(59,130,246,.15)] transition-all duration-300">
              <Play className="w-4 h-4" /> See how it works
            </a>
          </div>

          <StatCards />
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════ */}
      <section id="features" className="py-28 px-7">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 font-mono-iq text-[11px] font-medium tracking-[.1em] uppercase text-blue-600 mb-5 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <Lightbulb className="w-3 h-3" /> Features
            </div>
            <h2 className="font-display font-black leading-tight tracking-[-0.03em] text-slate-900 mb-5" style={{fontSize:'clamp(36px,4.5vw,58px)'}}>
              Built for serious<br /><span className="grad-text">educators & learners</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">Every tool you need to create, distribute, and analyse quizzes — all in one coherent platform.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-blue-100 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(59,130,246,.08)] reveal-scale" style={{gap:1,background:'rgba(59,130,246,.10)'}}>
            {FEATURES.map((f,i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group bg-white p-10 hover:bg-blue-50 transition-colors duration-300 relative overflow-hidden cursor-default">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background:'radial-gradient(circle at 0% 100%,rgba(59,130,246,.05) 0%,transparent 60%)'}} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 bg-blue-50 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:border-indigo-400 group-hover:shadow-[0_6px_20px_rgba(79,110,247,.3)] group-hover:scale-105 transition-all duration-300 relative z-10">
                    <Icon className="w-6 h-6 text-indigo-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="font-display font-extrabold text-base text-slate-900 mb-2 tracking-tight relative z-10">{f.title}</div>
                  <p className="text-sm text-slate-500 leading-7 relative z-10">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px max-w-2xl mx-auto" style={{background:'linear-gradient(90deg,transparent,rgba(59,130,246,.2),transparent)'}} />

      {/* ══ HOW IT WORKS ═════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 px-7" style={{background:'linear-gradient(180deg,#f0f4ff 0%,#e8eeff 50%,#f0f4ff 100%)'}}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 font-mono-iq text-[11px] font-medium tracking-[.1em] uppercase text-blue-600 mb-5 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <Play className="w-3 h-3" /> Process
            </div>
            <h2 className="font-display font-black leading-tight tracking-[-0.03em] text-slate-900 mb-5" style={{fontSize:'clamp(36px,4.5vw,58px)'}}>
              From upload to quiz<br /><span className="grad-text">in 4 steps</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">No setup, no configuration. Drop your content and let our AI handle the rest.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s,i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="group bg-white border border-blue-50 rounded-2xl p-8 text-center shadow-[0_4px_20px_rgba(59,130,246,.06)] hover:border-blue-300 hover:shadow-[0_12px_40px_rgba(59,130,246,.15)] hover:-translate-y-1.5 transition-all duration-300 reveal" style={{transitionDelay:`${i*.1}s`}}>
                  <span className="font-mono-iq text-xs font-medium text-blue-500 tracking-widest mb-5 block">{s.n}</span>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_24px_rgba(59,130,246,.25)] group-hover:shadow-[0_12px_32px_rgba(59,130,246,.38)] group-hover:scale-105 transition-all duration-300 relative">
                    <div className="absolute inset-[-4px] rounded-full border border-blue-200 anim-border" />
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-display font-extrabold text-base text-slate-900 mb-2 tracking-tight">{s.title}</div>
                  <p className="text-[13.5px] text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px max-w-2xl mx-auto" style={{background:'linear-gradient(90deg,transparent,rgba(59,130,246,.2),transparent)'}} />

      {/* ══ TESTIMONIALS ═════════════════════════════════════════ */}
      <section id="testimonials" className="py-28 px-7" style={{background:'radial-gradient(ellipse 70% 60% at 50% 50%,rgba(59,130,246,.05) 0%,transparent 70%)'}}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 font-mono-iq text-[11px] font-medium tracking-[.1em] uppercase text-blue-600 mb-5 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <Star className="w-3 h-3" /> Testimonials
            </div>
            <h2 className="font-display font-black leading-tight tracking-[-0.03em] text-slate-900 mb-5" style={{fontSize:'clamp(36px,4.5vw,58px)'}}>
              Trusted by educators<br /><span className="grad-text">around the world</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">Real results from teachers and students using IntelliQuiz every day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t,i) => (
              <div key={i} className="group bg-white border border-blue-50 rounded-2xl p-9 relative overflow-hidden shadow-[0_4px_20px_rgba(59,130,246,.06)] hover:border-blue-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(59,130,246,.12)] transition-all duration-300 reveal" style={{transitionDelay:`${i*.12}s`}}>
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="font-display font-black text-7xl leading-none text-blue-100 mb-5 block">"</span>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_,j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-slate-500 leading-7 mb-7">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-display font-black text-sm text-white shadow-[0_4px_14px_rgba(59,130,246,.25)] flex-shrink-0">{t.init}</div>
                  <div>
                    <div className="font-display font-extrabold text-sm text-slate-900">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════ */}
      <section className="py-36 px-7 relative overflow-hidden" style={{background:'radial-gradient(ellipse 60% 80% at 50% 50%,rgba(59,130,246,.10) 0%,transparent 70%),linear-gradient(180deg,#f0f4ff 0%,#e8eeff 50%,#f0f4ff 100%)'}}>
        {[600,900,1200].map((sz,i) => (
          <div key={i} className="absolute rounded-full border pointer-events-none" style={{width:sz,height:sz,top:'50%',left:'50%',transform:'translate(-50%,-50%)',borderColor:`rgba(59,130,246,${.10-i*.03})`}} />
        ))}
        <div className="max-w-[780px] mx-auto text-center relative z-10 reveal">
          <div className="inline-flex items-center gap-2 font-mono-iq text-[11px] font-medium tracking-[.1em] uppercase text-blue-600 mb-7 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
            <Sparkles className="w-3 h-3" /> Get Started Today
          </div>
          <h2 className="font-display font-black leading-tight tracking-[-0.04em] text-slate-900 mb-6" style={{fontSize:'clamp(42px,6vw,72px)'}}>
            Ready to transform<br /><span className="grad-text">your learning experience?</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed mb-14">Join thousands of educators creating better assessments in less time. Start free — no credit card required.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/signup" className="btn-shine inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-display font-extrabold text-base text-white no-underline bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 anim-grad border border-violet-300/30 shadow-[0_10px_40px_rgba(59,130,246,.35)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_14px_50px_rgba(59,130,246,.45)] transition-all duration-300">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-display font-extrabold text-base text-blue-600 no-underline bg-white border border-blue-100 shadow-[0_4px_16px_rgba(59,130,246,.08)] hover:bg-blue-50 hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-300">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER — Dark theme
      ══════════════════════════════════════════════════════════ */}
      <footer className="relative overflow-hidden bg-[#030712]">

        {/* Atmosphere */}
        <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse 70% 50% at 15% 20%,rgba(59,130,246,.09) 0%,transparent 60%),radial-gradient(ellipse 50% 60% at 85% 80%,rgba(99,102,241,.08) 0%,transparent 55%),radial-gradient(ellipse 40% 40% at 50% 0%,rgba(79,110,247,.06) 0%,transparent 60%)'}} />
        <div className="footer-grid" />

        {/* Floating orbs */}
        <div className="absolute rounded-full pointer-events-none anim-float1" style={{width:420,height:420,top:-120,left:-80,background:'rgba(59,130,246,.07)',filter:'blur(80px)'}} />
        <div className="absolute rounded-full pointer-events-none anim-float2" style={{width:360,height:360,bottom:-60,right:-60,background:'rgba(99,102,241,.08)',filter:'blur(80px)'}} />

        {/* Scan line */}
        <div className="absolute inset-x-0 h-px pointer-events-none z-10 anim-scan" style={{background:'linear-gradient(90deg,transparent,rgba(59,130,246,.4),rgba(99,102,241,.6),rgba(59,130,246,.4),transparent)'}} />

        {/* ── Newsletter card ── */}
        <div className="relative z-10 px-7 pt-14">
          <div className="max-w-[1200px] mx-auto">
            <div className="nl-card flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-12 rounded-3xl border border-blue-500/[.15] anim-nl-glow" style={{background:'rgba(255,255,255,.025)',backdropFilter:'blur(12px)'}}>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 font-mono-iq text-[10px] font-medium tracking-[.12em] uppercase text-blue-400 mb-3">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 anim-ping2" />
                    <span className="relative rounded-full w-2 h-2 bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                  </span>
                  Stay in the loop
                </div>
                <div className="font-display font-black text-xl text-slate-100 tracking-tight mb-1">Level up your teaching</div>
                <p className="text-sm text-slate-500 leading-relaxed">Weekly tips, new features & educator spotlights.</p>
              </div>
              <div className="flex gap-3 flex-1 min-w-[280px] max-w-[420px]">
                <input type="email" placeholder="your@email.com" className="flex-1 px-5 py-3 rounded-xl border border-blue-500/20 bg-white/[.05] text-slate-200 text-sm placeholder-slate-600 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300" style={{fontFamily:'Outfit,sans-serif'}} />
                <button className="px-6 py-3 rounded-xl font-display font-bold text-sm text-white bg-gradient-to-br from-blue-500 to-indigo-500 shadow-[0_4px_20px_rgba(59,130,246,.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(59,130,246,.5)] transition-all duration-300 whitespace-nowrap border-0 cursor-pointer">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-7">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-16 pb-14 border-b border-white/[.06]">

            {/* Brand column */}
            <div className="flex flex-col gap-5">
              <a href="/" className="flex items-center gap-3 no-underline w-fit">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,.5),0_0_48px_rgba(99,102,241,.2)] relative">
                  <div className="absolute inset-[-1px] rounded-2xl border border-indigo-400/40" />
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-black text-xl grad-white">IntelliQuiz</span>
              </a>

              <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">
                Empowering educators and students with AI-powered quiz generation for better learning outcomes.
              </p>

              

              {/* Socials */}
              <div className="flex gap-2.5">
                {['𝕏','in','gh','yt'].map((s,i) => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-white/[.04] border border-white/[.08] flex items-center justify-center text-slate-500 text-sm font-bold cursor-pointer hover:bg-blue-500/15 hover:border-blue-500/40 hover:text-blue-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,.2)] transition-all duration-200 select-none">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map((col,ci) => (
              <div key={ci} className="flex flex-col">
                <div className="font-mono-iq text-[10px] font-medium tracking-[.14em] uppercase text-blue-500 mb-5 pb-3 border-b border-blue-500/15">
                  {col.title}
                </div>
                <ul className="flex flex-col gap-0 list-none p-0 m-0">
                  {col.links.map((link,li) => (
                    <li key={li}>
                      <Link href={link.href} className="foot-link">{link.l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-7">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-slate-600">© 2024 IntelliQuiz, Inc. All rights reserved.</span>
              <div className="flex gap-5">
                {['Privacy Policy','Terms of Service','Cookie Settings'].map(l => (
                  <a key={l} href="#" className="text-xs text-slate-600 no-underline hover:text-blue-400 transition-colors duration-200">{l}</a>
                ))}
              </div>
            </div>
           
          </div>
        </div>
      </footer>
    </div>
  );
}