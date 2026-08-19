import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  FileQuestion,
  Sparkles
} from 'lucide-react';
import { NoteCard } from './NoteCard';

export function NotesHub({ notes = [], categories = ['All'], onSelectNote, bookmarkedIds = [], onToggleBookmark }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter((note) => {
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="notes" className="py-20 px-4 sm:px-6 lg:px-8 relative min-h-[70vh]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <BookOpen className="w-3.5 h-3.5" />
            <span>KNOWLEDGE HUB & CMS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Notes & <span className="cyber-gradient-text">Knowledge</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Ravi's technical notes, cybersecurity research, development guides and learning resources will appear here.
          </p>
        </div>

        {/* Filter and Search Controls (shown if notes exist or search is active) */}
        {(notes.length > 0 || searchQuery) && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors ${
                    selectedCategory === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500/50 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Notes Grid or Empty State */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id || note.slug}
                note={note}
                onClick={() => onSelectNote(note)}
                isBookmarked={bookmarkedIds.includes(note.id)}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel bg-[#0b0f19] rounded-3xl p-12 text-center space-y-4 border border-slate-800 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <FileQuestion className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No notes published yet.</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Technical write-ups, PDF guides, and security research will appear here as soon as they are published via the Admin Dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
