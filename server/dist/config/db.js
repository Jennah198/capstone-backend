"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const mongoUri = process.env.DATABASE_URL || "mongodb://localhost:27017/mydb";
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log("✅ MongoDB connected successfully");
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1); // Stop the app if cannot connect
    }
};
exports.default = connectDB;
