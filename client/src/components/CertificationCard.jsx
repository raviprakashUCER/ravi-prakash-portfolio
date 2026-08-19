import React from 'react';
import { Award, ExternalLink, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export function CertificationCard({ cert, onView }) {
  if (!cert) return null;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 group transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1">
      <div className="space-y-3">
        {/* Card Header & Badge */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified
          </span>
        </div>

        {/* Certificate Image Preview if uploaded */}
        {cert.image_url && (
          <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950">
            <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
            {cert.title}
          </h3>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Issuing Organization: <span className="text-cyan-400 font-semibold">{cert.organization}</span>
          </p>
        </div>

        {cert.credential_id && cert.credential_id !== 'Not added yet' && (
          <div className="text-xs font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            Credential ID: <span className="text-slate-200 font-bold">{cert.credential_id}</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <span>Issued: <strong className="text-cyan-400 font-medium">{cert.issue_date || 'Completed'}</strong></span>

        <div className="flex items-center gap-2">
          {onView && (
            <button
              onClick={() => onView(cert)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {cert.credential_url && (
            <a
              href={cert.credential_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <span>Verify</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
