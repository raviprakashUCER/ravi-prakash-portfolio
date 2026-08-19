import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  X,
  Clock,
  Tag,
  BookOpen,
  Calendar,
  Bookmark,
  Share2,
  Check,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export function NoteDetailModal({ note, onClose, onSelectRelated, isBookmarked, onToggleBookmark }) {
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/notes/' + note.slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tagsList = note.tags
    ? note.tags.split(',').map((t) => t.trim())
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-slate-950/90 px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Notes</span>
            </button>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30">
              {note.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(note.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Bookmark note'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Copy Note Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-6">
          {/* Metadata */}
          <div className="space-y-3 border-b border-slate-800/80 pb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {note.title}
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">{note.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Clock className="w-3.5 h-3.5" />
                {note.reading_time || '5 min read'}
              </span>
              <span className="flex items-center gap-1.5 text-purple-300">
                <Calendar className="w-3.5 h-3.5" />
                {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Updated recently'}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                Difficulty: {note.difficulty || 'Intermediate'}
              </span>
            </div>

            {tagsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {tagsList.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-cyan-400 border border-cyan-500/20"
                  >
                    <Tag className="w-3 h-3 text-cyan-500" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Downloadable PDF Attachment Banner */}
            {note.attachment_url && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Download Complete Study Notes PDF</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {note.attachment_name || 'Attached Reference Document (.pdf)'}
                    </p>
                  </div>
                </div>
                <a
                  href={note.attachment_url}
                  download
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-glow-cyan transition-all flex items-center gap-2"
                >
                  <span>Download PDF</span>
                </a>
              </div>
            )}
          </div>

          {/* Cover Image */}
          {note.cover_image_url && (
            <div className="w-full max-h-72 rounded-xl overflow-hidden border border-slate-800">
              <img src={note.cover_image_url} alt={note.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Markdown Body */}
          <div className="markdown-body text-slate-200 text-sm sm:text-base leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {note.content_md}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
