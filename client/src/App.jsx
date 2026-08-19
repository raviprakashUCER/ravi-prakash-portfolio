import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { NotesHub } from './components/NotesHub';
import { NoteDetail } from './components/NoteDetail';
import { Projects } from './components/Projects';
import { ResumeViewer } from './components/ResumeViewer';
import { Certifications } from './components/Certifications';
import { CertificationDetail } from './components/CertificationDetail';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { AIAssistant } from './components/AIAssistant';
import { AdminDashboard } from './components/AdminDashboard';
import { api } from './services/api';
import { Sparkles } from 'lucide-react';

export function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [darkMode, setDarkMode] = useState(true);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('ravi_admin_token') || '');

  // Detail views for direct slug navigation
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  // Bookmarks in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ravi_bookmarked_notes') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Data states
  const [profileData, setProfileData] = useState(null);
  const [socials, setSocials] = useState([]);
  const [journey, setJourney] = useState([]);
  const [skillsGrouped, setSkillsGrouped] = useState({});
  const [skillsList, setSkillsList] = useState([]);
  const [notes, setNotes] = useState([]);
  const [notesCategories, setNotesCategories] = useState(['All']);
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync dark class on document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  // Load all initial public data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, sRes, nRes, prRes, cRes, rRes] = await Promise.all([
        api.getProfile(),
        api.getSkills(),
        api.getNotes(),
        api.getProjects(),
        api.getCertifications(),
        api.getResume(),
      ]);

      if (pRes.success) {
        setProfileData(pRes.data.profile);
        setSocials(pRes.data.socials || []);
        setJourney(pRes.data.journey || []);
      }
      if (sRes.success) {
        setSkillsGrouped(sRes.data.grouped || {});
        setSkillsList(sRes.data.skills || []);
      }
      if (nRes.success) {
        setNotes(nRes.data.notes || []);
        setNotesCategories(nRes.data.categories || ['All']);
      }
      if (prRes.success) {
        setProjects(prRes.data || []);
      }
      if (cRes.success) {
        setCerts(cRes.data || []);
      }
      if (rRes.success) {
        setResumeData(rRes.data);
      }
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Direct hash or path detection
    const path = window.location.pathname;
    if (path.includes('admin')) {
      setIsAdminOpen(true);
    } else if (path.includes('resume')) {
      setActiveSection('resume');
    } else if (path.includes('notes')) {
      setActiveSection('notes');
    } else if (path.includes('certifications')) {
      setActiveSection('certifications');
    } else if (path.includes('projects')) {
      setActiveSection('projects');
    }
  }, []);

  const handleToggleBookmark = (id) => {
    const next = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((b) => b !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    localStorage.setItem('ravi_bookmarked_notes', JSON.stringify(next));
  };

  const handleNavigate = (id) => {
    setSelectedNote(null);
    setSelectedCert(null);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ravi_admin_token');
    setAuthToken('');
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={(id) => {
          setSelectedNote(null);
          setSelectedCert(null);
          handleNavigate(id);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        isAdminLoggedIn={!!authToken}
      />

      {/* Main Content Sections */}
      <main className="relative">
        {selectedNote ? (
          <NoteDetail
            note={selectedNote}
            onBack={() => setSelectedNote(null)}
            isBookmarked={bookmarkedIds.includes(selectedNote.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : selectedCert ? (
          <CertificationDetail
            cert={selectedCert}
            onBack={() => setSelectedCert(null)}
          />
        ) : (
          <>
            <Hero
              profile={profileData}
              socials={socials}
              onOpenAI={() => setIsAIOpen(true)}
              onNavigate={handleNavigate}
            />

            <About profile={profileData} journey={journey} />

            <Skills skillsGrouped={skillsGrouped} skillsList={skillsList} />

            <NotesHub
              notes={notes}
              categories={notesCategories}
              onSelectNote={async (n) => {
                try {
                  const res = await api.getNoteBySlug(n.slug);
                  if (res.success && res.data.note) {
                    setSelectedNote(res.data.note);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setSelectedNote(n);
                  }
                } catch (e) {
                  setSelectedNote(n);
                }
              }}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={handleToggleBookmark}
            />

            <Projects projects={projects} />

            <ResumeViewer resumeData={resumeData} />

            <Certifications
              certs={certs}
              onSelectCert={(c) => {
                setSelectedCert(c);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <Contact profile={profileData} socials={socials} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        socials={socials}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Floating Ask Ravi AI Trigger Button */}
      {!isAIOpen && (
        <button
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white font-bold text-xs shadow-2xl shadow-cyan-500/40 hover:shadow-glow-purple hover:scale-105 active:scale-95 transition-all cursor-pointer group border border-white/20"
        >
          <div className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
          </div>
          <span>Ask Ravi AI</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      )}

      {/* Grounded AI Assistant Drawer */}
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      {/* Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          fetchData();
        }}
        onLogout={handleLogout}
        authToken={authToken}
        setAuthToken={setAuthToken}
      />
    </div>
  );
}

export default App;
