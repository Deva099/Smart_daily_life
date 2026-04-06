


const API_URL = 'http://127.0.0.1:5002/api';

async function runTest() {
  const timestamp = Date.now();
  const testEmail = `test_${timestamp}@example.com`;
  const testUser = `user_${timestamp}`;
  const password = 'password123';

  console.log('🚀 Starting Auth System Test...');

  try {
    // 1. Test Signup
    console.log(`\n1. Attempting Signup for ${testEmail}...`);
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Automation',
        email: testEmail,
        username: testUser,
        password: password
      })
    });
    const signupData = await signupRes.json();
    console.log('Signup Response:', JSON.stringify(signupData, null, 2));

    if (!signupData.success) throw new Error('Signup failed');
    console.log('✅ Signup Successful!');

    // 2. Test Login
    console.log(`\n2. Attempting Login with ${testEmail}...`);
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: password
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (!loginData.success || !loginData.token) throw new Error('Login failed');
    console.log('✅ Login Successful! Token received.');

    const token = loginData.token;

    // 3. Test Profile (Protected Route)
    console.log('\n3. Attempting to fetch Profile (Protected)...');
    const profileRes = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const profileData = await profileRes.json();
    console.log('Profile Response:', JSON.stringify(profileData, null, 2));

    if (!profileData.success || profileData.data.email !== testEmail) throw new Error('Profile fetch failed');
    console.log('✅ Profile Fetch Successful! Data matches.');

    // 4. Test Forgot Password (OTP Generation)
    console.log('\n4. Attempting Forgot Password (OTP Generation)...');
    const forgotRes = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const forgotData = await forgotRes.json();
    console.log('Forgot Password Response:', JSON.stringify(forgotData, null, 2));

    if (!forgotData.success) throw new Error('Forgot password failed');
    console.log('✅ OTP Generation Triggered Successfully!');

    console.log('\n🌟 ALL TESTS PASSED PERFECTLY! 🌟');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTest();
