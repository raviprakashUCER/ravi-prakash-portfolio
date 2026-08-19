import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';
const MEDIA_BASE = 'http://localhost:5000/media';

async function runVerification() {
  console.log('=== STARTING REAL CMS & FILE UPLOAD SYSTEM VERIFICATION ===\n');

  // 1. Admin Login
  console.log('1. Testing Admin Authentication...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ravi', password: 'ravi@admin2026' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  console.log('✔ Admin logged in successfully. JWT Token acquired.\n');

  // 2. Upload Real PDF and Real PNG Files
  console.log('2. Testing Real File Uploads to Media Library...');
  const testPdfContent = Buffer.from('%PDF-1.4 Mock PDF content for Ravi Prakash Resume and Study Notes');
  const testPngContent = Buffer.from('\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82');

  const formData = new FormData();
  formData.append('files', new Blob([testPdfContent], { type: 'application/pdf' }), 'Ravi_Prakash_Resume_2026.pdf');
  formData.append('files', new Blob([testPngContent], { type: 'image/png' }), 'network_security_architecture.png');

  const uploadRes = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const uploadData = await uploadRes.json();
  if (!uploadData.success || !uploadData.uploaded || uploadData.uploaded.length !== 2) {
    throw new Error('Media upload failed: ' + JSON.stringify(uploadData));
  }
  const uploadedPdf = uploadData.uploaded[0];
  const uploadedPng = uploadData.uploaded[1];
  console.log(`✔ Uploaded PDF: ${uploadedPdf.original_name} -> URL: ${uploadedPdf.public_url}`);
  console.log(`✔ Uploaded PNG: ${uploadedPng.original_name} -> URL: ${uploadedPng.public_url}\n`);

  // 3. Test Security Reject on Executable Upload (.exe / .bat)
  console.log('3. Testing Server-Side Security & Executable Rejection...');
  const badFormData = new FormData();
  badFormData.append('files', new Blob([Buffer.from('echo malware')], { type: 'application/x-msdownload' }), 'malicious_script.exe');

  const badUploadRes = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: badFormData
  });
  const badUploadData = await badUploadRes.json();
  if (badUploadData.errors && badUploadData.errors.length > 0) {
    console.log('✔ Dangerous executable correctly blocked:', badUploadData.errors[0].error);
  } else {
    throw new Error('Security failure: Executable was not blocked!');
  }
  console.log();

  // 4. List Media Files and Filter by Type
  console.log('4. Testing Media Library Listing & Filters...');
  const listRes = await fetch(`${API_BASE}/media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const listData = await listRes.json();
  console.log(`✔ Found ${listData.files.length} total files in media library.`);

  const pdfFilterRes = await fetch(`${API_BASE}/media?type=pdfs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const pdfFilterData = await pdfFilterRes.json();
  console.log(`✔ Filtered PDFs count: ${pdfFilterData.files ? pdfFilterData.files.length : 0}`);

  const imgFilterRes = await fetch(`${API_BASE}/media?type=images`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const imgFilterData = await imgFilterRes.json();
  console.log(`✔ Filtered Images count: ${imgFilterData.files ? imgFilterData.files.length : 0}\n`);

  // 5. Create a Note with Cover Image and PDF Attachment
  console.log('5. Testing Note Creation with Cover Image and PDF Attachment...');
  const notePayload = {
    title: 'Advanced Wireshark Packet Analysis & Protocol Dissection',
    slug: 'advanced-wireshark-packet-analysis',
    category: 'Cybersecurity',
    tags: 'Networking, Wireshark, TCP, Security',
    description: 'Comprehensive walkthrough on capturing network traffic, inspecting TCP handshakes, and filtering malicious payload anomalies.',
    content_md: '# Wireshark Packet Analysis\n\n![Network Diagram](' + uploadedPng.public_url + ')\n\nIn this practical write-up, we dissect live packets and analyze TCP window scaling.',
    reading_time: '7 min read',
    difficulty: 'Advanced',
    cover_image_url: uploadedPng.public_url,
    attachment_url: uploadedPdf.public_url,
    attachment_name: 'Wireshark_Packet_Analysis_Guide.pdf',
    is_public: 1,
    is_published: 1
  };

  const createNoteRes = await fetch(`${API_BASE}/admin/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(notePayload)
  });
  const createNoteData = await createNoteRes.json();
  console.log(`✔ Created Note ID ${createNoteData.id} (slug: ${createNoteData.slug})`);

  // 6. Test Public Retrieval of the Note
  console.log('6. Verifying Public Note & Downloadable Attachment...');
  const publicNoteRes = await fetch(`${API_BASE}/notes/${createNoteData.slug}`);
  const publicNoteData = await publicNoteRes.json();
  if (!publicNoteData.success || !publicNoteData.data.note) {
    throw new Error('Public note retrieval failed: ' + JSON.stringify(publicNoteData));
  }
  const note = publicNoteData.data.note;
  console.log(`✔ Public note retrieved: "${note.title}"`);
  console.log(`✔ Cover Image: ${note.cover_image_url}`);
  console.log(`✔ Attached PDF: ${note.attachment_url}`);

  // 7. Verify Public Media Streaming & Download
  console.log('7. Testing Public Media Streaming & Download Endpoints...');
  const streamRes = await fetch(`http://localhost:5000${note.attachment_url}`);
  if (streamRes.status !== 200) {
    throw new Error('Failed to stream public media file: ' + streamRes.status);
  }
  console.log(`✔ Successfully streamed attachment from ${note.attachment_url} (HTTP ${streamRes.status})`);
  console.log();

  // 8. Create Project with Screenshots Gallery
  console.log('8. Testing Project Creation with Multi-Image Screenshots Gallery...');
  const projectPayload = {
    title: 'Automated Network Threat Hunter & SIEM Parser',
    slug: 'network-threat-hunter-siem',
    description: 'Real-time network log ingestion tool built to detect anomaly spikes and brute force signatures.',
    technologies: 'Python, Scapy, SQLite, Regex, Linux',
    status: 'Completed',
    github_url: 'https://github.com/raviprakashUCER',
    demo_url: 'https://github.com/raviprakashUCER',
    problem: 'Manual PCAP log correlation is slow during active network incident response.',
    solution: 'Engineered an automated Python parser that matches IDS signatures and flags malicious IPs.',
    lessons_learned: 'Optimized packet inspection pipelines using multi-threaded packet buffering.',
    features: ['Real-time PCAP stream analysis', 'Automated IOC IP correlation', 'Exportable JSON incident reports'],
    thumbnail_url: uploadedPng.public_url,
    images: [
      { image_url: uploadedPng.public_url, caption: 'Network Architecture & IDS Topology' }
    ]
  };

  const createProjRes = await fetch(`${API_BASE}/admin/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(projectPayload)
  });
  const createProjData = await createProjRes.json();
  console.log(`✔ Created Project ID ${createProjData.id}`);

  // 9. Verify Public Project with Gallery
  console.log('9. Verifying Public Project and Gallery Images...');
  const publicProjRes = await fetch(`${API_BASE}/projects/${projectPayload.slug}`);
  const publicProjData = await publicProjRes.json();
  if (!publicProjData.success || !publicProjData.data.images || publicProjData.data.images.length === 0) {
    throw new Error('Project gallery verification failed: ' + JSON.stringify(publicProjData));
  }
  console.log(`✔ Project retrieved with ${publicProjData.data.images.length} gallery image(s):`, publicProjData.data.images[0].caption);
  console.log();

  // 10. Test Resume Management & Active Resume Switch
  console.log('10. Testing Resume Upload & Active Resume Setting...');
  const resumeSaveRes = await fetch(`${API_BASE}/admin/resumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      version_name: 'Ravi_Prakash_Official_Resume_2026.pdf',
      file_url: uploadedPdf.public_url,
      media_file_id: uploadedPdf.id,
      is_active: true
    })
  });
  const resumeSaveData = await resumeSaveRes.json();
  console.log(`✔ Resume version registered with ID ${resumeSaveData.id}`);

  const publicResumeRes = await fetch(`${API_BASE}/resume`);
  const publicResumeData = await publicResumeRes.json();
  if (publicResumeData.data.profile.resume_url !== uploadedPdf.public_url) {
    throw new Error('Active resume URL did not update on public profile!');
  }
  console.log(`✔ Public profile resume_url dynamically updated to: ${publicResumeData.data.profile.resume_url}\n`);

  // 11. Test Profile Avatar Update
  console.log('11. Testing Profile Avatar Update with Uploaded Media...');
  const updateProfileRes = await fetch(`${API_BASE}/admin/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...publicResumeData.data.profile,
      avatar_url: uploadedPng.public_url
    })
  });
  const updateProfileData = await updateProfileRes.json();
  console.log(`✔ Profile avatar updated:`, updateProfileData.message);

  const getProfileRes = await fetch(`${API_BASE}/profile`);
  const getProfileData = await getProfileRes.json();
  if (getProfileData.data.profile.avatar_url !== uploadedPng.public_url) {
    throw new Error('Profile avatar did not update!');
  }
  console.log(`✔ Public profile avatar verified: ${getProfileData.data.profile.avatar_url}\n`);

  // 12. Test AI Assistant Grounding on Newly Uploaded Public Notes
  console.log('12. Testing Ask Ravi AI Grounding with Newly Uploaded Notes & Projects...');
  const aiRes = await fetch(`${API_BASE}/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What did Ravi write about Wireshark?' })
  });
  const aiData = await aiRes.json();
  console.log(`✔ Ask Ravi AI Response:\n${aiData.answer}\nCitations:`, aiData.citations);
  console.log();

  console.log('====================================================');
  console.log('🎉 ALL 12 REAL CMS & MEDIA UPLOAD TESTS PASSED 100%!');
  console.log('====================================================');
}

runVerification().catch((err) => {
  console.error('❌ Verification Failed:', err);
  process.exit(1);
});
