import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { signupUser, loginUser, checkEmail, forgotPasswordAPI, resetPasswordAPI, verifyOtpAPI, forgotUsernameAPI } from '../services/api';
import { Mail, Lock, User, ArrowRight, Loader2, CircleCheck, AlertCircle } from 'lucide-react';

const AuthView = () => {
  // viewState can be: 'login', 'signup', 'forgot-password', 'reset-password'
  const [viewState, setViewState] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const { login: authLogin, signup: authSignup } = useAuth();

  // Check URL on mount for reset token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setViewState('reset-password');
    }
  }, []);

  // Handle countdown redirection
  useEffect(() => {
    let timer;
    if (redirectCountdown !== null && redirectCountdown > 0) {
      timer = setTimeout(() => setRedirectCountdown(prev => prev - 1), 1000);
    } else if (redirectCountdown === 0) {
      setViewState('login');
      setError('');
      setRedirectCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  // Debounced email check
  const [emailTimeout, setEmailTimeout] = useState(null);
  
  const handleEmailChange = (val) => {
    setFormData({ ...formData, email: val });
    setEmailExists(false);
    
    if (viewState !== 'signup') return;
    
    if (emailTimeout) clearTimeout(emailTimeout);
    
    if (val.includes('@') && val.includes('.')) {
      setCheckingEmail(true);
      const timeout = setTimeout(async () => {
        try {
          const res = await checkEmail(val);
          setEmailExists(res.exists);
          if (res.exists) {
            setError('This email is already registered.');
          } else {
            setError('');
          }
        } catch (e) {
          console.error(e);
        } finally {
          setCheckingEmail(false);
        }
      }, 800);
      setEmailTimeout(timeout);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (viewState === 'login') {
        console.log("Login button clicked");
        const res = await loginUser({ email: formData.email, password: formData.password });
        console.log("API response:", res);
        
        if (res.success && res.token) {
          authLogin(res.user, res.token);
          window.location.href = "/";
        } else {
          setError('Invalid login response from server');
        }
      } else if (viewState === 'signup') {
        const res = await signupUser({ 
          name: formData.name, 
          email: formData.email, 
          username: formData.username,
          password: formData.password 
        });
        console.log("Signup API response:", res);
        setSuccess('Account created successfully! Logging you in...');
        
        if (res.success && res.token) {
          setTimeout(() => {
            authSignup(res.user, res.token);
            window.location.href = "/";
          }, 1500);
        }
      } else if (viewState === 'forgot-password') {
        const res = await forgotPasswordAPI(formData.email);
        setSuccess('OTP sent to your email');
        setViewState('verify-otp');
      } else if (viewState === 'verify-otp') {
        const res = await verifyOtpAPI(formData.email, formData.otp);
        setSuccess(res.message);
        setViewState('reset-password');
      } else if (viewState === 'reset-password') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        const res = await resetPasswordAPI(formData.email, formData.otp, formData.password);
        setSuccess('Password updated successfully! Redirecting to login...');
        
        setTimeout(() => {
           setViewState('login');
           setSuccess('');
           setFormData({ name: '', email: '', username: '', password: '', confirmPassword: '', otp: '' });
        }, 2000);
      } else if (viewState === 'forgot-username') {
        const res = await forgotUsernameAPI(formData.email);
        setSuccess(res.message);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      
      // Trigger automatic redirection countdown for existing users on signup
      if (viewState === 'signup' && (err.action === 'login' || (err.message && err.message.toLowerCase().includes('already exists')))) {
        setRedirectCountdown(3);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (viewState) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join SmartLife';
      case 'forgot-password': return 'Reset Your Password';
      case 'forgot-username': return 'Recover Username';
      case 'verify-otp': return 'Verify OTP';
      case 'reset-password': return 'Choose New Password';
      default: return 'Welcome';
    }
  };

  const getSubtitle = () => {
    switch (viewState) {
      case 'login': return 'Enter your details to manage your lifestyle';
      case 'signup': return 'Start your journey to a smarter daily life';
      case 'forgot-password': return "Enter your email to receive a 6-digit OTP";
      case 'forgot-username': return "Enter your email to retrieve your username";
      case 'verify-otp': return `A code was sent to ${formData.email}`;
      case 'reset-password': return "Create a new secure password for your account";
      default: return '';
    }
  };

  const getButtonText = () => {
    switch (viewState) {
      case 'login': return 'Login';
      case 'signup': return 'Create Account';
      case 'forgot-password': return 'Send OTP';
      case 'forgot-username': return 'Get My Username';
      case 'verify-otp': return 'Verify Code';
      case 'reset-password': return 'Change Password';
      default: return 'Submit';
    }
  };

  return (
    <div className="auth-container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '1rem'
    }}>
      <div className="card shadow-xl" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '2.5rem',
        animation: 'fadeSlideUp 0.5s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon mb-4" style={{ margin: '0 auto', width: '48px', height: '48px' }}>
             <ArrowRight size={32} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            {getTitle()}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {getSubtitle()}
          </p>
        </div>

        {error && (
          <div 
            className="mb-4 p-4 rounded-xl flex items-start gap-3" 
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              fontSize: '0.9rem', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both'
            }}
          >
            <div style={{ marginTop: '2px' }}>
              <AlertCircle size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <strong>{error}</strong>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>
                {error.toLowerCase().includes('already exists') 
                  ? `This email is already registered. ${redirectCountdown !== null ? `Redirecting in ${redirectCountdown}s...` : 'Please log in.'}`
                  : "Please check your details and try again."}
              </p>
              {viewState === 'signup' && error.includes('already exists') && (
                <button 
                  onClick={() => { setViewState('login'); setError(''); }}
                  className="btn btn-sm mt-3"
                  style={{ 
                    background: '#ef4444', 
                    color: 'white', 
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem'
                  }}
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', fontSize: '0.9rem', borderLeft: '4px solid var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CircleCheck size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Name Field (Signup only) */}
          {viewState === 'signup' && (
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {/* Username Field (Signup only) */}
          {viewState === 'signup' && (
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <ArrowRight size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="johndoe123" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                  required
                />
              </div>
            </div>
          )}

          {/* Email Field (Login, Signup, Forgot Password, Forgot Username) */}
          {(viewState === 'login' || viewState === 'signup' || viewState === 'forgot-password' || viewState === 'forgot-username') && (
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>
                {viewState === 'login' ? 'Email or Username' : 'Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  style={{ 
                    paddingLeft: '40px',
                    borderColor: emailExists && viewState === 'signup' ? '#ef4444' : 'var(--border-color)' 
                  }}
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                />
                {checkingEmail && (
                  <Loader2 className="animate-spin" size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                )}
              </div>
              {emailExists && viewState === 'signup' && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>
                  Email taken. Please log in instead.
                </p>
              )}
            </div>
          )}

          {/* OTP Field (Verify OTP only) */}
          {viewState === 'verify-otp' && (
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Enter 6-Digit OTP</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="000000" 
                  maxLength={6}
                  style={{ paddingLeft: '40px', letterSpacing: '0.5rem', fontWeight: 'bold' }}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.trim() })}
                  required
                />
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
                Check your email inbox or spam folder.
              </p>
            </div>
          )}

          {/* Password Field */}
          {(viewState === 'login' || viewState === 'signup' || viewState === 'reset-password') && (
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>
                {viewState === 'reset-password' ? 'New Password' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {/* Confirm Password Field (Reset Password only) */}
          {viewState === 'reset-password' && (
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {/* Forgot Password/Username Links (Login only) */}
          {viewState === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-0.5rem' }}>
              <button 
                type="button"
                onClick={() => { setViewState('forgot-username'); setError(''); setSuccess(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
              >
                Forgot Username?
              </button>
              <button 
                type="button"
                onClick={() => { setViewState('forgot-password'); setError(''); setSuccess(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2" 
            disabled={loading}
            style={{ padding: '0.85rem', position: 'relative' }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span>{getButtonText()}</span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {viewState === 'login' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <button 
                onClick={() => { setViewState('signup'); setError(''); setSuccess(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Sign Up
              </button>
            </p>
          )}
          
          {viewState === 'signup' && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <button 
                onClick={() => { setViewState('login'); setError(''); setSuccess(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Log In
              </button>
            </p>
          )}

          {(viewState === 'forgot-password' || viewState === 'reset-password') && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Remember your password?{' '}
              <button 
                onClick={() => { 
                  // If they cancel reset, remove token from URL visually if possible
                  if (viewState === 'reset-password') {
                     window.history.replaceState({}, document.title, "/");
                     setResetToken(null);
                  }
                  setViewState('login'); 
                  setError(''); 
                  setSuccess(''); 
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthView;
