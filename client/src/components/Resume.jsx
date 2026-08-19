import React from 'react';
import {
  FileText,
  Download,
  Printer,
  Mail,
  MapPin,
  ExternalLink,
  GraduationCap,
  Award,
  Code,
  Shield,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

export function Resume({ resumeData }) {
  const profile = resumeData?.profile || {};
  const education = resumeData?.education || [];
  const skills = resumeData?.skills || [];
  const projects = resumeData?.projects || [];
  const certs = resumeData?.certs || [];
  const journey = resumeData?.journey || [];

  const handlePrint = () => {
    window.print();
  };

  // Group skills by category
  const skillsByCategory = {};
  for (const s of skills) {
    if (!skillsByCategory[s.category]) {
      skillsByCategory[s.category] = [];
    }
    skillsByCategory[s.category].push(s);
  }

  return (
    <section id="resume" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header & Print Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-300 mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>CURRICULUM VITAE</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Professional <span className="cyber-gradient-text">Resume</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs font-medium transition-all"
              title="Print Resume HTML Layout"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Print CV</span>
            </button>

            {profile.resume_url ? (
              <a
                href={profile.resume_url}
                download
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold shadow-glow-cyan hover:scale-[1.02] transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume PDF</span>
              </a>
            ) : (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-semibold shadow-glow-cyan hover:scale-[1.02] transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume PDF</span>
              </button>
            )}

            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-medium transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View PDF</span>
              </a>
            )}
          </div>
        </div>

        {/* Printable Resume Document */}
        <div
          id="printable-resume"
          className="glass-panel bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 sm:p-12 space-y-8 shadow-2xl"
        >
          {/* Header Contact Block */}
          <div className="border-b border-slate-800 pb-6 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {profile.name || 'Ravi Prakash'}
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>{profile.location || 'India'}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-cyan-300">
              {profile.headline || 'Computer Science Student | Cybersecurity Learner | AI & Technology Enthusiast'}
            </p>
            {profile.email && (
              <p className="text-xs font-mono text-slate-400">Email: {profile.email}</p>
            )}
          </div>

          {/* Profile Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5 border-b border-slate-800/80 pb-1">
              <FileText className="w-4 h-4" /> Profile Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {profile.bio ||
                'Computer Science student with strong practical skills in cybersecurity, programming, web technologies, and AI automation. Dedicated to practical lab experimentation, secure software development, and documentation.'}
            </p>
          </div>

          {/* Education */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5 border-b border-slate-800/80 pb-1">
              <GraduationCap className="w-4 h-4" /> Education
            </h3>
            {education.length > 0 ? (
              education.map((ed, i) => (
                <div key={i} className="flex justify-between items-start text-xs sm:text-sm">
                  <div>
                    <h4 className="font-bold text-white">{ed.course}</h4>
                    <p className="text-slate-400">{ed.institution}</p>
                    {ed.description && (
                      <p className="text-slate-400 text-xs mt-1">{ed.description}</p>
                    )}
                  </div>
                  <span className="font-mono text-xs text-cyan-400 shrink-0">
                    {ed.start_date && ed.end_date && ed.start_date !== 'Current' ? `${ed.start_date} - ${ed.end_date}` : 'Current Coursework'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Computer Science Student.</p>
            )}
          </div>

          {/* Technical Skills */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5 border-b border-slate-800/80 pb-1">
              <Code className="w-4 h-4" /> Technical Competencies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(skillsByCategory).map(([cat, skList]) => (
                <div key={cat} className="space-y-1">
                  <span className="font-bold text-slate-200">{cat}:</span>
                  <p className="text-slate-400 leading-relaxed">
                    {skList.map((s) => `${s.name} (${s.level})`).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Projects */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5 border-b border-slate-800/80 pb-1">
              <Shield className="w-4 h-4" /> Selected Projects
            </h3>
            {projects.slice(0, 3).map((p, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">{p.title}</h4>
                  <span className="font-mono text-[11px] text-cyan-400">{p.status}</span>
                </div>
                <p className="text-slate-400 font-mono text-[11px]">
                  Technologies: {p.technologies}
                </p>
                <p className="text-slate-300 leading-relaxed">{p.description}</p>
                {p.solution && (
                  <p className="text-slate-400 text-[11px]">
                    <strong className="text-slate-300">Solution:</strong> {p.solution}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5 border-b border-slate-800/80 pb-1">
              <Award className="w-4 h-4" /> Certifications
            </h3>
            {certs.length > 0 ? (
              certs.map((c, i) => (
                <div key={i} className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-white">{c.title}</h4>
                    <p className="text-slate-400">{c.organization}</p>
                    {c.credential_id && c.credential_id !== 'Not added yet' && (
                      <p className="font-mono text-[11px] text-slate-400">ID: {c.credential_id}</p>
                    )}
                  </div>
                  <span className="font-mono text-cyan-400">{c.issue_date && c.issue_date !== 'Completed' ? c.issue_date : 'Completed'}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Not added yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
