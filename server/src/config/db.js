import mongoose from "mongoose";

const connectDB = async () => {
  // Support either DATABASE_URL or MONGO_URI env names (some deployments use one or the other)
  const mongoUri = process.env.DATABASE_URL || process.env.MONGO_URI || "mongodb://localhost:27017/mydb";

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Stop the app if cannot connect
  }
};

export default connectDB;
