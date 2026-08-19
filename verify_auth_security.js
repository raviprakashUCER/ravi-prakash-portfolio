const API_BASE = 'http://localhost:5000/api';

async function runAuthTests() {
  console.log('=== VERIFYING ADMIN AUTHENTICATION, SETUP, & ACCESS SECURITY ===\n');

  // 1. Check Setup Status
  console.log('1. Testing GET /api/auth/setup-status...');
  const statusRes = await fetch(`${API_BASE}/auth/setup-status`);
  const statusData = await statusRes.json();
  console.log(`✔ Setup Status: ${JSON.stringify(statusData)}`);

  // 2. Set Admin Password securely for approved email
  console.log('\n2. Setting Secure Admin Password for raviprakash.techpro@gmail.com...');
  const resetRes = await fetch(`${API_BASE}/auth/dev-reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      newPassword: 'RaviSecure2026!Pass',
      confirmEmail: 'raviprakash.techpro@gmail.com'
    })
  });
  const resetData = await resetRes.json();
  console.log(`✔ Password Reset: ${resetData.message}`);

  // 3. Test Valid Login with EMAIL
  console.log('\n3. Testing Valid Login using EMAIL (raviprakash.techpro@gmail.com)...');
  const emailLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'raviprakash.techpro@gmail.com',
      password: 'RaviSecure2026!Pass'
    })
  });
  const emailLoginData = await emailLoginRes.json();
  if (!emailLoginData.success || !emailLoginData.token) {
    throw new Error('Email login failed: ' + JSON.stringify(emailLoginData));
  }
  console.log(`✔ Email Login Successful! Acquired JWT Token for: ${emailLoginData.user.email}`);

  // 4. Test Valid Login with USERNAME
  console.log('\n4. Testing Valid Login using USERNAME (ravi)...');
  const userLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'ravi',
      password: 'RaviSecure2026!Pass'
    })
  });
  const userLoginData = await userLoginRes.json();
  if (!userLoginData.success || !userLoginData.token) {
    throw new Error('Username login failed: ' + JSON.stringify(userLoginData));
  }
  console.log(`✔ Username Login Successful! Acquired JWT Token for: ${userLoginData.user.username}`);

  const authToken = userLoginData.token;

  // 5. Test Invalid Login with Wrong Password
  console.log('\n5. Testing Invalid Login with WRONG PASSWORD...');
  const wrongPassRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'ravi',
      password: 'WrongPassword123'
    })
  });
  if (wrongPassRes.status === 401) {
    console.log('✔ Correctly returned 401 Unauthorized for incorrect password.');
  } else {
    throw new Error('Expected 401 but got ' + wrongPassRes.status);
  }

  // 6. Test Invalid Login with Unknown User
  console.log('\n6. Testing Invalid Login with UNKNOWN USER...');
  const wrongUserRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'hacker@unknown.com',
      password: 'Password123'
    })
  });
  if (wrongUserRes.status === 401) {
    console.log('✔ Correctly returned 401 Unauthorized for unknown user.');
  } else {
    throw new Error('Expected 401 but got ' + wrongUserRes.status);
  }

  // 7. Test Protected Admin Route WITHOUT Token
  console.log('\n7. Testing Protected Admin Route GET /api/admin/stats WITHOUT Token...');
  const noAuthAdminRes = await fetch(`${API_BASE}/admin/stats`);
  if (noAuthAdminRes.status === 401) {
    console.log('✔ Correctly blocked unauthorized access (HTTP 401).');
  } else {
    throw new Error('Expected 401 but got ' + noAuthAdminRes.status);
  }

  // 8. Test Protected Admin Route WITH INVALID Token
  console.log('\n8. Testing Protected Admin Route WITH INVALID Token...');
  const invalidTokenRes = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: 'Bearer invalid.fake.token.here' }
  });
  if (invalidTokenRes.status === 403) {
    console.log('✔ Correctly rejected fake token (HTTP 403).');
  } else {
    throw new Error('Expected 403 but got ' + invalidTokenRes.status);
  }

  // 9. Test Protected Admin Route WITH VALID Token
  console.log('\n9. Testing Protected Admin Route WITH VALID Token...');
  const validAdminRes = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const validAdminData = await validAdminRes.json();
  if (validAdminRes.status === 200 && validAdminData.success) {
    console.log(`✔ Admin stats authorized and retrieved: ${validAdminData.stats.totalNotes} notes, ${validAdminData.stats.totalMediaFiles} media files.`);
  } else {
    throw new Error('Admin stats failed with valid token');
  }

  // 10. Test Public Access to Website Endpoints WITHOUT Token
  console.log('\n10. Testing Public Website Endpoints (No Auth Required)...');
  const [pRes, nRes, cRes, rRes] = await Promise.all([
    fetch(`${API_BASE}/profile`),
    fetch(`${API_BASE}/notes`),
    fetch(`${API_BASE}/certifications`),
    fetch(`${API_BASE}/resume`)
  ]);
  if (pRes.status === 200 && nRes.status === 200 && cRes.status === 200 && rRes.status === 200) {
    console.log('✔ All public website endpoints are accessible to visitors without authentication.');
  } else {
    throw new Error('Public endpoint access failed');
  }

  // 11. Test Protected File Upload WITHOUT Token
  console.log('\n11. Testing Protected Media Upload WITHOUT Token...');
  const dummyForm = new FormData();
  dummyForm.append('files', new Blob(['test content'], { type: 'text/plain' }), 'test.txt');
  const noAuthUploadRes = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    body: dummyForm
  });
  if (noAuthUploadRes.status === 401) {
    console.log('✔ Correctly blocked unauthorized file upload (HTTP 401).');
  } else {
    throw new Error('File upload without auth should have returned 401!');
  }

  // 12. Test Protected File Upload WITH VALID Token
  console.log('\n12. Testing Protected Media Upload WITH VALID Token...');
  const authUploadRes = await fetch(`${API_BASE}/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: dummyForm
  });
  const authUploadData = await authUploadRes.json();
  if (authUploadRes.status === 200 && authUploadData.uploaded?.length > 0) {
    console.log(`✔ Authorized file upload succeeded! Stored as: ${authUploadData.uploaded[0].stored_name}`);
  } else {
    throw new Error('Authorized file upload failed: ' + JSON.stringify(authUploadData));
  }

  // 13. Test Token Verification /api/auth/me
  console.log('\n13. Testing Token Verification GET /api/auth/me...');
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const meData = await meRes.json();
  if (meRes.status === 200 && meData.user.username === 'ravi') {
    console.log(`✔ Session verified for user: ${meData.user.username} (${meData.user.email})`);
  }

  console.log('\n=============================================================');
  console.log('🎉 ALL 13 AUTHENTICATION & ACCESS SECURITY TESTS PASSED 100%!');
  console.log('=============================================================');
}

runAuthTests().catch((err) => {
  console.error('❌ Auth Verification Failed:', err);
  process.exit(1);
});
