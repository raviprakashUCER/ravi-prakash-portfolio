import React, { useState } from 'react';
import {
  Code,
  Shield,
  Globe,
  Cpu,
  Lock,
  Search,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Sliders
} from 'lucide-react';

export function Skills({ skillsGrouped, skillsList = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'All', label: 'All Domains', icon: Sliders },
    { id: 'Cybersecurity', label: 'Cybersecurity', icon: Shield },
    { id: 'Security Concepts', label: 'Security Concepts', icon: Lock },
    { id: 'Programming', label: 'Programming', icon: Code },
    { id: 'Web Development', label: 'Web Development', icon: Globe },
    { id: 'AI', label: 'AI & Automation', icon: Cpu },
  ];

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Practical Experience':
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'Practical Experience'
        };
      case 'Intermediate':
        return {
          bg: 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300',
          dot: 'bg-cyan-400',
          label: 'Intermediate'
        };
      case 'Familiar':
        return {
          bg: 'bg-purple-950/60 border-purple-500/30 text-purple-300',
          dot: 'bg-purple-400',
          label: 'Familiar'
        };
      case 'Learning':
      default:
        return {
          bg: 'bg-amber-950/60 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-400',
          label: 'Learning'
        };
    }
  };

  const filteredSkills = skillsList.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-300">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>PRACTICAL MATRIX & PROFICIENCY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Skills & <span className="cyber-gradient-text">Competencies</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Honest, realistic competency mapping spanning software development, cybersecurity testing, network inspection, and AI tooling.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-xs font-mono text-slate-300">
          <span className="text-slate-400">Proficiency scale:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Practical Experience
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Intermediate
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Familiar
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Learning
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-full md:w-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search skills (e.g. Nmap, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500/50 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const badge = getLevelBadge(skill.level);
            return (
              <div
                key={skill.id || skill.name}
                className="glass-panel rounded-xl p-4 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex flex-col justify-between group space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      {skill.name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {skill.description || 'Skill acquired through coursework and practical lab projects.'}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Domain: {skill.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            No skills found matching "{searchQuery}".
          </div>
        )}
      </div>
    </section>
  );
}
