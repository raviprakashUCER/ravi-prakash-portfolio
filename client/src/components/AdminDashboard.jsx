import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  X,
  FileText,
  Code,
  Shield,
  Award,
  Share2,
  Cpu,
  Mail,
  User,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Key,
  FolderOpen,
  Image as ImageIcon,
  Check,
  UploadCloud,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { MediaLibraryTab } from './MediaLibraryTab';
import { MediaSelectorModal } from './MediaSelectorModal';

export function AdminDashboard({ isOpen, onClose, onLogout, authToken, setAuthToken }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: 'ravi', password: '' });
  const [loginError, setLoginError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [notesList, setNotesList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [certsList, setCertsList] = useState([]);
  const [resumesList, setResumesList] = useState([]);
  const [socialsList, setSocialsList] = useState([]);
  const [aiList, setAiList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Editor states
  const [editingNote, setEditingNote] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editingCert, setEditingCert] = useState(null);
  const [editingSocial, setEditingSocial] = useState(null);
  const [editingAI, setEditingAI] = useState(null);
  const [newResumeForm, setNewResumeForm] = useState({ version_name: '', file_url: '', is_active: true });

  // Media selector modal state
  const [mediaSelectorConfig, setMediaSelectorConfig] = useState({
    isOpen: false,
    title: '',
    onSelect: null
  });

  useEffect(() => {
    if (authToken && isOpen) {
      loadAdminData();
    }
  }, [authToken, isOpen, activeTab]);

  const loadAdminData = async () => {
    if (!authToken) return;
    try {
      if (activeTab === 'stats') {
        const res = await api.adminGetStats(authToken);
        if (res.success) setStats(res.stats);
      } else if (activeTab === 'profile') {
        const res = await api.adminGetProfile(authToken);
        if (res.success) setProfileData(res.profile);
      } else if (activeTab === 'notes') {
        const res = await api.adminGetNotes(authToken);
        if (res.success) setNotesList(res.notes);
      } else if (activeTab === 'projects') {
        const res = await api.adminGetProjects(authToken);
        if (res.success) setProjectsList(res.projects);
      } else if (activeTab === 'skills') {
        const res = await api.adminGetSkills(authToken);
        if (res.success) setSkillsList(res.skills);
      } else if (activeTab === 'certs') {
        const res = await api.adminGetCertifications(authToken);
        if (res.success) setCertsList(res.certs);
      } else if (activeTab === 'resumes') {
        const res = await api.adminGetResumes(authToken);
        if (res.success) setResumesList(res.resumes);
      } else if (activeTab === 'socials') {
        const res = await api.adminGetSocials(authToken);
        if (res.success) setSocialsList(res.socials);
      } else if (activeTab === 'ai') {
        const res = await api.adminGetAIKnowledge(authToken);
        if (res.success) setAiList(res.items);
      } else if (activeTab === 'messages') {
        const res = await api.adminGetMessages(authToken);
        if (res.success) setMessagesList(res.messages);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  const [setupMode, setSetupMode] = useState(false);
  const [setupStatus, setSetupStatus] = useState({ needsSetup: false, adminEmail: 'raviprakash.techpro@gmail.com' });
  const [setupForm, setSetupForm] = useState({
    username: 'ravi',
    email: 'raviprakash.techpro@gmail.com',
    password: '',
    confirmPassword: ''
  });
  const [resetDevMode, setResetDevMode] = useState(false);
  const [resetDevPassword, setResetDevPassword] = useState('');

  useEffect(() => {
    if (isOpen && !authToken) {
      checkSetup();
    }
  }, [isOpen, authToken]);

  const checkSetup = async () => {
    try {
      const res = await api.getSetupStatus();
      if (res.success) {
        setSetupStatus(res);
        if (res.needsSetup) {
          setSetupMode(true);
        }
      }
    } catch (e) {
      console.error('Setup status error:', e);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (setupForm.password !== setupForm.confirmPassword) {
      setLoginError('Passwords do not match.');
      return;
    }
    if (setupForm.password.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await api.setupFirstAdmin({
        username: setupForm.username,
        email: setupForm.email,
        password: setupForm.password
      });

      if (res.success && res.token) {
        localStorage.setItem('ravi_admin_token', res.token);
        setAuthToken(res.token);
        setSetupMode(false);
        showNotification('Admin account initialized successfully! Logged in.');
      } else {
        setLoginError(res.error || 'Setup failed.');
      }
    } catch (err) {
      setLoginError('Failed to initialize admin account.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginForm.username || !loginForm.password) {
      setLoginError('Please enter both username/email and password.');
      return;
    }

    try {
      const res = await api.login(loginForm.username, loginForm.password);
      if (res.success && res.token) {
        localStorage.setItem('ravi_admin_token', res.token);
        setAuthToken(res.token);
        showNotification('Welcome back! Logged in successfully.');
      } else {
        setLoginError(res.error || 'Invalid credentials.');
      }
    } catch (err) {
      setLoginError('Failed to sign in. Please try again.');
    }
  };

  const handleDevReset = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!resetDevPassword || resetDevPassword.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await api.devResetPassword({
        newPassword: resetDevPassword,
        confirmEmail: setupStatus.adminEmail || 'raviprakash.techpro@gmail.com'
      });

      if (res.success) {
        showNotification(res.message);
        setResetDevMode(false);
        setResetDevPassword('');
      } else {
        setLoginError(res.error || 'Reset failed.');
      }
    } catch (e) {
      setLoginError('Failed to reset password.');
    }
  };

  const showNotification = (msg, type = 'success') => {
    setFeedback({ message: msg, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const openMediaSelector = (title, onSelectCallback) => {
    setMediaSelectorConfig({
      isOpen: true,
      title,
      onSelect: onSelectCallback
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Ravi Prakash Admin Hub</h2>
              <span className="text-[10px] font-mono text-cyan-400">Content Management & Media System</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {authToken && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-mono transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'error'
                ? 'bg-rose-950/80 border-b border-rose-500/30 text-rose-200'
                : 'bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-200'
            }`}
          >
            {feedback.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Not Logged In -> Setup / Reset / Login Form */}
        {!authToken ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto space-y-6">
            {setupMode ? (
              /* First-Time Admin Setup */
              <div className="space-y-4">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                    <Key className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">First-Time Admin Setup</h3>
                  <p className="text-xs text-slate-400">Initialize your administrator credentials for Ravi Prakash's platform.</p>
                </div>

                <form onSubmit={handleSetupSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Admin Email</label>
                    <input
                      type="email"
                      required
                      value={setupForm.email}
                      onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={setupForm.username}
                      onChange={(e) => setSetupForm({ ...setupForm, username: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Create Password (min. 6 characters)</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter strong password..."
                      value={setupForm.password}
                      onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password..."
                      value={setupForm.confirmPassword}
                      onChange={(e) => setSetupForm({ ...setupForm, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-white focus:outline-none"
                    />
                  </div>

                  {loginError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold shadow-glow-cyan hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    Initialize & Log In
                  </button>
                </form>
              </div>
            ) : resetDevMode ? (
              /* Dev Mode Password Reset */
              <div className="space-y-4">
                <div className="text-center space-y-1.5">
                  <h3 className="text-xl font-bold text-white">Reset Admin Password</h3>
                  <p className="text-xs text-slate-400">
                    Set a new password for <code className="text-cyan-300">{setupStatus.adminEmail || 'raviprakash.techpro@gmail.com'}</code>.
                  </p>
                </div>

                <form onSubmit={handleDevReset} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">New Password (min 6 chars)</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter new password..."
                      value={resetDevPassword}
                      onChange={(e) => setResetDevPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-white focus:outline-none"
                    />
                  </div>

                  {loginError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                      {loginError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setResetDevMode(false)}
                      className="w-1/3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs hover:bg-slate-800"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Standard Administrator Login */
              <div className="space-y-4">
                <div className="text-center space-y-1.5">
                  <h3 className="text-xl font-bold text-white">Administrator Login</h3>
                  <p className="text-xs text-slate-400">Enter your credentials to manage content and files.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Username or Email</label>
                    <input
                      type="text"
                      required
                      placeholder="ravi or raviprakash.techpro@gmail.com"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter your password..."
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-white focus:outline-none"
                    />
                  </div>

                  {loginError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold shadow-glow-cyan hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    Sign In to Dashboard
                  </button>

                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <button
                      type="button"
                      onClick={() => setResetDevMode(true)}
                      className="text-cyan-400 hover:underline"
                    >
                      Reset password (Dev)?
                    </button>
                    <span>Approved: {setupStatus.adminEmail || 'raviprakash.techpro@gmail.com'}</span>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 bg-slate-950/80 border-r border-slate-800 p-3 space-y-1 shrink-0 overflow-y-auto">
              {[
                { id: 'stats', label: 'Dashboard Stats', icon: Shield },
                { id: 'media', label: 'Media Library', icon: FolderOpen },
                { id: 'resumes', label: 'Resume Files', icon: FileCheck },
                { id: 'profile', label: 'Profile Details', icon: User },
                { id: 'notes', label: 'Notes CMS', icon: FileText },
                { id: 'projects', label: 'Projects & Gallery', icon: Code },
                { id: 'skills', label: 'Skills Matrix', icon: Cpu },
                { id: 'certs', label: 'Certifications', icon: Award },
                { id: 'socials', label: 'Social Channels', icon: Share2 },
                { id: 'ai', label: 'AI Knowledge Base', icon: Cpu },
                { id: 'messages', label: 'Contact Messages', icon: Mail },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                      activeTab === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB: STATS */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white">System Metrics & Overview</h3>
                  {stats ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Published Notes', val: stats.totalNotes, color: 'text-cyan-400' },
                        { label: 'Live Projects', val: stats.totalProjects, color: 'text-purple-400' },
                        { label: 'Media Files', val: stats.totalMediaFiles || 0, color: 'text-rose-400' },
                        { label: 'Active Skills', val: stats.totalSkills, color: 'text-emerald-400' },
                        { label: 'Certifications', val: stats.totalCerts, color: 'text-amber-400' },
                        { label: 'Social Profiles', val: stats.totalSocials, color: 'text-blue-400' },
                        { label: 'AI Knowledge Items', val: stats.totalAIEntries, color: 'text-pink-400' },
                        { label: 'Profile Views', val: stats.profileViews, color: 'text-teal-400' },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                          <span className="text-xs text-slate-400 font-mono block">{item.label}</span>
                          <span className={`text-2xl font-bold font-mono mt-1 block ${item.color}`}>
                            {item.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Loading stats...</p>
                  )}
                </div>
              )}

              {/* TAB: MEDIA LIBRARY */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Central Media Storage</h3>
                    <p className="text-xs text-slate-400">Upload, preview, replace, and manage documents and images.</p>
                  </div>
                  <MediaLibraryTab authToken={authToken} />
                </div>
              )}

              {/* TAB: RESUMES */}
              {activeTab === 'resumes' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Resume File Management</h3>
                      <p className="text-xs text-slate-400">Upload real PDF resumes and select which version is active on the website.</p>
                    </div>
                  </div>

                  {/* Add Resume Form */}
                  <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-mono uppercase text-cyan-300 font-bold">Register / Attach Resume</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Version Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Ravi_Prakash_Resume_2026.pdf"
                          value={newResumeForm.version_name}
                          onChange={(e) => setNewResumeForm({ ...newResumeForm, version_name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Resume File URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="/media/public/resume.pdf"
                            value={newResumeForm.file_url}
                            onChange={(e) => setNewResumeForm({ ...newResumeForm, file_url: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              openMediaSelector('Select Resume PDF', (file) => {
                                setNewResumeForm({
                                  ...newResumeForm,
                                  file_url: file.public_url,
                                  version_name: newResumeForm.version_name || file.original_name
                                });
                              })
                            }
                            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono shrink-0"
                          >
                            Choose File
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={newResumeForm.is_active}
                          onChange={(e) => setNewResumeForm({ ...newResumeForm, is_active: e.target.checked })}
                        />
                        <span>Set as active resume (used on public "Download Resume" buttons)</span>
                      </label>
                      <button
                        onClick={async () => {
                          if (!newResumeForm.file_url) {
                            showNotification('Please select or enter a resume file URL', 'error');
                            return;
                          }
                          const res = await api.adminSaveResume(authToken, newResumeForm);
                          if (res.success) {
                            showNotification('Resume registered successfully!');
                            setNewResumeForm({ version_name: '', file_url: '', is_active: true });
                            loadAdminData();
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                      >
                        Save Resume
                      </button>
                    </div>
                  </div>

                  {/* Resumes List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase text-slate-400">Uploaded Resume Versions</h4>
                    {resumesList.map((r) => (
                      <div
                        key={r.id}
                        className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                          r.is_active
                            ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{r.version_name}</span>
                            {r.is_active ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Active Public Resume
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 font-mono text-[11px] truncate max-w-md">
                            URL: <a href={r.file_url} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{r.file_url}</a>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {!r.is_active && (
                            <button
                              onClick={async () => {
                                await api.adminSetActiveResume(authToken, r.id);
                                showNotification('Resume marked as active!');
                                loadAdminData();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs"
                            >
                              Make Active
                            </button>
                          )}
                          <a
                            href={r.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                            title="Preview File"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this resume version?')) {
                                await api.adminDeleteResume(authToken, r.id);
                                showNotification('Resume removed');
                                loadAdminData();
                              }
                            }}
                            className="p-2 rounded-lg text-rose-400 hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {resumesList.length === 0 && (
                      <p className="text-xs text-slate-500 py-6 text-center">No resume versions uploaded yet.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: PROFILE */}
              {activeTab === 'profile' && profileData && (
                <div className="space-y-5 max-w-2xl">
                  <h3 className="text-lg font-bold text-white">Edit Profile & Avatar</h3>

                  {/* Profile Avatar Picker */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                      {profileData.avatar_url ? (
                        <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-slate-500" />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-white block">Profile Avatar Image</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openMediaSelector('Select Profile Avatar', (file) => {
                              setProfileData({ ...profileData, avatar_url: file.public_url });
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-colors"
                        >
                          Choose from Media
                        </button>
                        {profileData.avatar_url && (
                          <button
                            type="button"
                            onClick={() => setProfileData({ ...profileData, avatar_url: '' })}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs hover:text-white"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name || ''}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Headline</label>
                      <input
                        type="text"
                        value={profileData.headline || ''}
                        onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Bio</label>
                      <textarea
                        rows={3}
                        value={profileData.bio || ''}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={profileData.location || ''}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Current Focus</label>
                      <input
                        type="text"
                        value={profileData.current_focus || ''}
                        onChange={(e) => setProfileData({ ...profileData, current_focus: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        const res = await api.adminUpdateProfile(authToken, profileData);
                        if (res.success) showNotification('Profile updated successfully!');
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors"
                    >
                      <Save className="w-4 h-4" /> Save Profile
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: NOTES CMS */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Notes CMS</h3>
                      <p className="text-xs text-slate-400">Write markdown notes, attach PDFs, and upload cover images.</p>
                    </div>
                    <button
                      onClick={() =>
                        setEditingNote({
                          title: '',
                          slug: '',
                          category: 'Cybersecurity',
                          tags: '',
                          description: '',
                          content_md: '# Note Title\n\nWrite markdown notes here...',
                          reading_time: '5 min read',
                          difficulty: 'Intermediate',
                          cover_image_url: '',
                          attachment_url: '',
                          attachment_name: '',
                          is_public: 1,
                          is_published: 1
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Note
                    </button>
                  </div>

                  {/* Notes Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                      <thead className="bg-slate-950 text-slate-400 font-mono">
                        <tr>
                          <th className="p-3">Title</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">PDF Attachment</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {notesList.map((n) => (
                          <tr key={n.id} className="hover:bg-slate-900/50">
                            <td className="p-3 font-semibold text-white">
                              <div className="flex items-center gap-2">
                                {n.cover_image_url && (
                                  <img src={n.cover_image_url} alt="" className="w-6 h-6 object-cover rounded" />
                                )}
                                <span>{n.title}</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-cyan-400">{n.category}</td>
                            <td className="p-3">
                              {n.attachment_url ? (
                                <a href={n.attachment_url} target="_blank" rel="noreferrer" className="text-cyan-400 underline font-mono text-[11px] flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5" /> PDF Attached
                                </a>
                              ) : (
                                <span className="text-slate-500 text-[11px]">None</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                  n.is_published ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {n.is_published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => setEditingNote(n)}
                                className="p-1.5 rounded text-cyan-400 hover:bg-slate-800"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm('Delete this note?')) {
                                    await api.adminDeleteNote(authToken, n.id);
                                    showNotification('Note deleted');
                                    loadAdminData();
                                  }
                                }}
                                className="p-1.5 rounded text-rose-400 hover:bg-slate-800"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: PROJECTS */}
              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Project Showcase & Galleries</h3>
                      <p className="text-xs text-slate-400">Manage projects with multiple screenshots, diagrams, and links.</p>
                    </div>
                    <button
                      onClick={() =>
                        setEditingProject({
                          title: '',
                          slug: '',
                          description: '',
                          technologies: '',
                          status: 'Completed',
                          thumbnail_url: '',
                          doc_url: '',
                          github_url: 'https://github.com/raviprakashUCER',
                          demo_url: '',
                          problem: '',
                          solution: '',
                          lessons_learned: '',
                          features: [],
                          images: []
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Project
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {projectsList.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{p.title}</span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                              {p.status}
                            </span>
                            {p.images && p.images.length > 0 && (
                              <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded">
                                🖼️ {p.images.length} Screenshots
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 line-clamp-1">{p.description}</p>
                          <span className="text-[11px] font-mono text-cyan-300">Tech: {p.technologies}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingProject(p)}
                            className="p-2 text-cyan-400 hover:bg-slate-800 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete project?')) {
                                await api.adminDeleteProject(authToken, p.id);
                                showNotification('Project deleted');
                                loadAdminData();
                              }
                            }}
                            className="p-2 text-rose-400 hover:bg-slate-800 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: SKILLS */}
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Skills Matrix Management</h3>
                    <button
                      onClick={() =>
                        setEditingSkill({
                          name: '',
                          category: 'Cybersecurity',
                          level: 'Practical Experience',
                          description: '',
                          sort_order: 0,
                          is_public: 1
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Skill
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {skillsList.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{s.name}</span>
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">
                              {s.level}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{s.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingSkill(s)}
                            className="p-1.5 text-cyan-400 hover:bg-slate-800 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this skill?')) {
                                await api.adminDeleteSkill(authToken, s.id);
                                showNotification('Skill deleted');
                                loadAdminData();
                              }
                            }}
                            className="p-1.5 text-rose-400 hover:bg-slate-800 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: CERTIFICATIONS */}
              {activeTab === 'certs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Certifications & Credentials</h3>
                    <button
                      onClick={() =>
                        setEditingCert({
                          title: '',
                          organization: '',
                          issue_date: 'Completed',
                          credential_id: '',
                          credential_url: '',
                          certificate_file_url: '',
                          is_public: 1
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Certification
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {certsList.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-white">{c.title}</h4>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {c.organization} ({c.issue_date || 'Completed'})
                          </span>
                          {c.certificate_file_url && (
                            <p className="text-cyan-400 font-mono text-[10px]">
                              File: <a href={c.certificate_file_url} target="_blank" rel="noreferrer" className="underline">{c.certificate_file_url}</a>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingCert(c)}
                            className="p-1.5 text-cyan-400 hover:bg-slate-800 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete certificate?')) {
                                await api.adminDeleteCertification(authToken, c.id);
                                showNotification('Certificate deleted');
                                loadAdminData();
                              }
                            }}
                            className="p-1.5 text-rose-400 hover:bg-slate-800 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: SOCIAL CHANNELS */}
              {activeTab === 'socials' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Social Channel Visibility</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {socialsList.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white">{s.platform}</span>
                          <p className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                            {s.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const newVis = s.visible ? 0 : 1;
                              await api.adminSaveSocial(authToken, { ...s, visible: newVis }, s.id);
                              showNotification(`Updated ${s.platform} visibility`);
                              loadAdminData();
                            }}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                              s.visible ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {s.visible ? 'Visible' : 'Hidden'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: AI KNOWLEDGE */}
              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">AI Grounded Knowledge Base</h3>
                    <button
                      onClick={() =>
                        setEditingAI({
                          key: 'custom_fact',
                          category: 'About',
                          content: '',
                          is_public: 1
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Fact
                    </button>
                  </div>

                  <div className="space-y-3">
                    {aiList.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-cyan-400 font-bold">{item.key}</span>
                          <div className="flex items-center gap-2">
                            <span className="bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-mono text-[10px]">
                              {item.category}
                            </span>
                            <button
                              onClick={() => setEditingAI(item)}
                              className="p-1 text-cyan-400 hover:bg-slate-800 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Delete knowledge fact?')) {
                                  await api.adminDeleteAIKnowledge(authToken, item.id);
                                  showNotification('AI record deleted');
                                  loadAdminData();
                                }
                              }}
                              className="p-1 text-rose-400 hover:bg-slate-800 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: MESSAGES */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Contact Form Inquiries</h3>
                  <div className="space-y-3">
                    {messagesList.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 ${
                          msg.is_read
                            ? 'bg-slate-900/40 border-slate-800'
                            : 'bg-cyan-950/20 border-cyan-500/30 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{msg.name}</span>
                            <span className="text-slate-400 font-mono">({msg.email})</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                          </span>
                        </div>
                        <div className="font-semibold text-cyan-300 text-xs">{msg.subject}</div>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                          {!msg.is_read && (
                            <button
                              onClick={async () => {
                                await api.adminMarkMessageRead(authToken, msg.id);
                                loadAdminData();
                              }}
                              className="text-[11px] font-mono text-cyan-400 hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (confirm('Delete message?')) {
                                await api.adminDeleteMessage(authToken, msg.id);
                                loadAdminData();
                              }
                            }}
                            className="text-[11px] font-mono text-rose-400 hover:underline ml-auto"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {messagesList.length === 0 && (
                      <p className="text-xs text-slate-400 py-8 text-center">No messages received yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Note Editor */}
        {editingNote && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white text-base">
                  {editingNote.id ? 'Edit Note' : 'Create New Note'}
                </h4>
                <button onClick={() => setEditingNote(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Title</label>
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Cover Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingNote.cover_image_url || ''}
                        onChange={(e) => setEditingNote({ ...editingNote, cover_image_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                        placeholder="/media/public/cover.jpg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          openMediaSelector('Select Cover Image', (file) => {
                            setEditingNote({ ...editingNote, cover_image_url: file.public_url });
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-cyan-300 text-xs shrink-0"
                      >
                        Media
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">PDF Attachment URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingNote.attachment_url || ''}
                        onChange={(e) => setEditingNote({ ...editingNote, attachment_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                        placeholder="/media/public/notes.pdf"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          openMediaSelector('Select PDF Attachment', (file) => {
                            setEditingNote({
                              ...editingNote,
                              attachment_url: file.public_url,
                              attachment_name: file.original_name
                            });
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-cyan-300 text-xs shrink-0"
                      >
                        Media
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Category</label>
                    <input
                      type="text"
                      value={editingNote.category}
                      onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Reading Time</label>
                    <input
                      type="text"
                      value={editingNote.reading_time || '5 min read'}
                      onChange={(e) => setEditingNote({ ...editingNote, reading_time: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Description / Summary</label>
                  <input
                    type="text"
                    value={editingNote.description}
                    onChange={(e) => setEditingNote({ ...editingNote, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingNote.tags || ''}
                    onChange={(e) => setEditingNote({ ...editingNote, tags: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400 font-mono">Markdown Content</label>
                    <button
                      type="button"
                      onClick={() =>
                        openMediaSelector('Insert Image into Note', (file) => {
                          const markdownImg = `\n![${file.original_name}](${file.public_url})\n`;
                          setEditingNote({ ...editingNote, content_md: editingNote.content_md + markdownImg });
                        })
                      }
                      className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> + Insert Media Image
                    </button>
                  </div>
                  <textarea
                    rows={9}
                    value={editingNote.content_md}
                    onChange={(e) => setEditingNote({ ...editingNote, content_md: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!editingNote.is_published}
                      onChange={(e) => setEditingNote({ ...editingNote, is_published: e.target.checked ? 1 : 0 })}
                    />
                    <span>Published (Visible to public)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setEditingNote(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await api.adminSaveNote(authToken, editingNote, editingNote.id);
                    setEditingNote(null);
                    showNotification('Note saved successfully!');
                    loadAdminData();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Project Editor with Image Gallery */}
        {editingProject && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white text-base">
                  {editingProject.id ? 'Edit Project' : 'Create Project'}
                </h4>
                <button onClick={() => setEditingProject(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Title</label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Technologies</label>
                    <input
                      type="text"
                      value={editingProject.technologies}
                      onChange={(e) => setEditingProject({ ...editingProject, technologies: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Status</label>
                    <input
                      type="text"
                      value={editingProject.status || 'Completed'}
                      onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                {/* Screenshots Gallery Section */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-cyan-400" /> Project Screenshots & Diagrams
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        openMediaSelector('Add Project Screenshot', (file) => {
                          const currentImgs = editingProject.images || [];
                          setEditingProject({
                            ...editingProject,
                            images: [...currentImgs, { image_url: file.public_url, caption: file.original_name }]
                          });
                        })
                      }
                      className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px]"
                    >
                      + Add Image
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(editingProject.images || []).map((img, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 p-1.5 space-y-1">
                        <img src={img.image_url} alt="" className="h-20 w-full object-cover rounded" />
                        <input
                          type="text"
                          placeholder="Caption..."
                          value={img.caption || ''}
                          onChange={(e) => {
                            const updated = [...editingProject.images];
                            updated[idx].caption = e.target.value;
                            setEditingProject({ ...editingProject, images: updated });
                          }}
                          className="w-full px-1.5 py-0.5 rounded bg-black/40 border border-slate-800 text-[10px] text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProject.images.filter((_, i) => i !== idx);
                            setEditingProject({ ...editingProject, images: updated });
                          }}
                          className="absolute top-2 right-2 p-1 rounded bg-black/70 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Overview Description</label>
                  <textarea
                    rows={2}
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Challenge / Problem</label>
                    <textarea
                      rows={2}
                      value={editingProject.problem || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, problem: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Solution / Architecture</label>
                    <textarea
                      rows={2}
                      value={editingProject.solution || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Lessons Learned</label>
                  <input
                    type="text"
                    value={editingProject.lessons_learned || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, lessons_learned: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">GitHub URL</label>
                    <input
                      type="text"
                      value={editingProject.github_url || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Live Demo URL</label>
                    <input
                      type="text"
                      value={editingProject.demo_url || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, demo_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await api.adminSaveProject(authToken, editingProject, editingProject.id);
                    setEditingProject(null);
                    showNotification('Project saved!');
                    loadAdminData();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Skill Editor */}
        {editingSkill && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white text-base">
                  {editingSkill.id ? 'Edit Skill' : 'Create Skill'}
                </h4>
                <button onClick={() => setEditingSkill(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Skill Name</label>
                  <input
                    type="text"
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Category</label>
                  <select
                    value={editingSkill.category}
                    onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Security Concepts">Security Concepts</option>
                    <option value="AI">AI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Proficiency Level</label>
                  <select
                    value={editingSkill.level}
                    onChange={(e) => setEditingSkill({ ...editingSkill, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  >
                    <option value="Practical Experience">Practical Experience</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Learning">Learning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Description</label>
                  <input
                    type="text"
                    value={editingSkill.description || ''}
                    onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setEditingSkill(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await api.adminSaveSkill(authToken, editingSkill, editingSkill.id);
                    setEditingSkill(null);
                    showNotification('Skill saved!');
                    loadAdminData();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Save Skill
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Cert Editor */}
        {editingCert && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#090d16] border border-cyan-500/40 rounded-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white text-base">
                  {editingCert.id ? 'Edit Certification' : 'Create Certification'}
                </h4>
                <button onClick={() => setEditingCert(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Title</label>
                  <input
                    type="text"
                    value={editingCert.title}
                    onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Issuing Organization</label>
                  <input
                    type="text"
                    value={editingCert.organization}
                    onChange={(e) => setEditingCert({ ...editingCert, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Certificate File / PDF URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCert.certificate_file_url || ''}
                      onChange={(e) => setEditingCert({ ...editingCert, certificate_file_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                      placeholder="/media/public/cert.pdf"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openMediaSelector('Select Certificate File', (file) => {
                          setEditingCert({ ...editingCert, certificate_file_url: file.public_url });
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-cyan-300 text-xs shrink-0"
                    >
                      Media
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Verification URL</label>
                  <input
                    type="text"
                    value={editingCert.credential_url || ''}
                    onChange={(e) => setEditingCert({ ...editingCert, credential_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-[11px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setEditingCert(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await api.adminSaveCertification(authToken, editingCert, editingCert.id);
                    setEditingCert(null);
                    showNotification('Certification saved!');
                    loadAdminData();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Universal Media Selector Modal */}
        <MediaSelectorModal
          isOpen={mediaSelectorConfig.isOpen}
          title={mediaSelectorConfig.title}
          authToken={authToken}
          onClose={() => setMediaSelectorConfig({ isOpen: false, title: '', onSelect: null })}
          onSelect={(file) => {
            if (mediaSelectorConfig.onSelect) {
              mediaSelectorConfig.onSelect(file);
            }
          }}
        />
      </div>
    </div>
  );
}
