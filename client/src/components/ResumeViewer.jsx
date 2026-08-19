import React from 'react';
import {
  FileText,
  Download,
  Printer,
  ExternalLink,
  Shield,
  FileQuestion,
  User
} from 'lucide-react';

export function ResumeViewer({ resumeData }) {
  const profile = resumeData?.profile || {};
  const activeResume = resumeData?.activeResume || (profile?.resume_url ? { file_url: profile.resume_url, version_name: 'Official Resume' } : null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="resume" className="py-24 px-4 sm:px-6 lg:px-8 relative min-h-[85vh]">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-300">
              <FileText className="w-3.5 h-3.5" />
              <span>CURRICULUM VITAE</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {profile.name || 'Ravi Prakash'} — <span className="cyber-gradient-text">Resume</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {activeResume?.version_name ? `Active Version: ${activeResume.version_name}` : 'Official Curriculum Vitae'}
            </p>
          </div>

          {activeResume?.file_url && (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={activeResume.file_url}
                download
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold shadow-glow-cyan hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </a>

              <a
                href={activeResume.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white text-xs font-medium transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Fullscreen</span>
              </a>
            </div>
          )}
        </div>

        {/* Embedded Viewer or Empty State */}
        {activeResume?.file_url ? (
          <div className="glass-panel bg-[#0b0f19] border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="h-[750px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <iframe
                src={activeResume.file_url}
                title="Ravi Prakash Resume PDF"
                className="w-full h-full rounded-2xl"
              />
            </div>
          </div>
        ) : (
          <div className="glass-panel bg-[#0b0f19] border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
              <FileQuestion className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">No resume has been published yet.</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Ravi's official curriculum vitae and verified qualifications will appear here once uploaded and activated through the Admin Dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
