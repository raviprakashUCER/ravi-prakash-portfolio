import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Moon, Sun, Menu, X, Lock, ExternalLink } from 'lucide-react';

export function Navbar({ activeSection, setActiveSection, darkMode, setDarkMode, onOpenAI, onOpenAdmin, isAdminLoggedIn }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'notes', label: 'Notes' },
    { id: 'projects', label: 'Projects' },
    { id: 'resume', label: 'Resume' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    
    // If it's a section on page, scroll smoothly
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#090d16]/90 dark:bg-[#090d16]/90 bg-white/90 backdrop-blur-md border-b border-cyan-500/10 shadow-lg shadow-black/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1.5px] shadow-glow-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
              Ravi Prakash
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              CS • Cyber • AI
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 dark:bg-slate-900/60 bg-slate-100/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 dark:border-slate-800 border-slate-200 shadow-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions (Ask AI, Theme toggle, Admin) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Ask My AI Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium text-xs shadow-glow-cyan hover:shadow-glow-purple hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 animate-spin-slow" />
            <span>Ask My AI</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-slate-800 dark:border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 transition-all focus:outline-none"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Admin Login Button */}
          <button
            onClick={onOpenAdmin}
            className={`p-2.5 rounded-xl border transition-all ${
              isAdminLoggedIn
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title={isAdminLoggedIn ? "Admin Dashboard (Logged In)" : "Admin Portal"}
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenAI}
            className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#090d16]/98 border-b border-cyan-500/20 px-6 py-5 backdrop-blur-xl animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-2.5 px-3 rounded-lg text-left text-sm font-medium ${
                  activeSection === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-medium text-slate-300"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
              <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
