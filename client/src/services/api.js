const API_BASE = '/api';

export const api = {
  // Public
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/profile`);
    return res.json();
  },
  getSkills: async () => {
    const res = await fetch(`${API_BASE}/skills`);
    return res.json();
  },
  getNotes: async (search = '', category = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE}/notes?${params.toString()}`);
    return res.json();
  },
  getNoteBySlug: async (slug) => {
    const res = await fetch(`${API_BASE}/notes/${slug}`);
    return res.json();
  },
  getProjects: async () => {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },
  getProjectBySlug: async (slug) => {
    const res = await fetch(`${API_BASE}/projects/${slug}`);
    return res.json();
  },
  getCertifications: async () => {
    const res = await fetch(`${API_BASE}/certifications`);
    return res.json();
  },
  getResume: async () => {
    const res = await fetch(`${API_BASE}/resume`);
    return res.json();
  },
  sendContactMessage: async (payload) => {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // AI Assistant
  askAI: async (query, history = []) => {
    const res = await fetch(`${API_BASE}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history }),
    });
    return res.json();
  },
  getAISuggestions: async () => {
    const res = await fetch(`${API_BASE}/ai/suggestions`);
    return res.json();
  },

  // Admin Auth & Helpers
  getSetupStatus: async () => {
    const res = await fetch(`${API_BASE}/auth/setup-status`);
    return res.json();
  },
  setupFirstAdmin: async (data) => {
    const res = await fetch(`${API_BASE}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  devResetPassword: async (data) => {
    const res = await fetch(`${API_BASE}/auth/dev-reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },
  verifyToken: async (token) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
  changePassword: async (token, currentPassword, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return res.json();
  },

  // Admin Media Library
  uploadMedia: async (token, formData) => {
    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    });
    return res.json();
  },
  getMediaFiles: async (token, search = '', type = 'all') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type && type !== 'all') params.append('type', type);
    const res = await fetch(`${API_BASE}/media?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  updateMediaFile: async (token, id, data) => {
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  replaceMediaFile: async (token, id, formData) => {
    const res = await fetch(`${API_BASE}/media/${id}/replace`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },
  deleteMediaFile: async (token, id) => {
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin Resumes
  adminGetResumes: async (token) => {
    const res = await fetch(`${API_BASE}/admin/resumes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminSaveResume: async (token, data) => {
    const res = await fetch(`${API_BASE}/admin/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  adminSetActiveResume: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/resumes/${id}/active`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminDeleteResume: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/resumes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin Stats & Profile
  adminGetStats: async (token) => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminGetProfile: async (token) => {
    const res = await fetch(`${API_BASE}/admin/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminUpdateProfile: async (token, data) => {
    const res = await fetch(`${API_BASE}/admin/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Admin Notes
  adminGetNotes: async (token) => {
    const res = await fetch(`${API_BASE}/admin/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminSaveNote: async (token, note, id = null) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/admin/notes/${id}` : `${API_BASE}/admin/notes`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(note),
    });
    return res.json();
  },
  adminDeleteNote: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin Projects
  adminGetProjects: async (token) => {
    const res = await fetch(`${API_BASE}/admin/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminSaveProject: async (token, project, id = null) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/admin/projects/${id}` : `${API_BASE}/admin/projects`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(project),
    });
    return res.json();
  },
  adminDeleteProject: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin Skills
  adminGetSkills: async (token) => {
    const res = await fetch(`${API_BASE}/admin/skills`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminSaveSkill: async (token, skill, id = null) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/admin/skills/${id}` : `${API_BASE}/admin/skills`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(skill),
    });
    return res.json();
  },
  adminDeleteSkill: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/skills/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin Certifications
  adminGetCertifications: async (token) => {
    const res = await fetch(`${API_BASE}/admin/certifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminSaveCertification: async (token, cert, id = null) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/admin/certifications/${id}` : `${API_BASE}/admin/certifications`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(cert),
    });
    return res.json();
  },
  adminDeleteCertification: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/certifications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin Socials
  adminGetSocials: async (token) => {
    const res = await fetch(`${API_BASE}/admin/socials`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminSaveSocial: async (token, social, id = null) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/admin/socials/${id}` : `${API_BASE}/admin/socials`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(social),
    });
    return res.json();
  },
  adminDeleteSocial: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/socials/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin AI Knowledge Base
  adminGetAIKnowledge: async (token) => {
    const res = await fetch(`${API_BASE}/admin/ai-knowledge`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminSaveAIKnowledge: async (token, item, id = null) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/admin/ai-knowledge/${id}` : `${API_BASE}/admin/ai-knowledge`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(item),
    });
    return res.json();
  },
  adminDeleteAIKnowledge: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/ai-knowledge/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin Messages
  adminGetMessages: async (token) => {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminMarkMessageRead: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/messages/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  adminDeleteMessage: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/messages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
};
