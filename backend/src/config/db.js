// bm6MmAxijXoC8UZJ
// mukeshpathak345_db_user
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_DB) {
      throw new Error("MONGO_DB environment variable is missing.");
    }

    const conn = await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Stop server if DB fails to connect
  }
};

module.exports = connectDB;
