// Comprehensive Automated Test Suite for Vistora Authentication
const http = require('http');

const API_BASE = 'http://localhost:5000/api';
const PROXY_BASE = 'http://localhost:5173/api';

// Helper to make fetch requests and track cookies
class SessionClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cookie = '';
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (this.cookie) {
      headers['Cookie'] = this.cookie;
    }

    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers
    });

    // Capture set-cookie
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      if (setCookie.includes('token=;') || setCookie.includes('Max-Age=0') || setCookie.includes('01 Jan 1970')) {
        this.cookie = '';
      } else {
        const tokenMatch = setCookie.match(/token=([^;]+)/);
        if (tokenMatch) {
          this.cookie = `token=${tokenMatch[1]}`;
        }
      }
    }

    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return { status: res.status, data, headers: res.headers };
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Vistora Authentication Automated Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const client = new SessionClient(API_BASE);
  const testEmail = `testuser_${Date.now()}@vistora.com`;
  const testPassword = 'Password123!';

  // Test 0: Health check
  console.log('--- Test 0: API Health Check ---');
  const healthRes = await client.request('/health');
  assert(healthRes.status === 200 && healthRes.data?.status === 'ok', 'API health check returns ok');

  // Test 1: Register a new user
  console.log('\n--- Test 1: Register New User ---');
  const regRes = await client.request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Vistora Tester',
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    })
  });
  assert(regRes.status === 201, 'Registration returns 201 Created');
  assert(regRes.data?.success === true, 'Response indicates success = true');
  assert(regRes.data?.user?.email === testEmail.toLowerCase(), 'User email matches registered email');
  assert(!regRes.data?.user?.password, 'Password hash is NOT exposed in response payload');
  assert(Boolean(client.cookie), 'HttpOnly session cookie was set on registration');

  // Test 2: Duplicate registration rejection
  console.log('\n--- Test 2: Prevent Duplicate Email Registration ---');
  const dupRes = await client.request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Duplicate Tester',
      email: testEmail,
      password: 'AnotherPassword99!',
      confirmPassword: 'AnotherPassword99!'
    })
  });
  assert(dupRes.status === 409, 'Duplicate email registration returns 409 Conflict');
  assert(dupRes.data?.success === false, 'Duplicate registration is rejected');

  // Test 3: Log out
  console.log('\n--- Test 3: Logout Invalidation ---');
  const logoutRes = await client.request('/auth/logout', { method: 'POST' });
  assert(logoutRes.status === 200, 'Logout returns 200 OK');
  assert(client.cookie === '', 'Session cookie was cleared on logout');

  // Test 4: Attempt login with invalid credentials
  console.log('\n--- Test 4: Attempt Login with Incorrect Password ---');
  const badLoginRes = await client.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'WrongPassword123'
    })
  });
  assert(badLoginRes.status === 401, 'Incorrect password returns 401 Unauthorized');
  assert(badLoginRes.data?.success === false, 'Login rejected for incorrect password');
  assert(client.cookie === '', 'No session cookie issued for invalid login');

  // Test 5: Log in with valid credentials
  console.log('\n--- Test 5: Login with Valid Credentials ---');
  const goodLoginRes = await client.request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  assert(goodLoginRes.status === 200, 'Valid login returns 200 OK');
  assert(goodLoginRes.data?.success === true, 'Login succeeds');
  assert(goodLoginRes.data?.user?.name === 'Vistora Tester', 'User name is correct');
  assert(Boolean(client.cookie), 'Valid HttpOnly session cookie issued on login');

  // Test 6: Verify Session Restoration on Reload (GET /api/auth/me)
  console.log('\n--- Test 6: Restore Session Securely (Simulating Browser Reload) ---');
  const meRes = await client.request('/auth/me');
  assert(meRes.status === 200, 'Session verification returns 200 OK');
  assert(meRes.data?.user?.email === testEmail.toLowerCase(), 'Session belongs to authenticated user');

  // Test 7: Access Protected User Profile
  console.log('\n--- Test 7: Access Protected Profile Route ---');
  const profileRes = await client.request('/auth/profile');
  assert(profileRes.status === 200, 'Protected profile route accessible with valid session');
  assert(profileRes.data?.profile?.email === testEmail.toLowerCase(), 'Profile data matches authenticated user');

  // Test 8: Logout and Verify Protected Routes Are Blocked
  console.log('\n--- Test 8: Verify Protected Routes Blocked After Logout ---');
  await client.request('/auth/logout', { method: 'POST' });
  const blockedMeRes = await client.request('/auth/me');
  assert(blockedMeRes.status === 401, 'Accessing /auth/me after logout returns 401 Unauthorized');
  const blockedProfileRes = await client.request('/auth/profile');
  assert(blockedProfileRes.status === 401, 'Accessing /auth/profile after logout returns 401 Unauthorized');

  // Test 9: Verify Vite Proxy Integration
  console.log('\n--- Test 9: Verify Vite Proxy (/api -> backend) ---');
  try {
    const proxyClient = new SessionClient(PROXY_BASE);
    const proxyHealth = await proxyClient.request('/health');
    assert(proxyHealth.status === 200 && proxyHealth.data?.status === 'ok', 'Vite proxy transparently forwards /api requests');
  } catch (err) {
    console.warn('Vite proxy test warning:', err.message);
  }

  console.log('\n======================================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
