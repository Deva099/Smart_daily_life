import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
export const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorResponse('Email is required', 400));
    }
    const user = await User.findOne({ email });
    res.status(200).json({ success: true, exists: !!user });
  } catch (error) {
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { name, email, username, password } = req.body;

    // Check if user exists by email or username
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return next(new ErrorResponse('User already exists with that email or username', 400));
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
  try {
    const identifier = req.body.email || req.body.username;
    const password = req.body.password;

    if (!identifier || !password) {
      return next(new ErrorResponse('Please provide an email/username and password', 400));
    }

    // Check for user
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    }).select('+password');
    
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });

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
    return next(new ErrorResponse('Refresh token is required', 401));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return next(new ErrorResponse('Invalid refresh token', 401));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    res.status(200).json({ success: true, token });
  } catch (error) {
    next(new ErrorResponse('Refresh token expired or invalid', 401));
  }
};

// @desc    Forgot password (Generate & Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('User not found with that email', 404));
    }

    const otp = user.getOTP();
    await user.save({ validateBeforeSave: false });

    // Important for logs during development
    console.log(`[DEV] OTP for ${user.email} is: ${otp}`);

    const message = `You requested a password reset. Your OTP is: \n\n ${otp} \n\nThis OTP is valid for 5 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Smart Daily Life - Password Reset OTP',
        message
      });
      res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (err) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ErrorResponse('Email and OTP are required', 400));
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      otp: hashedOTP,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired OTP', 400));
    }

    res.status(200).json({ success: true, message: 'OTP Verified successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password (with OTP)
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return next(new ErrorResponse('All fields are required', 400));
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      otp: hashedOTP,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired OTP', 400));
    }

    if (newPassword.length < 6) {
       return next(new ErrorResponse('Password must be at least 6 characters', 400));
    }

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
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(new ErrorResponse('Please provide an email', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ success: true, message: 'If registered, your username has been sent.' });
    }

    const message = `Hello ${user.name},\n\nYour username is: ${user.username}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Smart Daily Life - Username Recovery',
        message
      });
      res.status(200).json({ success: true, message: 'If registered, your username has been sent.' });
    } catch (err) {
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile picture (Base64)
// @route   PUT /api/auth/profile-pic
// @access  Private
export const updateProfilePic = async (req, res, next) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return next(new ErrorResponse('Please provide a profile picture (Base64)', 400));
    }

    // 1. Check size (approx 2MB after Base64 encoding overhead)
    // Base64 is about 33% larger than binary. So 2MB binary -> ~2.7MB base64
    if (profilePic.length > (2 * 1024 * 1024 * 1.35)) {
      return next(new ErrorResponse('Image size must be less than 2MB', 400));
    }

    // 2. Check file type via Base64 header
    if (!profilePic.match(/^data:image\/(png|jpg|jpeg);base64,/)) {
      return next(new ErrorResponse('Only JPG and PNG formats are allowed', 400));
    }

    const user = await User.findById(req.user.id);
    user.profilePic = profilePic; // Store base64 direct in MongoDB
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ 
      success: true, 
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        profilePic: user.profilePic,
        subscriptionType: user.subscriptionType
      } 
    });
  } catch (error) {
    next(error);
  }
};
