
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import mongoose from "mongoose";
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

 connectDB();


mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});
app.use("/api/auth", authRoute);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
