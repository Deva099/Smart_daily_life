import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,  // 10 seconds
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Provide clear instructions for the IP whitelist error
    if (error.message && error.message.includes('Could not connect to any servers')) {
      console.error('\n❌ MongoDB Atlas Connection Failed!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('REASON: Your IP is not whitelisted in MongoDB Atlas.');
      console.error('');
      console.error('FIX: Go to https://cloud.mongodb.com/');
      console.error('  → Network Access → Add IP Address');
      console.error('  → Click "Allow Access From Anywhere"');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error(`❌ DB Error: ${error.message}`);
    }
    process.exit(1);
  }
};

export default connectDB;
