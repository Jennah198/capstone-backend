import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.DATABASE_URL || "mongodb://localhost:27017/mydb";

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Stop the app if cannot connect
  }
};

export default connectDB;
