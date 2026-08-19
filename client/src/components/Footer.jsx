import React from 'react';
import { Shield, Mail, Terminal } from 'lucide-react';
import { GithubIcon, LinkedinIcon, YoutubeIcon, LeetcodeIcon, MediumIcon, TryHackMeIcon } from './Icons';

export function Footer({ socials, onNavigate, onOpenAdmin }) {
  const getSocialIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('git')) return <GithubIcon className="w-4 h-4" />;
    if (p.includes('link')) return <LinkedinIcon className="w-4 h-4" />;
    if (p.includes('you')) return <YoutubeIcon className="w-4 h-4" />;
    if (p.includes('leet')) return <LeetcodeIcon className="w-4 h-4" />;
    if (p.includes('med')) return <MediumIcon className="w-4 h-4" />;
    if (p.includes('try') || p.includes('hack')) return <TryHackMeIcon className="w-4 h-4" />;
    if (p.includes('mail') || p.includes('email')) return <Mail className="w-4 h-4" />;
    return <Terminal className="w-4 h-4" />;
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'notes', label: 'Notes' },
    { id: 'projects', label: 'Projects' },
    { id: 'resume', label: 'Resume' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <footer className="bg-slate-950/90 border-t border-slate-900 pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-white tracking-tight">Ravi Prakash</span>
            </div>
            <p className="text-cyan-400 font-mono text-xs tracking-wider">
              Learning • Building • Sharing
            </p>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Personal portfolio, cybersecurity knowledge base, and developer hub documenting practical technology explorations and systems security.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Quick Navigation</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className="text-left text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Socials & Admin Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Channels</h4>
            <div className="flex flex-wrap gap-2">
              {socials &&
                socials
                  .filter((s) => s.visible !== 0 && s.visible !== false)
                  .map((s) => (
                    <a
                      key={s.id || s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
                      title={s.platform}
                    >
                      {getSocialIcon(s.platform)}
                    </a>
                  ))}
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors"
              >
                🔐 Admin Control Panel
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <p>© 2026 Ravi Prakash. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <span className="text-cyan-400">React</span> & <span className="text-purple-400">Security Architecture</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
