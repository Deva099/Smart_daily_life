import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = async (req, res, next) => {
  console.log('🔍 checkEmail reached with:', req.body);
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    console.log('🔍 user found:', !!user);
    res.json({ exists: !!user });
  } catch (error) {
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  console.log('📝 Signup processing...');
  try {
    const { name, email, username, password } = req.body;

    // Check if user exists by email or username
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400); 
      return next(new Error('User already exists with that email or username'));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      username,
      password
    });

    await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  console.log('🔑 Login processing...');
  try {
    // Frontend might pass email field, but let's interpret it as an identifier (email or username)
    const identifier = req.body.email || req.body.username;
    const password = req.body.password;

    // Validate inputs
    if (!identifier || !password) {
      res.status(400);
      return next(new Error('Please provide an email/username and password'));
    }

    // Check for user
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    }).select('+password');
    
    if (!user) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  // Create tokens
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m' // Access token short lived
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d' // Refresh token long lived
  });

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    return next(new Error('Refresh token is required'));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401);
      return next(new Error('Invalid refresh token'));
    }

    // Issue new access token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    res.status(401);
    next(new Error('Refresh token expired or invalid'));
  }
};

// @desc    Forgot password (Generate & Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  console.log('--- DEBUG: forgotPassword typeof next:', typeof next);
  console.log('📩 Forgot Password processing...');
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404);
      return next(new Error('User not found with that email'));
    }

    // Generate 6 digit OTP (saved to model hashed)
    const otp = user.getOTP();
    await user.save({ validateBeforeSave: false });

    console.log("-----------------------------------------");
    console.log("🔑 OTP generated:", otp);
    console.log("-----------------------------------------");

    const message = `You requested a password reset. Your OTP is: \n\n ${otp} \n\nThis OTP is valid for 5 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Smart Daily Life - Password Reset OTP',
        message
      });
      res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (err) {
      console.error(err);
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500);
      console.log('--- DEBUG: forgotPassword typeof next in catch:', typeof next);
      return next(new Error('Email could not be sent'));
    }
  } catch (err) {
    console.log('--- DEBUG: forgotPassword typeof next in outer catch:', typeof next);
    next(err);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  console.log('✅ Verify OTP processing...');
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      return next(new Error('Email and OTP are required'));
    }

    // Hash the raw OTP provided by user to compare with DB
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email,
      otp: hashedOTP,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      return next(new Error('Invalid or expired OTP'));
    }

    res.status(200).json({ success: true, message: 'OTP Verified successfully. You can now reset your password.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password (with OTP)
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  console.log('🔄 Reset Password processing...');
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      res.status(400);
      return next(new Error('Email, OTP, and newPassword are required'));
    }

    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email,
      otp: hashedOTP,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      return next(new Error('Invalid or expired OTP'));
    }

    if (newPassword.length < 6) {
       res.status(400);
       return next(new Error('Password must be at least 6 characters'));
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Username
// @route   POST /api/auth/forgot-username
// @access  Public
export const forgotUsername = async (req, res, next) => {
  console.log('👤 Forgot Username processing...');
  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400);
      return next(new Error('Please provide an email'));
    }

    const user = await User.findOne({ email });

    if (!user) {
      // For security reasons, don't expose that the email doesn't exist
      // Just act as if we sent it
      return res.status(200).json({ success: true, message: 'If this email is registered, your username has been sent.' });
    }

    const message = `Hello ${user.name},\n\nYou requested to recover your username.\nYour username is: ${user.username}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Smart Daily Life - Username Recovery',
        message
      });
      res.status(200).json({ success: true, message: 'If this email is registered, your username has been sent.' });
    } catch (err) {
      console.error(err);
      res.status(500);
      return next(new Error('Email could not be sent'));
    }
  } catch (err) {
    next(err);
  }
};
// @desc    Get current logged in user (profile)
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  console.log('👤 profile fetch for user id:', req.user.id);
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
