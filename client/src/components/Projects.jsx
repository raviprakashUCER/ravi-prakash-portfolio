import React, { useState } from 'react';
import { ExternalLink, Layers, Eye, FolderGit2 } from 'lucide-react';
import { GithubIcon } from './Icons';
import { getMediaUrl } from '../services/api';

export default function Projects({ projects }) {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-cyan-400 uppercase">
          Portfolio Work
        </h2>
        <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
          Featured Engineering Projects
        </p>
        <div className="w-16 h-1 bg-cyan-500 mx-auto mt-4 rounded-full" />
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 max-w-lg mx-auto">
          <FolderGit2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No projects published yet.</p>
          <p className="text-xs text-slate-500 mt-1">Admin can add featured projects via the Admin Panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project) => {
            const imageUrl = project.image_url ? getMediaUrl(project.image_url) : null;
            const techList = Array.isArray(project.technologies) ? project.technologies : [];

            return (
              <div
                key={project.id}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-slate-800 flex flex-col group"
              >
                {/* Project Image Header */}
                <div className="relative h-48 bg-slate-900 overflow-hidden border-b border-slate-800">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-center text-cyan-400 ${imageUrl ? 'hidden' : 'flex'}`}
                  >
                    <Layers className="w-12 h-12 opacity-60" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-slate-300 text-sm line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div>
                    {/* Tech Stack */}
                    {techList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {techList.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-0.5 rounded-md bg-slate-900/90 text-cyan-300 border border-slate-800 text-xs font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Links */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <div className="flex items-center gap-3">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
                          >
                            <GithubIcon className="w-4 h-4" />
                            <span>Code</span>
                          </a>
                        )}
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Live Demo</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedProject(project)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-2xl font-bold text-white">{selectedProject.title}</h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {selectedProject.image_url && (
              <div className="rounded-xl overflow-hidden max-h-72 bg-slate-900 border border-slate-800">
                <img
                  src={getMediaUrl(selectedProject.image_url)}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {selectedProject.description}
            </div>

            {Array.isArray(selectedProject.technologies) && selectedProject.technologies.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Technologies Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((t, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-800 text-cyan-300 rounded-md text-xs font-mono border border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              {selectedProject.github_url && (
                <a
                  href={selectedProject.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl border border-slate-700 flex items-center gap-2"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
              {selectedProject.demo_url && (
                <a
                  href={selectedProject.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
