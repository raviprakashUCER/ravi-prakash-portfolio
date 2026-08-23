import React from 'react';
import { Lock, Heart, Shield, ArrowUp } from 'lucide-react';

export default function Footer({ profile, onOpenAdmin, onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800 bg-[#070b13] text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            RP
          </div>
          <div>
            <span className="font-bold text-white text-sm">
              {profile?.name || 'Ravi Prakash'}
            </span>
            <span className="text-slate-500 ml-2">Portfolio</span>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
          {['Home', 'About', 'Skills', 'Projects', 'Notes', 'Resume', 'Certificates', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => onNavigate(item.toLowerCase())}
              className="hover:text-cyan-400 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Admin Link & Back to Top */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors"
            title="Admin Portal"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          <button
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 text-center text-slate-500 text-[11px]">
        © {new Date().getFullYear()} {profile?.name || 'Ravi Prakash'}. Built with React & Express. Deployed with Render & Vercel.
      </div>
    </footer>
  );
}
