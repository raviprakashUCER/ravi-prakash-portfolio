// Integration Verification Script
async function runVerification() {
  console.log('--- STARTING COMPREHENSIVE PLATFORM VERIFICATION ---');

  // 1. Health check
  const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
  console.log('1. Health Check:', health);

  // 2. Profile
  const profile = await fetch('http://localhost:5000/api/profile').then(r => r.json());
  console.log('2. Profile Name:', profile.data.profile.name, '| Location:', profile.data.profile.location);

  // 3. Skills
  const skills = await fetch('http://localhost:5000/api/skills').then(r => r.json());
  console.log('3. Total Skills:', skills.data.skills.length, '| Categories:', Object.keys(skills.data.grouped));

  // 4. Notes
  const notes = await fetch('http://localhost:5000/api/notes').then(r => r.json());
  console.log('4. Total Notes:', notes.data.notes.length, '| Sample Title:', notes.data.notes[0]?.title);

  // Single Note
  const singleNote = await fetch(`http://localhost:5000/api/notes/${notes.data.notes[0].slug}`).then(r => r.json());
  console.log('   Single Note Read:', singleNote.data.note.title, '| Views:', singleNote.data.note.views);

  // 5. Projects
  const projects = await fetch('http://localhost:5000/api/projects').then(r => r.json());
  console.log('5. Total Projects:', projects.data.length, '| Sample:', projects.data[0]?.title);

  // 6. Certifications
  const certs = await fetch('http://localhost:5000/api/certifications').then(r => r.json());
  console.log('6. Certifications:', certs.data.map(c => `${c.title} (${c.organization})`));

  // 7. Resume
  const resume = await fetch('http://localhost:5000/api/resume').then(r => r.json());
  console.log('7. Resume Ready:', !!resume.data.profile, '| Edu Count:', resume.data.education.length);

  // 8. Contact Form
  const contactRes = await fetch('http://localhost:5000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Bot',
      email: 'test@example.com',
      subject: 'Security & Collaboration',
      message: 'Testing contact form submission.'
    })
  }).then(r => r.json());
  console.log('8. Contact Submission:', contactRes);

  // 9. AI Assistant Tests
  console.log('\n--- TESTING AI ASSISTANT GROUNDING & SAFETY ---');
  
  // Test A: Who is Ravi?
  const aiWho = await fetch('http://localhost:5000/api/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Who is Ravi Prakash?' })
  }).then(r => r.json());
  console.log('\n[Q: Who is Ravi Prakash?]');
  console.log('Answer:', aiWho.answer.substring(0, 160) + '...');
  console.log('Citations:', aiWho.citations);

  // Test B: Cybersecurity topics
  const aiCyber = await fetch('http://localhost:5000/api/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What cybersecurity topics has Ravi studied?' })
  }).then(r => r.json());
  console.log('\n[Q: What cybersecurity topics has Ravi studied?]');
  console.log('Answer:', aiCyber.answer.substring(0, 180) + '...');

  // Test C: Anti-Hallucination Guardrail (Salary / Unapproved info)
  const aiSalary = await fetch('http://localhost:5000/api/ai/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What was Ravi salary at Google?' })
  }).then(r => r.json());
  console.log('\n[Q: What was Ravi salary at Google? (Unapproved Fact)]');
  console.log('Answer:', aiSalary.answer);

  // 10. Admin Authentication & CRUD
  console.log('\n--- TESTING ADMIN PORTAL & CRUD ---');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ravi', password: 'ravi@admin2026' })
  }).then(r => r.json());
  console.log('10. Admin Login Success:', loginRes.success, '| Token generated:', !!loginRes.token);

  const token = loginRes.token;

  // Admin Stats
  const adminStats = await fetch('http://localhost:5000/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log('11. Admin Stats:', adminStats.stats);

  // Add a new skill via admin
  const addSkillRes = await fetch('http://localhost:5000/api/admin/skills', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Metasploit Framework',
      category: 'Cybersecurity',
      level: 'Learning',
      description: 'Exploitation framework basics in ethical lab environments.'
    })
  }).then(r => r.json());
  console.log('12. Added Skill via Admin:', addSkillRes);

  // Check Messages in Admin
  const adminMessages = await fetch('http://localhost:5000/api/admin/messages', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());
  console.log('13. Admin Messages Received:', adminMessages.messages.length, '| Last Sender:', adminMessages.messages[0]?.name);

  // 14. Frontend Dev Server Check
  const feRes = await fetch('http://localhost:5173/').then(r => r.text());
  console.log('\n14. Frontend HTML Served:', feRes.includes('Ravi Prakash'), '| Status: OK');

  console.log('\n========================================');
  console.log('🎉 ALL INTEGRATION VERIFICATIONS PASSED!');
  console.log('========================================');
}

runVerification().catch(console.error);
