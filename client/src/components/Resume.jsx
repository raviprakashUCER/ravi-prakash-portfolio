import React from 'react';
import { FileText, Download, ExternalLink, Calendar, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';
import { getMediaUrl } from '../services/api';

export default function Resume({ resume }) {
  const resumeUrl = resume?.url ? getMediaUrl(resume.url) : null;

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <section id="resume" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-cyan-400 uppercase">
          Curriculum Vitae
        </h2>
        <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
          Professional Resume
        </p>
        <div className="w-16 h-1 bg-cyan-500 mx-auto mt-4 rounded-full" />
      </div>

      {!resume || !resumeUrl ? (
        <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Resume Document Pending</h3>
          <p className="text-sm text-slate-400">
            The administrator has not uploaded an active resume PDF yet. Please check back shortly or reach out directly via the Contact section.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Action Header Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {resume.original_name || 'Resume.pdf'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    Verified Active
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
                  {resume.uploaded_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Updated: {new Date(resume.uploaded_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                  {resume.file_size && (
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{formatSize(resume.file_size)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Public Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Full Screen</span>
              </a>

              <a
                href={`${resumeUrl}?download=true`}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-sm font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </a>
            </div>
          </div>

          {/* Embedded Viewer Preview Frame */}
          <div className="glass-panel p-2 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-4 py-2.5 rounded-xl border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                <span className="ml-2 font-mono text-slate-300">Resume Document Viewer</span>
              </div>
              <span className="text-[11px] text-cyan-400/80 font-mono">Render Persistent Storage</span>
            </div>

            <div className="relative h-[650px] w-full bg-slate-950 rounded-b-xl overflow-hidden">
              <iframe
                src={`${resumeUrl}#toolbar=0&navpanes=0`}
                title="Resume Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
