import React from 'react';
import {
  MapPin,
  Target,
  Compass,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Cpu,
  Layers,
  Terminal
} from 'lucide-react';

export function About({ profile, journey }) {
  const interestsList = Array.isArray(profile?.interests)
    ? profile.interests
    : typeof profile?.interests === 'string'
    ? JSON.parse(profile.interests || '[]')
    : [];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-2 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Compass className="w-3.5 h-3.5" />
            <span>PROFILE & LEARNING TRAJECTORY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            About <span className="cyber-gradient-text">Ravi Prakash</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            A dedicated Computer Science student committed to practical technology exploration, security research, and open knowledge sharing.
          </p>
        </div>

        {/* Top Cards: Bio & Core Focus */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Main Bio Card */}
          <div className="md:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 space-y-5 border border-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-12 h-12 rounded-xl object-cover border border-cyan-500/40 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Terminal className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{profile?.name || 'Ravi Prakash'}</h3>
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile?.location || 'India'}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              {profile?.bio ||
                'Ravi is a Computer Science student building practical skills in cybersecurity, programming, AI, web technologies, and software development. He is interested in building practical technology projects and documenting what he learns.'}
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-400" /> Career Goal & Vision
              </h4>
              <p className="text-sm text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                {profile?.career_goal ||
                  'Aspiring Cybersecurity Professional & Software Engineer focused on secure systems, threat analysis, and AI-driven automation.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Current Focus Card */}
          <div className="md:col-span-5 space-y-6">
            <div className="glass-panel rounded-2xl p-6 space-y-4 border border-cyan-500/20">
              <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Current Active Focus
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/20">
                {profile?.current_focus ||
                  'Computer Science, Cybersecurity, AI, Programming and Software Development.'}
              </p>

              {/* Learning Interests Pills */}
              <div className="pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                  Core Study Areas:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {interestsList.length > 0 ? (
                    interestsList.map((interest, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">None added yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Journey Timeline */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Learning Journey & Milestones</h3>
                <p className="text-xs text-slate-400">Continuous technical progression and practical lab exploration</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {journey && journey.length > 0 ? (
              journey.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/20">
                        {item.category || 'Domain'}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
                        {item.status || 'Active'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{item.topic}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-400">
                    Status: {item.status || 'Ongoing'}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-6 text-slate-500 text-xs font-mono">
                Learning journey entries will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
