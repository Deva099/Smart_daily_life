const API_URL = 'http://localhost:5002/api/auth';

const post = async (url, body) => {
    const res = await fetch(API_URL + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return await res.json();
};

const testFullAuth = async () => {
    console.log('🚀 Starting FULL Auth End-to-End Test (Native Fetch)...');
    
    const timestamp = Date.now();
    const testData = {
        name: 'Full Test User',
        email: `test${timestamp}@example.com`,
        username: `tester${timestamp}`,
        password: 'initialPassword123'
    };
    const newPassword = 'updatedPassword456';

    try {
        // 1. SIGNUP
        console.log('\n📝 Step 1: Signup...');
        const signupRes = await post('/signup', testData);
        console.log('✅ Signup Success:', signupRes.success);
        if (!signupRes.success) throw new Error(signupRes.message);

        // 2. LOGIN (Initial)
        console.log('\n🔑 Step 2: Initial Login (Username)...');
        const loginRes = await post('/login', {
            username: testData.username,
            password: testData.password
        });
        console.log('✅ Initial Login Success:', loginRes.success);
        if (!loginRes.success) throw new Error(loginRes.message);

        // 3. FORGOT PASSWORD (Request OTP)
        console.log('\n📩 Step 3: Forgot Password (Request OTP)...');
        const forgotRes = await post('/forgot-password', { email: testData.email });
        console.log('✅ Request OTP Success:', forgotRes.success);
        if (!forgotRes.success) throw new Error(forgotRes.message);
        
        const otp = forgotRes.otp;
        console.log('--- TEST HINT: Recieved OTP from response:', otp);

        // 4. VERIFY OTP
        console.log('\n✅ Step 4: Verify OTP...');
        const verifyRes = await post('/verify-otp', { email: testData.email, otp });
        console.log('✅ Verify OTP Success:', verifyRes.success);
        if (!verifyRes.success) throw new Error(verifyRes.message);

        // 5. RESET PASSWORD
        console.log('\n🔄 Step 5: Reset Password...');
        const resetRes = await post('/reset-password', {
            email: testData.email,
            otp,
            newPassword
        });
        console.log('✅ Reset Password Success:', resetRes.success);
        if (!resetRes.success) throw new Error(resetRes.message);

        // 6. LOGIN (With New Password)
        console.log('\n🔓 Step 6: Final Login (With New Password)...');
        const finalLoginRes = await post('/login', {
            email: testData.email,
            password: newPassword
        });
        console.log('✅ Final Login Success:', finalLoginRes.success);
        if (!finalLoginRes.success) throw new Error(finalLoginRes.message);

        // 7. FORGOT USERNAME
        console.log('\n❓ Step 7: Forgot Username (Recovery)...');
        const forgotUserRes = await post('/forgot-username', { email: testData.email });
        console.log('✅ Forgot Username Request Success:', forgotUserRes.success);

        console.log('\n🏆 ALL END-TO-END TESTS PASSED SUCCESSFULLY!');
    } catch (error) {
        console.error('\n❌ E2E TEST FAILED:');
        console.error(error.message);
    }
};

testFullAuth();
