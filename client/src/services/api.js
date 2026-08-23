// Canonical API client for Ravi Prakash Portfolio

// Read API URL from Vite environment variable, fallback to localhost in dev
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, ''); // Remove trailing slashes

// Media URL resolver - guarantees 100% valid canonical public URL
export function getMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/api/media/${pathOrUrl}`;
  return `${API_BASE_URL}${cleanPath}`;
}

// Token storage helpers
export function getAuthToken() {
  return localStorage.getItem('portfolio_admin_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('portfolio_admin_token', token);
  } else {
    localStorage.removeItem('portfolio_admin_token');
  }
}

// Universal fetch wrapper
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = { ...options.headers };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const errorMsg = (typeof data === 'object' && data?.error) ? data.error : `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

// ----------------- Public & Admin API Methods -----------------

// Auth
export async function loginAdmin(username, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function verifyAdmin() {
  return request('/api/auth/me', { method: 'GET' });
}

export function logoutAdmin() {
  setAuthToken(null);
}

// Profile
export async function getProfile() {
  return request('/api/profile', { method: 'GET' });
}

export async function updateProfile(profileData) {
  return request('/api/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
}

// Resume
export async function getResume() {
  return request('/api/resume', { method: 'GET' });
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('/api/admin/resume', {
    method: 'POST',
    body: formData
  });
}

export async function deleteResume() {
  return request('/api/admin/resume', {
    method: 'DELETE'
  });
}

// File Upload (Images & PDFs)
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('/api/admin/upload', {
    method: 'POST',
    body: formData
  });
}

// Notes
export async function getNotes(includeAll = false) {
  const query = includeAll ? '?all=true' : '';
  return request(`/api/notes${query}`, { method: 'GET' });
}

export async function getNoteBySlug(slug) {
  return request(`/api/notes/${slug}`, { method: 'GET' });
}

export async function createNote(noteData) {
  return request('/api/admin/notes', {
    method: 'POST',
    body: JSON.stringify(noteData)
  });
}

export async function updateNote(id, noteData) {
  return request(`/api/admin/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(noteData)
  });
}

export async function deleteNote(id) {
  return request(`/api/admin/notes/${id}`, {
    method: 'DELETE'
  });
}

// Projects
export async function getProjects() {
  return request('/api/projects', { method: 'GET' });
}

export async function createProject(projectData) {
  return request('/api/admin/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
}

export async function updateProject(id, projectData) {
  return request(`/api/admin/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData)
  });
}

export async function deleteProject(id) {
  return request(`/api/admin/projects/${id}`, {
    method: 'DELETE'
  });
}

// Certificates
export async function getCertificates() {
  return request('/api/certificates', { method: 'GET' });
}

export async function createCertificate(certData) {
  return request('/api/admin/certificates', {
    method: 'POST',
    body: JSON.stringify(certData)
  });
}

export async function updateCertificate(id, certData) {
  return request(`/api/admin/certificates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(certData)
  });
}

export async function deleteCertificate(id) {
  return request(`/api/admin/certificates/${id}`, {
    method: 'DELETE'
  });
}
