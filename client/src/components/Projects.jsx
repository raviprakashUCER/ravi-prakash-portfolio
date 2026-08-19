import React, { useState } from 'react';
import {
  Code,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Shield,
  Bot,
  Terminal,
  Cpu,
  FileCode
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { ProjectDetailModal } from './ProjectDetailModal';

export function Projects({ projects = [] }) {
  const [activeProject, setActiveProject] = useState(null);

  const getProjectIcon = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('jarvis') || t.includes('ai')) return <Bot className="w-5 h-5 text-purple-400" />;
    if (t.includes('recon') || t.includes('cyber') || t.includes('security') || t.includes('vulnerability'))
      return <Shield className="w-5 h-5 text-cyan-400" />;
    return <Terminal className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Code className="w-3.5 h-3.5" />
            <span>PORTFOLIO & EXPERIMENTAL LABS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Featured <span className="cyber-gradient-text">Projects</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Practical applications, automated security tools, and software experiments designed and built from the ground up.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            const techList = project.technologies
              ? project.technologies.split(',').slice(0, 4).map((t) => t.trim())
              : [];

            return (
              <div
                key={project.id || project.slug}
                className="glass-panel glass-panel-hover rounded-2xl p-6 sm:p-7 border border-slate-800 flex flex-col justify-between group space-y-5"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors">
                      {getProjectIcon(project.title)}
                    </div>
                    <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
                      {project.status || 'Active'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech stack pills */}
                  {techList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {techList.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setActiveProject(project)}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold group-hover:underline"
                  >
                    <span>View Architecture & Lessons</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                        title="GitHub"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    )}
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-colors"
                        title="Demo"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <ProjectDetailModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  );
}
