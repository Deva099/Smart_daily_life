import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyIdXyz123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'MockTestSecretSecureHash456'
});

// @desc    Create a payment order
// @route   POST /api/payments/order
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;
    
    let amount = 0;
    if (plan === 'medium') amount = 399 * 100;
    else if (plan === 'premium') amount = 799 * 100;
    else return next(new ErrorResponse('Invalid subscription tier selected', 400));

    const options = {
      amount, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    if (!order) return next(new ErrorResponse('Error establishing Razorpay connection', 500));

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'MockTestSecretSecureHash456')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const user = await User.findById(req.user._id);
      if (!user) return next(new ErrorResponse('User not found', 404));

      user.subscriptionType = plan;
      user.isPremium = true;
      
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      user.subscriptionExpiry = expiry;
      
      const updatedUser = await user.save();
      
      res.status(200).json({ 
        success: true,
        message: "Payment verified successfully",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          isPremium: updatedUser.isPremium,
          subscriptionType: updatedUser.subscriptionType,
          subscriptionExpiry: updatedUser.subscriptionExpiry
        }
      });
    } else {
      return next(new ErrorResponse('Invalid payment signature', 400));
    }
  } catch (err) {
    next(err);
  }
};
