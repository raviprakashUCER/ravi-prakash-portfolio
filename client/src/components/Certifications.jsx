import React from 'react';
import { Award, FileQuestion } from 'lucide-react';
import { CertificationCard } from './CertificationCard';

export function Certifications({ certs = [], onSelectCert }) {
  return (
    <section id="certifications" className="py-20 px-4 sm:px-6 lg:px-8 relative min-h-[60vh]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-xs font-mono text-amber-300">
            <Award className="w-3.5 h-3.5" />
            <span>VERIFIED ACHIEVEMENTS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Certifications & <span className="cyber-gradient-text">Badges</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Professional certifications and verified achievements will appear here.
          </p>
        </div>

        {/* Certifications Grid or Empty State */}
        {certs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {certs.map((cert) => (
              <CertificationCard
                key={cert.id || cert.slug || cert.title}
                cert={cert}
                onView={onSelectCert}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel bg-[#0b0f19] rounded-3xl p-12 text-center space-y-4 border border-slate-800 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <FileQuestion className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No certifications added yet.</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accredited course completions, security credentials, and certificates will appear here once registered through the Admin Dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
