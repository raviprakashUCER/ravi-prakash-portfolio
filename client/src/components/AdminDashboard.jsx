import React, { useState } from 'react';
import { 
  X, LogOut, User, FileText, BookOpen, Briefcase, Award, 
  Upload, Trash2, Edit3, Plus, Check, AlertCircle, Loader2, 
  ExternalLink, Download, Image as ImageIcon, Eye, Globe
} from 'lucide-react';
import { 
  getMediaUrl, logoutAdmin, updateProfile, uploadFile, 
  uploadResume, deleteResume, createNote, updateNote, 
  deleteNote, createProject, updateProject, deleteProject, 
  createCertificate, updateCertificate, deleteCertificate 
} from '../services/api';

export default function AdminDashboard({ 
  isOpen, onClose, profile, resume, notes, projects, certificates, onRefreshAll 
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    profile_photo: profile?.profile_photo || '',
    github: profile?.social_links?.github || '',
    linkedin: profile?.social_links?.linkedin || '',
    twitter: profile?.social_links?.twitter || ''
  });

  // Project Modal State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '', description: '', technologies: '', github_url: '', demo_url: '', image_url: '', display_order: 0
  });

  // Note Modal State
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    title: '', slug: '', short_description: '', category: 'General', tags: '', content: '', cover_image: '', pdf_attachment: '', is_published: true
  });

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [certForm, setCertForm] = useState({
    title: '', organization: '', issue_date: '', file_url: '', credential_url: ''
  });

  const showNotification = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
  };

  const handleLogout = () => {
    logoutAdmin();
    onClose();
    onRefreshAll();
  };

  // ---------------- PROFILE HANDLERS ----------------
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: profileForm.name,
        headline: profileForm.headline,
        bio: profileForm.bio,
        location: profileForm.location,
        email: profileForm.email,
        phone: profileForm.phone,
        profile_photo: profileForm.profile_photo,
        social_links: {
          github: profileForm.github,
          linkedin: profileForm.linkedin,
          twitter: profileForm.twitter
        }
      });
      showNotification('Profile updated successfully!');
      onRefreshAll();
    } catch (err) {
      showNotification(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadFile(file);
      if (res.url) {
        setProfileForm(prev => ({ ...prev, profile_photo: res.url }));
        showNotification('Profile photo uploaded! Click "Save Profile" to commit changes.');
      }
    } catch (err) {
      showNotification(err.message || 'Photo upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESUME HANDLERS ----------------
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadResume(file);
      showNotification('Resume PDF uploaded and set as active!');
      onRefreshAll();
    } catch (err) {
      showNotification(err.message || 'Resume upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete the active resume?')) return;
    setLoading(true);
    try {
      await deleteResume();
      showNotification('Resume removed successfully');
      onRefreshAll();
    } catch (err) {
      showNotification(err.message || 'Failed to delete resume', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PROJECT HANDLERS ----------------
  const openProjectModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({
        title: proj.title || '',
        description: proj.description || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '',
        github_url: proj.github_url || '',
        demo_url: proj.demo_url || '',
        image_url: proj.image_url || '',
        display_order: proj.display_order || 0
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        title: '', description: '', technologies: '', github_url: '', demo_url: '', image_url: '', display_order: 0
      });
    }
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        technologies: projectForm.technologies.split(',').map(t => t.trim()).filter(Boolean),
        github_url: projectForm.github_url,
        demo_url: projectForm.demo_url,
        image_url: projectForm.image_url,
        display_order: parseInt(projectForm.display_order, 10) || 0
      };

      if (editingProject) {
        await updateProject(editingProject.id, payload);
        showNotification('Project updated!');
      } else {
        await createProject(payload);
        showNotification('Project created!');
      }
      setProjectModalOpen(false);
      onRefreshAll();
    } catch (err) {
      showNotification(err.message || 'Failed to save project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    setLoading(true);
    try {
      await deleteProject(id);
      showNotification('Project deleted');
      onRefreshAll();
    } catch (err) {
      showNotification(err.message || 'Failed to delete project', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- NOTE HANDLERS ----------------
  const openNoteModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({
        title: note.title || '',
        slug: note.slug || '',
        short_description: note.short_description || '',
        category: note.category || 'General',
        tags: Array.isArray(note.tags) ? note.tags.join(', ') : '',
        content: note.content || '',
        cover_image: note.cover_image || '',
        pdf_attachment: note.pdf_attachment || '',
        is_published: Boolean(note.is_published)
      });
    } else {
      setEditingNote(null);
      setNoteForm({
        title: '', slug: '', short_description: '', category: 'Engineering', tags: '', content: '', cover_image: '', pdf_attachment: '', is_published: true
      });
    }
    setNoteModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: noteForm.title,
        slug: noteForm.slug,
        short_description: noteForm.short_description,
        category: noteForm.category,
        tags: noteForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        content: noteForm.content,
        cover_image: noteForm.cover_image,
        pdf_attachment: noteForm.pdf_attachment,
        is_published: noteForm.is_published ? 1 : 0
      };

      if (editingNote) {
        await updateNote(editingNote.id, payload);
        showNotification('Note updated!');
      } else {
        await createNote(payload);
        showNotification('Note created!');
      }
      setNoteModalOpen(false);
      onRefreshAll();
    } catch (err) {
      showNotification(err.message || 'Failed to save note', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    setLoading(true);
    try {
      await deleteNote(id);
      showNotification('Note deleted');
      onRefreshAll();
    } catch (err) {
      showNotification(err.message || 'Failed to delete note', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CERTIFICATE HANDLERS ----------------
  const openCertModal = (cert = null) => {
    if (cert) {
      setEditingCert(cert);
      setCertForm({
        title: cert.title || '',
        organization: cert.organization || '',
        issue_date: cert.issue_date || '',
        file_url: cert.file_url || '',
        credential_url: cert.credential_url || ''
      });
    } else {
      setEditingCert(null);
      setCertForm({
        title: '', organization: '', issue_date: '', file_url: '', credential_url: ''
      });
    }
    setCertModalOpen(true);
  };

  const handleSaveCert = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCert) {
        await updateCertificate(editingCert.id, certForm);
        showNotification('Certificate updated!');
      } else {
        await createCertificate(certForm);
        showNotification('Certificate created!');
      }
      setCertModalOpen(false);
      onRefreshAll();
    } catch (err) {
      showNotification(err.message || 'Failed to save certificate', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    setLoading(true);
    try {
      await deleteCertificate(id);
      showNotification('Certificate deleted');
      onRefreshAll();
    } catch (err) {
      showNotification(err.message || 'Failed to delete certificate', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GENERIC FILE UPLOAD HELPERS ----------------
  const handleGenericUpload = async (e, targetField, formSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadFile(file);
      if (res.url) {
        formSetter(prev => ({ ...prev, [targetField]: res.url }));
        showNotification(`File uploaded: ${res.filename}`);
      }
    } catch (err) {
      showNotification(err.message || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1120] border border-cyan-500/30 rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Bar */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
              RP
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Portfolio Admin Center</h2>
              <p className="text-xs text-slate-400">Direct Render Persistent Storage & SQLite Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'error' ? 'bg-rose-950/80 text-rose-300 border-b border-rose-800' : 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
          }`}>
            {feedback.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'resume', label: 'Resume PDF', icon: FileText },
            { id: 'projects', label: 'Projects', icon: Briefcase },
            { id: 'notes', label: 'Notes Hub', icon: BookOpen },
            { id: 'certificates', label: 'Certificates', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* ================= TAB 1: PROFILE ================= */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/40 bg-slate-950 flex items-center justify-center shrink-0">
                  {profileForm.profile_photo ? (
                    <img
                      src={getMediaUrl(profileForm.profile_photo)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-500" />
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="text-sm font-bold text-white">Profile Photo</div>
                  <p className="text-xs text-slate-400">Uploads directly to persistent Render disk and updates canonical URL.</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose & Upload Photo</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleProfilePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Headline</label>
                  <input
                    type="text"
                    value={profileForm.headline}
                    onChange={e => setProfileForm({ ...profileForm, headline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Bio / Overview</label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={profileForm.github}
                    onChange={e => setProfileForm({ ...profileForm, github: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profileForm.linkedin}
                    onChange={e => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Twitter / X URL</label>
                  <input
                    type="url"
                    value={profileForm.twitter}
                    onChange={e => setProfileForm({ ...profileForm, twitter: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>
            </form>
          )}

          {/* ================= TAB 2: RESUME ================= */}
          {activeTab === 'resume' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Current Active Resume</span>
                </h3>

                {resume ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">{resume.original_name}</span>
                      <span className="text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="text-xs font-mono text-cyan-300 break-all">
                      Canonical Path: {resume.url}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                      <a
                        href={getMediaUrl(resume.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </a>
                      <a
                        href={`${getMediaUrl(resume.url)}?download=true`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                      <button
                        onClick={handleDeleteResume}
                        className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No active resume uploaded.</p>
                )}

                <div className="pt-4 border-t border-slate-800">
                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{resume ? 'Upload New / Replace Resume PDF' : 'Upload Resume PDF'}</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Accepts .pdf only. Automatically replaces the existing file on Render disk.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: PROJECTS ================= */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Manage Projects</h3>
                  <p className="text-xs text-slate-400">Create, edit, and reorder showcase items</p>
                </div>
                <button
                  onClick={() => openProjectModal()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(proj => (
                  <div key={proj.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-sm text-white">{proj.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-2 mt-1">{proj.description}</div>
                      {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proj.technologies.map((t, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openProjectModal(proj)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: NOTES ================= */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Technical Notes & Articles</h3>
                  <p className="text-xs text-slate-400">Write markdown notes, attach study PDFs, and manage publications</p>
                </div>
                <button
                  onClick={() => openNoteModal()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Note</span>
                </button>
              </div>

              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{note.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                          {note.category}
                        </span>
                        {note.pdf_attachment && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            PDF
                          </span>
                        )}
                        {!note.is_published && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{note.short_description || note.content}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openNoteModal(note)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                        title="Edit Note"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300"
                        title="Delete Note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: CERTIFICATES ================= */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Certifications</h3>
                  <p className="text-xs text-slate-400">Manage verified accreditations and credentials</p>
                </div>
                <button
                  onClick={() => openCertModal()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Certificate</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certificates.map(cert => (
                  <div key={cert.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-sm text-white">{cert.title}</div>
                      <div className="text-xs text-cyan-400 mt-0.5">{cert.organization}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{cert.issue_date}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openCertModal(cert)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                        title="Edit Certificate"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCert(cert.id)}
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300"
                        title="Delete Certificate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ================= PROJECT EDIT MODAL ================= */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSaveProject} className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">{editingProject ? 'Edit Project' : 'New Project'}</h4>
              <button type="button" onClick={() => setProjectModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Title</label>
              <input
                type="text"
                required
                value={projectForm.title}
                onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={projectForm.description}
                onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Technologies (comma-separated)</label>
              <input
                type="text"
                placeholder="React, Express, SQLite, Docker"
                value={projectForm.technologies}
                onChange={e => setProjectForm({ ...projectForm, technologies: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={projectForm.github_url}
                  onChange={e => setProjectForm({ ...projectForm, github_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Live Demo URL</label>
                <input
                  type="url"
                  value={projectForm.demo_url}
                  onChange={e => setProjectForm({ ...projectForm, demo_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Project Image</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="/api/media/filename.png"
                  value={projectForm.image_url}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono"
                />
                <label className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl cursor-pointer">
                  Upload Image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={e => handleGenericUpload(e, 'image_url', setProjectForm)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setProjectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= NOTE EDIT MODAL ================= */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSaveNote} className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">{editingNote ? 'Edit Note' : 'Create Note'}</h4>
              <button type="button" onClick={() => setNoteModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={noteForm.title}
                  onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category</label>
                <input
                  type="text"
                  value={noteForm.category}
                  onChange={e => setNoteForm({ ...noteForm, category: e.target.value })}
                  placeholder="Security, Backend, Cloud..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Short Description</label>
              <input
                type="text"
                value={noteForm.short_description}
                onChange={e => setNoteForm({ ...noteForm, short_description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="architecture, express, security"
                value={noteForm.tags}
                onChange={e => setNoteForm({ ...noteForm, tags: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Markdown Content</label>
              <textarea
                rows={7}
                value={noteForm.content}
                onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                placeholder="# Introduction&#10;&#10;Write note content in markdown..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono"
              />
            </div>

            {/* Optional Cover Image */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cover Image (Optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="/api/media/cover.png"
                  value={noteForm.cover_image}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono"
                />
                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer">
                  Upload Cover
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={e => handleGenericUpload(e, 'cover_image', setNoteForm)}
                    className="hidden"
                  />
                </label>
                {noteForm.cover_image && (
                  <button
                    type="button"
                    onClick={() => setNoteForm(prev => ({ ...prev, cover_image: '' }))}
                    className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-lg"
                    title="Remove Cover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Optional PDF Attachment */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">PDF Attachment (Optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="/api/media/guide.pdf"
                  value={noteForm.pdf_attachment}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono"
                />
                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer">
                  Upload PDF
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => handleGenericUpload(e, 'pdf_attachment', setNoteForm)}
                    className="hidden"
                  />
                </label>
                {noteForm.pdf_attachment && (
                  <button
                    type="button"
                    onClick={() => setNoteForm(prev => ({ ...prev, pdf_attachment: '' }))}
                    className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-lg"
                    title="Remove PDF"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="is_published"
                checked={noteForm.is_published}
                onChange={e => setNoteForm({ ...noteForm, is_published: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-600"
              />
              <label htmlFor="is_published" className="text-xs text-slate-300">
                Publish publicly on website
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= CERTIFICATE EDIT MODAL ================= */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSaveCert} className="bg-[#0f172a] border border-cyan-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">{editingCert ? 'Edit Certificate' : 'Add Certificate'}</h4>
              <button type="button" onClick={() => setCertModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Certificate Title</label>
              <input
                type="text"
                required
                value={certForm.title}
                onChange={e => setCertForm({ ...certForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Issuing Organization</label>
              <input
                type="text"
                value={certForm.organization}
                onChange={e => setCertForm({ ...certForm, organization: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Issue Date</label>
              <input
                type="text"
                placeholder="Jan 2025"
                value={certForm.issue_date}
                onChange={e => setCertForm({ ...certForm, issue_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Certificate Image / PDF</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="/api/media/cert.pdf"
                  value={certForm.file_url}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono"
                />
                <label className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl cursor-pointer">
                  Upload
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={e => handleGenericUpload(e, 'file_url', setCertForm)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Credential URL</label>
              <input
                type="url"
                value={certForm.credential_url}
                onChange={e => setCertForm({ ...certForm, credential_url: e.target.value })}
                placeholder="https://verify.example.com/..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setCertModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl"
              >
                Save Certificate
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
