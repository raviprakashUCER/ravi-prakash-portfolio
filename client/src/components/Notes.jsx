import React, { useState, useMemo } from 'react';
import { BookOpen, Search, FileText, ArrowRight, Calendar, Tag } from 'lucide-react';
import { getMediaUrl } from '../services/api';
import NoteDetailModal from './NoteDetailModal';

export default function Notes({ notes }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeNote, setActiveNote] = useState(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(['All']);
    notes.forEach(n => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set);
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchCat = selectedCategory === 'All' || n.category === selectedCategory;
      const matchSearch = 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.short_description && n.short_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCat && matchSearch;
    });
  }, [notes, selectedCategory, searchQuery]);

  return (
    <section id="notes" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-xs sm:text-sm font-semibold tracking-widest text-cyan-400 uppercase">
          Engineering Insights
        </h2>
        <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
          Technical Notes & Documentation
        </p>
        <div className="w-16 h-1 bg-cyan-500 mx-auto mt-4 rounded-full" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No notes found matching your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const coverUrl = note.cover_image ? getMediaUrl(note.cover_image) : null;
            const hasPdf = Boolean(note.pdf_attachment);
            const tags = Array.isArray(note.tags) ? note.tags : [];

            return (
              <div
                key={note.id}
                onClick={() => setActiveNote(note)}
                className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-slate-800 cursor-pointer flex flex-col justify-between group"
              >
                {/* Optional Cover Image */}
                {coverUrl && (
                  <div className="h-44 bg-slate-900 overflow-hidden border-b border-slate-800">
                    <img
                      src={coverUrl}
                      alt={note.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Header line: Category & PDF Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                        {note.category || 'General'}
                      </span>
                      {hasPdf && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <FileText className="w-3 h-3" />
                          <span>PDF Included</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {note.title}
                    </h3>

                    {note.short_description && (
                      <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                        {note.short_description}
                      </p>
                    )}
                  </div>

                  <div>
                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <span>
                        {note.created_at ? new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </span>
                      <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read note <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note View Modal */}
      {activeNote && (
        <NoteDetailModal
          note={activeNote}
          onClose={() => setActiveNote(null)}
        />
      )}
    </section>
  );
}
