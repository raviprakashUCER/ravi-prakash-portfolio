import React, { useState } from 'react';
import { Award, ExternalLink, Calendar, Eye, FileText, CheckCircle } from 'lucide-react';
import { getMediaUrl } from '../services/api';

export default function Certificates({ certificates }) {
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <section id="certificates" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-cyan-400 uppercase">
          Credentials
        </h2>
        <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
          Certifications & Accreditations
        </p>
        <div className="w-16 h-1 bg-cyan-500 mx-auto mt-4 rounded-full" />
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 max-w-lg mx-auto">
          <Award className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No certificates added yet.</p>
          <p className="text-xs text-slate-500 mt-1">Admin can add verified certifications via the Admin Panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const fileUrl = cert.file_url ? getMediaUrl(cert.file_url) : null;
            const isPdf = cert.file_url && cert.file_url.toLowerCase().endsWith('.pdf');

            return (
              <div
                key={cert.id}
                className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Award className="w-5 h-5" />
                    </div>
                    {cert.issue_date && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{cert.issue_date}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {cert.title}
                  </h3>
                  
                  <p className="mt-1 text-xs sm:text-sm text-cyan-400/90 font-medium">
                    {cert.organization || 'Issuing Authority'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {fileUrl ? (
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isPdf ? 'View PDF' : 'View Certificate'}</span>
                    </button>
                  ) : <span />}

                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedCert.title}</h3>
                <p className="text-xs text-slate-400">{selectedCert.organization}</p>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[400px]">
              {selectedCert.file_url?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={getMediaUrl(selectedCert.file_url)}
                  title={selectedCert.title}
                  className="w-full h-[550px] border-none"
                />
              ) : (
                <img
                  src={getMediaUrl(selectedCert.file_url)}
                  alt={selectedCert.title}
                  className="max-h-[550px] w-auto object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <a
                href={getMediaUrl(selectedCert.file_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </a>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
