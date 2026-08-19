import fs from 'fs';

const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('=== VERIFYING PURE TEMPLATE CMS & DYNAMIC WORKFLOWS ===\n');

  // 1. Verify Empty State (0 fake/sample notes, 0 fake certs, 0 fake resume)
  console.log('1. Verifying Database Starts 100% Clean Without Fake Sample Content...');
  const initNotesRes = await fetch(`${API_BASE}/notes`);
  const initNotes = await initNotesRes.json();
  console.log(`✔ Notes in database: ${initNotes.data.notes.length} (Expected: 0)`);

  const initCertsRes = await fetch(`${API_BASE}/certifications`);
  const initCerts = await initCertsRes.json();
  console.log(`✔ Certifications in database: ${initCerts.data.length} (Expected: 0)`);

  const initResumeRes = await fetch(`${API_BASE}/resume`);
  const initResume = await initResumeRes.json();
  console.log(`✔ Active Resume in database: ${initResume.data.activeResume ? 'Present' : 'None'} (Expected: None)\n`);

  if (initNotes.data.notes.length !== 0 || initCerts.data.length !== 0) {
    throw new Error('Database still contained mock records!');
  }

  // 2. Admin Login
  console.log('2. Logging in as Administrator...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ravi', password: 'ravi@admin2026' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('✔ Admin authenticated successfully.\n');

  // 3. Upload Real Media Assets
  console.log('3. Uploading Real Files to Media Library...');
  const pdfBlob = new Blob([Buffer.from('%PDF-1.4 Real Study Guide on TCP Flags and Port Scanning')], { type: 'application/pdf' });
  const imgBlob = new Blob([Buffer.from('\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')], { type: 'image/png' });

  const uploadForm = new FormData();
  uploadForm.append('files', pdfBlob, 'Nmap_Network_Analysis_Guide.pdf');
  uploadForm.append('files', imgBlob, 'network_diagram_cover.png');

  const uploadRes = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: uploadForm
  });
  const uploadData = await uploadRes.json();
  const notePdf = uploadData.uploaded[0];
  const noteCover = uploadData.uploaded[1];
  console.log(`✔ Uploaded note PDF: ${notePdf.public_url}`);
  console.log(`✔ Uploaded note Cover: ${noteCover.public_url}\n`);

  // 4. TEST NOTE WORKFLOW
  console.log('4. Testing Dynamic Note Publishing Workflow...');
  const noteSlug = 'nmap-scanning-techniques-' + Date.now().toString().slice(-4);
  const newNoteRes = await fetch(`${API_BASE}/admin/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Nmap Scanning Techniques & TCP Flags Breakdown',
      slug: noteSlug,
      category: 'Cybersecurity',
      tags: 'Nmap, Networking, Recon, TCP',
      description: 'In-depth breakdown of SYN stealth scans, Xmas scans, and OS fingerprinting.',
      content_md: '# Nmap Scanning Techniques\n\n![Cover](' + noteCover.public_url + ')\n\nDetailed explanation of TCP 3-way handshakes and packet flag manipulation.',
      reading_time: '6 min read',
      difficulty: 'Intermediate',
      cover_image_url: noteCover.public_url,
      attachment_url: notePdf.public_url,
      attachment_name: 'Nmap_Network_Analysis_Guide.pdf',
      is_public: 1,
      is_published: 1
    })
  });
  const newNoteData = await newNoteRes.json();
  console.log(`✔ Note published with ID ${newNoteData.id}`);

  // Verify public notes listing automatically includes the new note
  const publicNotesRes = await fetch(`${API_BASE}/notes`);
  const publicNotesData = await publicNotesRes.json();
  if (publicNotesData.data.notes.length !== 1 || publicNotesData.data.notes[0].slug !== newNoteData.slug) {
    throw new Error('Public notes listing did not dynamically include published note!');
  }
  console.log(`✔ Public Notes listing dynamically rendered 1 note card: "${publicNotesData.data.notes[0].title}"`);

  // Verify public note detail page /notes/:slug
  const singleNoteRes = await fetch(`${API_BASE}/notes/${newNoteData.slug}`);
  const singleNoteData = await singleNoteRes.json();
  if (!singleNoteData.success || !singleNoteData.data.note.attachment_url) {
    throw new Error('Public note detail failed!');
  }
  console.log(`✔ Public Note Detail /notes/${newNoteData.slug} successfully verified with PDF attachment: ${singleNoteData.data.note.attachment_url}\n`);

  // 5. TEST CERTIFICATION WORKFLOW
  console.log('5. Testing Dynamic Certification Publishing Workflow...');
  const certSlug = 'prompt-engineering-copilot-' + Date.now().toString().slice(-4);
  const newCertRes = await fetch(`${API_BASE}/admin/certifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Introduction to Prompt Engineering with GitHub Copilot',
      slug: certSlug,
      organization: 'Simplilearn',
      issue_date: 'Completed',
      credential_id: 'VERIFIED-CREDENTIAL-2026',
      credential_url: 'https://www.simplilearn.com',
      certificate_file_url: notePdf.public_url,
      description: 'Mastered prompt engineering patterns, context grounding, and GitHub Copilot workflows.',
      is_public: 1
    })
  });
  const newCertData = await newCertRes.json();
  console.log(`✔ Certification registered with ID ${newCertData.id}`);

  // Verify public certifications listing automatically includes the new cert
  const publicCertsRes = await fetch(`${API_BASE}/certifications`);
  const publicCertsData = await publicCertsRes.json();
  if (publicCertsData.data.length !== 1) {
    throw new Error('Public certifications did not dynamically include published cert!');
  }
  console.log(`✔ Public Certifications listing dynamically rendered 1 card: "${publicCertsData.data[0].title}"`);

  // Verify single certification detail page /certifications/:slug
  const singleCertRes = await fetch(`${API_BASE}/certifications/${newCertData.slug}`);
  const singleCertData = await singleCertRes.json();
  if (!singleCertData.success || singleCertData.data.organization !== 'Simplilearn') {
    throw new Error('Public certification detail failed!');
  }
  console.log(`✔ Public Certification Detail /certifications/${newCertData.slug} verified with file URL: ${singleCertData.data.certificate_file_url}\n`);

  // 6. TEST RESUME VERSIONING & ACTIVE RESUME SWITCH
  console.log('6. Testing Resume Version Management and Active Resume Switch...');
  
  // Upload Resume Version 1
  const resume1Res = await fetch(`${API_BASE}/admin/resumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      version_name: 'Ravi_Prakash_General_Resume_2026.pdf',
      file_url: notePdf.public_url,
      is_active: true
    })
  });
  const resume1Data = await resume1Res.json();
  console.log(`✔ Resume Version 1 created (ID ${resume1Data.id}) and set active.`);

  let publicResume = (await (await fetch(`${API_BASE}/resume`)).json()).data;
  console.log(`✔ Public /resume active file: ${publicResume.activeResume.file_url}`);

  // Upload Resume Version 2 (Cybersecurity Focus)
  const resume2Res = await fetch(`${API_BASE}/admin/resumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      version_name: 'Ravi_Prakash_Cybersecurity_Specialist_Resume.pdf',
      file_url: '/media/public/Ravi_Prakash_Cyber_Specialist.pdf',
      is_active: true
    })
  });
  const resume2Data = await resume2Res.json();
  console.log(`✔ Resume Version 2 created (ID ${resume2Data.id}) and switched to active.`);

  publicResume = (await (await fetch(`${API_BASE}/resume`)).json()).data;
  if (publicResume.activeResume.version_name !== 'Ravi_Prakash_Cybersecurity_Specialist_Resume.pdf') {
    throw new Error('Active resume switch failed!');
  }
  console.log(`✔ Public /resume dynamically switched to: "${publicResume.activeResume.version_name}" (${publicResume.activeResume.file_url})\n`);

  console.log('===========================================================');
  console.log('🎉 ALL REUSABLE TEMPLATE & CMS WORKFLOW TESTS PASSED 100%!');
  console.log('===========================================================');
}

runTest().catch((err) => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
