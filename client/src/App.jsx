import React, { useState, useEffect, useCallback } from 'react';
import { 
  getProfile, getResume, getNotes, getProjects, 
  getCertificates, verifyAdmin, getAuthToken, API_BASE_URL 
} from './services/api';
import Navbar from './components/Navbar';
import SEO from './components/SEO';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Notes from './components/Notes';
import Resume from './components/Resume';
import Certificates from './components/Certificates';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/AdminDashboard';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  const [backendError, setBackendError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all portfolio data from Render backend
  const loadPortfolioData = useCallback(async () => {
    setLoading(true);
    setBackendError(null);
    try {
      const [profileRes, resumeRes, notesRes, projectsRes, certsRes] = await Promise.allSettled([
        getProfile(),
        getResume(),
        getNotes(),
        getProjects(),
        getCertificates()
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (resumeRes.status === 'fulfilled') setResume(resumeRes.value?.resume || null);
      if (notesRes.status === 'fulfilled') setNotes(Array.isArray(notesRes.value) ? notesRes.value : []);
      if (projectsRes.status === 'fulfilled') setProjects(Array.isArray(projectsRes.value) ? projectsRes.value : []);
      if (certsRes.status === 'fulfilled') setCertificates(Array.isArray(certsRes.value) ? certsRes.value : []);

      // If all failed, report backend connection error
      const allFailed = [profileRes, resumeRes, notesRes, projectsRes, certsRes].every(r => r.status === 'rejected');
      if (allFailed) {
        setBackendError(`Unable to connect to backend server at ${API_BASE_URL}. Please verify the server is running.`);
      }

      // Check existing admin token validity
      if (getAuthToken()) {
        try {
          await verifyAdmin();
          setIsAdminLoggedIn(true);
        } catch {
          setIsAdminLoggedIn(false);
        }
      } else {
        setIsAdminLoggedIn(false);
      }
    } catch (err) {
      console.error('[Portfolio Init Error]', err);
      setBackendError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // Handle Admin Button Click
  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setAdminDashboardOpen(true);
    } else {
      setAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setAdminDashboardOpen(true);
    loadPortfolioData();
  };

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Dynamic SEO Meta & Schema.org Management */}
      <SEO profile={profile} />

      {/* Backend Error Banner */}
      {backendError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-rose-950/90 border-b border-rose-800/80 px-4 py-2 text-xs text-rose-200 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Backend Unavailable: {backendError}</span>
          </div>
          <button
            onClick={loadPortfolioData}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-800 text-white font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Sections */}
      <main className="space-y-12">
        <Hero
          profile={profile}
          resume={resume}
          onNavigate={handleNavigate}
        />

        <About
          profile={profile}
        />

        <Skills
          profile={profile}
        />

        <Projects
          projects={projects}
        />

        <Notes
          notes={notes}
        />

        <Resume
          resume={resume}
        />

        <Certificates
          certificates={certificates}
        />

        <Contact
          profile={profile}
        />
      </main>

      {/* Footer */}
      <Footer
        profile={profile}
        onOpenAdmin={handleOpenAdmin}
        onNavigate={handleNavigate}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
        profile={profile}
        resume={resume}
        notes={notes}
        projects={projects}
        certificates={certificates}
        onRefreshAll={loadPortfolioData}
      />

    </div>
  );
}
