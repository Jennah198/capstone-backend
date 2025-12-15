// import express, { Express, Request, Response } from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// // import chatRoutes from './routes/chat.route';
// // import authRoutes from './routes/auth.route';
// dotenv.config();

// const app: Express = express();
// const port = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// // app.use('/api/chat', chatRoutes);
// // app.use('/api/auth',  authRoutes);

// app.listen(port, () => {
//   console.log(`⚡ Server is running at http://localhost:${port}`);
// });

import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoute from "./routes/auth.route";
import mongoose from "mongoose";
dotenv.config();

const app: Express = express();
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
