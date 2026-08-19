import React from 'react';
import {
  X,
  ExternalLink,
  Layers,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Cpu,
  ArrowLeft
} from 'lucide-react';
import { GithubIcon } from './Icons';

export function ProjectDetailModal({ project, onClose }) {
  if (!project) return null;

  const features = Array.isArray(project.features)
    ? project.features
    : typeof project.features === 'string'
    ? JSON.parse(project.features || '[]')
    : [];

  const techList = project.technologies
    ? project.technologies.split(',').map((t) => t.trim())
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-slate-950/90 px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
              {project.status || 'Active'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
                title="View GitHub Repository"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
                title="Live Demo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{project.title}</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          {techList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> Architecture & Technologies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {techList.map((tech, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Problem & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {project.problem && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4" /> Challenge / Problem
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{project.problem}</p>
              </div>
            )}

            {project.solution && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Solution & Architecture
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{project.solution}</p>
              </div>
            )}
          </div>

          {/* Screenshots & Architecture Diagrams Gallery */}
          {project.images && project.images.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Screenshots & Architecture Gallery
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.images.map((img, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
                    <img
                      src={img.image_url}
                      alt={img.caption || project.title}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform"
                    />
                    {img.caption && (
                      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Features */}
          {features.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Implemented Capabilities
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {features.map((feat, i) => (
                  <li
                    key={i}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lessons Learned */}
          {project.lessons_learned && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-purple-300 flex items-center gap-1.5 font-bold">
                <Lightbulb className="w-4 h-4 text-purple-400" /> Engineering Takeaways & Lessons
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {project.lessons_learned}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
