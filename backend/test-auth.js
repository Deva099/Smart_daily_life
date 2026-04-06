const API_URL = 'http://localhost:5002/api/auth';

const post = async (url, body) => {
    const res = await fetch(API_URL + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return await res.json();
};

const testAuth = async () => {
    console.log('🚀 Starting Auth System Test (Native Fetch)...');
    
    const timestamp = Date.now();
    const testData = {
        name: 'Test User',
        email: `test${timestamp}@example.com`,
        username: `tester${timestamp}`,
        password: 'password123'
    };

    try {
        // 1. SIGNUP
        console.log('\n📝 Testing Signup...');
        const signupRes = await post('/signup', testData);
        console.log('✅ Signup Success:', signupRes.success);
        if (!signupRes.success) throw new Error(signupRes.message);

        // 2. LOGIN (Email)
        console.log('\n🔑 Testing Login (Email)...');
        const loginEmailRes = await post('/login', {
            email: testData.email,
            password: testData.password
        });
        console.log('✅ Login (Email) Success:', loginEmailRes.success);
        if (!loginEmailRes.success) throw new Error(loginEmailRes.message);

        // 3. LOGIN (Username)
        console.log('\n👤 Testing Login (Username)...');
        const loginUserRes = await post('/login', {
            username: testData.username,
            password: testData.password
        });
        console.log('✅ Login (Username) Success:', loginUserRes.success);
        if (!loginUserRes.success) throw new Error(loginUserRes.message);

        // 4. FORGOT PASSWORD (OTP)
        console.log('\n📩 Testing Forgot Password (Request OTP)...');
        const forgotRes = await post('/forgot-password', {
            email: testData.email
        });
        console.log('✅ Forgot Password API Call Success:', forgotRes.success);
        if (!forgotRes.success) throw new Error(forgotRes.message);
        
        // 5. FORGOT USERNAME
        console.log('\n❓ Testing Forgot Username...');
        const forgotUserRes = await post('/forgot-username', {
            email: testData.email
        });
        console.log('✅ Forgot Username API Call Success:', forgotUserRes.success);
        if (!forgotUserRes.success) throw new Error(forgotUserRes.message);

        console.log('\n🏁 Basic Auth flow tests PASSED!');
    } catch (error) {
        console.error('\n❌ Test FAILED:');
        console.error(error.message);
    }
};

testAuth();
