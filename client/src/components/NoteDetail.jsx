import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Bookmark,
  Share2,
  Check,
  BookOpen,
  Download,
  ExternalLink,
  User,
  Shield,
  FileText
} from 'lucide-react';

export function NoteDetail({ note, onBack, isBookmarked, onToggleBookmark }) {
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/notes/' + note.slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tagsList = note.tags
    ? note.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Notes</span>
        </button>

        <div className="flex items-center gap-2">
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(note.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Bookmark Note"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-colors"
            title="Share Note URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Note Container */}
      <article className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8 shadow-2xl">
        {/* Cover Image Banner */}
        {note.cover_image_url && (
          <div className="w-full max-h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
            <img
              src={note.cover_image_url}
              alt={note.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Note Metadata Header */}
        <div className="space-y-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
              {note.category || 'Cybersecurity'}
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              {note.difficulty || 'Intermediate'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            {note.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {note.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Author: <strong className="text-white">Ravi Prakash</strong>
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Clock className="w-3.5 h-3.5" />
              {note.reading_time || '5 min read'}
            </span>
            <span className="flex items-center gap-1.5 text-purple-300">
              <Calendar className="w-3.5 h-3.5" />
              Published: {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Recent'}
            </span>
          </div>

          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tagsList.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                >
                  <Tag className="w-3 h-3 text-cyan-400" />
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Toolbar: Read Online | View PDF | Download PDF */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Actions:</span>
            <a
              href="#note-content"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-mono font-medium border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Online</span>
            </a>
          </div>

          {note.attachment_url && (
            <div className="flex items-center gap-2">
              <a
                href={note.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 text-purple-300 text-xs font-mono font-medium border border-purple-500/30 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View PDF</span>
              </a>

              <a
                href={note.attachment_url}
                download
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-mono font-bold shadow-glow-cyan transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          )}
        </div>

        {/* Markdown Note Content */}
        <div id="note-content" className="markdown-body text-slate-200 text-sm sm:text-base leading-relaxed pt-4">
          {note.content_md ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {note.content_md}
            </ReactMarkdown>
          ) : (
            <p className="text-slate-500 italic font-mono text-xs">Note content not available.</p>
          )}
        </div>
      </article>
    </div>
  );
}
