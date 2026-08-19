import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  FileText,
  Mail,
  Terminal,
  ShieldCheck,
  Code2,
  Cpu,
  Download
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, YoutubeIcon, LeetcodeIcon, MediumIcon, TryHackMeIcon } from './Icons';

export function Hero({ profile, socials, onOpenAI, onNavigate }) {
  const getSocialIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('git')) return <GithubIcon className="w-5 h-5" />;
    if (p.includes('link')) return <LinkedinIcon className="w-5 h-5" />;
    if (p.includes('you')) return <YoutubeIcon className="w-5 h-5" />;
    if (p.includes('leet')) return <LeetcodeIcon className="w-5 h-5" />;
    if (p.includes('med')) return <MediumIcon className="w-5 h-5" />;
    if (p.includes('try') || p.includes('hack')) return <TryHackMeIcon className="w-5 h-5" />;
    if (p.includes('mail') || p.includes('email')) return <Mail className="w-5 h-5" />;
    return <Terminal className="w-5 h-5" />;
  };

  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-purple-500/15 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-600/10 blur-[100px] pointer-events-none -z-10 rounded-full" />

      {/* Cyber Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 shadow-inner text-xs font-mono text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>Security • Code • Intelligence • Learning Hub</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-medium text-slate-300">
              Hi, I'm <span className="font-bold text-white">Ravi Prakash</span> 👋
            </h2>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              <span className="cyber-gradient-text">Computer Science Student</span>
              <span className="block text-slate-200 text-2xl sm:text-3xl font-semibold mt-2">
                Cybersecurity Learner & AI Enthusiast
              </span>
            </h1>
          </div>

          {/* Bio / Intro */}
          <p className="text-base sm:text-lg text-slate-300 dark:text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
            {profile?.bio ||
              'Ravi is a Computer Science student building practical skills in cybersecurity, programming, AI, web technologies, and software development.'}
          </p>

          {/* Core Focus Badges */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Web Security & Recon
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-medium">
              <Code2 className="w-3.5 h-3.5" /> Python & Full-Stack
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              <Cpu className="w-3.5 h-3.5" /> Prompt Engineering & AI
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start pt-3">
            <button
              onClick={() => onNavigate('projects')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-glow-cyan hover:shadow-glow-purple hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>Explore My Work</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('notes')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-200 hover:text-white text-sm font-medium transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>View My Notes</span>
            </button>

            <button
              onClick={() => onNavigate('resume')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/40 text-slate-200 hover:text-white text-sm font-medium transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Download Resume</span>
            </button>

            <button
              onClick={onOpenAI}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold shadow-glow-purple hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>Ask My AI</span>
            </button>
          </div>

          {/* Configured Social Media Icons */}
          {socials && socials.length > 0 && (
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Connect:</span>
                <div className="flex items-center gap-2">
                  {socials
                    .filter((s) => s.visible !== 0 && s.visible !== false)
                    .map((s) => (
                      <a
                        key={s.id || s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all hover:scale-110"
                        title={`${s.platform} (${s.username || ''})`}
                      >
                        {getSocialIcon(s.platform)}
                      </a>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Interactive Cyber Card / Avatar Area */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Ambient Background Box */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-3xl blur-2xl -z-10" />

            {/* Terminal Style Card */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-950/40">
              {/* Terminal Window Header */}
              <div className="bg-slate-950/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400">ravi@sec-workstation:~</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  LIVE STATUS
                </span>
              </div>

              {/* Terminal Content */}
              <div className="p-5 font-mono text-xs space-y-3 bg-[#080d19]/90 text-slate-300">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="text-emerald-400">➜</span>
                  <span className="text-purple-400">whoami</span>
                </div>
                <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-800 text-slate-200">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40 shadow-sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                      RP
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{profile?.name || 'Ravi Prakash'}</p>
                    <p className="text-slate-400 text-[11px]">Location: {profile?.location || 'India 🇮🇳'}</p>
                    <p className="text-slate-400 text-[11px]">Role: CS Student & Security Researcher</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-cyan-400 pt-2">
                  <span className="text-emerald-400">➜</span>
                  <span className="text-purple-400">cat current_focus.txt</span>
                </div>
                <div className="pl-4 border-l-2 border-slate-800 text-slate-300 space-y-1">
                  <p className="text-cyan-300 font-medium"># Active Security & Dev Focus</p>
                  <p className="text-[11px] text-slate-300">• Nmap & Network Protocol Analysis</p>
                  <p className="text-[11px] text-slate-300">• Web Security & OWASP Top 10 Lab</p>
                  <p className="text-[11px] text-slate-300">• Python Automation & AI Assist</p>
                </div>

                <div className="flex items-center gap-2 text-cyan-400 pt-2">
                  <span className="text-emerald-400">➜</span>
                  <span className="text-purple-400">ai-assistant --status</span>
                </div>
                <div className="pl-4 border-l-2 border-emerald-500/50 bg-emerald-950/20 p-2.5 rounded text-emerald-300 text-[11px] flex items-center justify-between">
                  <span>Ravi AI Engine: Grounded & Online</span>
                  <span className="animate-pulse text-xs">●</span>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="bg-slate-900/60 p-3.5 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Ask about Ravi's journey:</span>
                <button
                  onClick={onOpenAI}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all"
                >
                  Prompt AI 💬
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
