import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';

// Setup Razorpay Context (Graceful fallback to mock keys if not embedded in .env)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyIdXyz123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'MockTestSecretSecureHash456'
});

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Base convert amount to atomic paisa values (1 INR = 100 paisa)
    let amount = 0;
    if (plan === 'medium') amount = 399 * 100;
    else if (plan === 'premium') amount = 799 * 100;
    else return res.status(400).json({ message: 'Invalid subscription tier selected' });

    const options = {
      amount, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).json({ message: 'Error establishing Razorpay connection block.' });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    
    // Hash cross-evaluation logic exactly against webhook
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'MockTestSecretSecureHash456')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Digital cryptographic signature parsed uniquely. Upgrade the targeted user in the database.
      const user = await User.findById(req.user._id);
      if (user) {
        user.subscriptionType = plan;
        user.isPremium = true;
        
        // Append a rolling 30 days subscription active threshold
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        user.subscriptionExpiry = expiry;
        
        const updatedUser = await user.save();
        
        return res.json({ 
          message: "Payment successfully verified.",
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isPremium: updatedUser.isPremium,
            subscriptionType: updatedUser.subscriptionType,
            subscriptionExpiry: updatedUser.subscriptionExpiry
          }
        });
      }
      return res.status(404).json({ message: "Validated successfully, but native User context unlinked." });
    } else {
      return res.status(400).json({ message: "Invalid cryptographical payment signature. Warning." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
