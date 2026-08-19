import React from 'react';
import { Bookmark, Clock, ArrowRight, FileText, Tag } from 'lucide-react';

export function NoteCard({ note, onClick, isBookmarked, onToggleBookmark }) {
  if (!note) return null;
  const tags = note.tags ? note.tags.split(',').map((t) => t.trim()).slice(0, 3) : [];

  return (
    <div
      onClick={onClick}
      className="glass-panel glass-panel-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between group space-y-4 cursor-pointer transition-all duration-300 hover:border-cyan-500/40 hover:-translate-y-1"
    >
      <div className="space-y-3">
        {/* Category & Bookmark */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-500/30">
            {note.category || 'General'}
          </span>
          <div className="flex items-center gap-1.5">
            {note.attachment_url && (
              <span className="text-[10px] font-mono text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                <FileText className="w-3 h-3" /> PDF
              </span>
            )}
            {onToggleBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(note.id);
                }}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isBookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-white'
                }`}
                title={isBookmarked ? 'Bookmarked' : 'Bookmark Note'}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {note.cover_image_url && (
          <div className="h-36 w-full rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950">
            <img
              src={note.cover_image_url}
              alt={note.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
          {note.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
          {note.description}
        </p>
      </div>

      {/* Meta Bar */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{note.reading_time || '5 min read'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{note.difficulty || 'Beginner'}</span>
          </div>

          <span className="inline-flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Read Note</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
