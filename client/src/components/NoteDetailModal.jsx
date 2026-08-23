import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, FileText, Download, ExternalLink, Calendar, Tag, Folder } from 'lucide-react';
import { getMediaUrl } from '../services/api';

export default function NoteDetailModal({ note, onClose }) {
  if (!note) return null;

  const coverUrl = note.cover_image ? getMediaUrl(note.cover_image) : null;
  const pdfUrl = note.pdf_attachment ? getMediaUrl(note.pdf_attachment) : null;
  const tags = Array.isArray(note.tags) ? note.tags : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Folder className="w-4 h-4" />
            <span>{note.category || 'General'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Optional Cover Image */}
          {coverUrl && (
            <div className="rounded-xl overflow-hidden max-h-72 bg-slate-900 border border-slate-800">
              <img
                src={coverUrl}
                alt={note.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Title & Metadata */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {note.title}
            </h1>
            
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              {note.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{new Date(note.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{tags.join(', ')}</span>
                </div>
              )}
            </div>

            {note.short_description && (
              <p className="mt-3 text-sm text-slate-300 font-medium italic border-l-2 border-cyan-500/50 pl-3">
                {note.short_description}
              </p>
            )}
          </div>

          {/* Optional PDF Action Card - ONLY SHOWN IF PDF EXISTS */}
          {pdfUrl && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Attached Study Document / PDF</div>
                  <div className="text-xs text-slate-400">Official reference document for this topic</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Full PDF</span>
                </a>
                <a
                  href={`${pdfUrl}?download=true`}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}

          {/* Markdown Content */}
          <div className="markdown-body text-slate-300 text-base leading-relaxed pt-2 border-t border-slate-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content || '*No content written yet.*'}
            </ReactMarkdown>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
