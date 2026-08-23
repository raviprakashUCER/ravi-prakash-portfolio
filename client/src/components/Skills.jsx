import React from 'react';
import { Shield, Code, Server, Database, Cloud, Terminal, CheckCircle2 } from 'lucide-react';

export default function Skills({ profile }) {
  const customSkills = profile?.skills || [];

  // Default fallback skills if none defined in DB
  const defaultSkillGroups = [
    {
      category: 'Frontend Development',
      icon: Code,
      items: ['React.js', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'TailwindCSS', 'Vite', 'Responsive Design', 'REST API Integration']
    },
    {
      category: 'Backend & APIs',
      icon: Server,
      items: ['Node.js', 'Express.js', 'Python', 'RESTful API Architecture', 'JWT Authentication', 'Multer & File Streaming', 'Middleware Design']
    },
    {
      category: 'Databases & Storage',
      icon: Database,
      items: ['SQLite (WAL mode)', 'PostgreSQL', 'Render Persistent Disks', 'Data Integrity', 'Schema Migrations']
    },
    {
      category: 'DevOps & Deployment',
      icon: Cloud,
      items: ['Render Backend Hosting', 'Vercel Frontend Hosting', 'Git & GitHub', 'Environment Security', 'Helmet & CORS']
    }
  ];

  const displayGroups = (Array.isArray(customSkills) && customSkills.length > 0)
    ? customSkills.map(group => ({
        category: group.category || 'Skill Group',
        icon: Terminal,
        items: Array.isArray(group.items) ? group.items : []
      }))
    : defaultSkillGroups;

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-cyan-400 uppercase">
          Capabilities
        </h2>
        <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
          Technical Skills & Tooling
        </p>
        <div className="w-16 h-1 bg-cyan-500 mx-auto mt-4 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayGroups.map((group, idx) => {
          const IconComp = group.icon || Terminal;
          return (
            <div
              key={idx}
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <IconComp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {group.category}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {group.items.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200 text-xs sm:text-sm font-medium hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
