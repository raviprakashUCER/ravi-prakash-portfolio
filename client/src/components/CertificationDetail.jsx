import React from 'react';
import {
  ArrowLeft,
  Award,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Download,
  FileText
} from 'lucide-react';

export function CertificationDetail({ cert, onBack }) {
  if (!cert) return null;

  const isPdf = cert.certificate_file_url?.toLowerCase().endsWith('.pdf');
  const isImg = cert.certificate_file_url?.match(/\.(jpeg|jpg|png|webp|svg)$/i) || cert.image_url;
  const docUrl = cert.certificate_file_url || cert.image_url;

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Certifications</span>
        </button>
      </div>

      {/* Main Certification Card */}
      <article className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-xs font-mono text-amber-300">
              <Award className="w-3.5 h-3.5" />
              <span>ACCREDITED CREDENTIAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{cert.title}</h1>
            <p className="text-sm text-cyan-400 font-medium">
              Issuing Organization: <strong className="text-white">{cert.organization}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {docUrl && (
              <a
                href={docUrl}
                download
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-mono font-bold shadow-glow-cyan transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </a>
            )}

            {cert.credential_url && (
              <a
                href={cert.credential_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 hover:text-white text-xs font-mono transition-colors"
              >
                <span>Verify Credential</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Certificate Display / Viewer */}
        <div className="p-4 sm:p-6 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[300px]">
          {isPdf ? (
            <iframe
              src={docUrl}
              title={cert.title}
              className="w-full h-[550px] rounded-xl border border-slate-800"
            />
          ) : isImg ? (
            <img
              src={docUrl}
              alt={cert.title}
              className="max-h-[500px] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800/80"
            />
          ) : (
            <div className="text-center space-y-3 py-10">
              <Award className="w-12 h-12 text-amber-500/40 mx-auto" />
              <p className="text-xs text-slate-400">Certificate document file has not been uploaded yet.</p>
              {cert.credential_url && (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  <span>Verify at {cert.organization}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Issue Date</span>
            <span className="text-white font-bold text-sm">{cert.issue_date || 'Completed'}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Credential ID</span>
            <span className="text-cyan-300 font-bold text-sm">{cert.credential_id || 'Verified Credential'}</span>
          </div>
        </div>

        {cert.description && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Curriculum & Competencies Covered</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{cert.description}</p>
          </div>
        )}
      </article>
    </div>
  );
}
