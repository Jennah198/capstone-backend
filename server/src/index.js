
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import eventRoutes from "./routes/event.route.js"
import categoryRoutes from './routes/category.route.js'
import venueRoutes from './routes/venue.route.js'
import orderRoutes from './routes/order.route.js'
import ticketRoutes from './routes/ticketDownload.route.js'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";



const app = express();
const port = process.env.PORT || 8000;



app.use(cookieParser());
app.use(express.json());

const uploadsDir = path.join(path.resolve(), "src/uploads");
app.use("/uploads", express.static(uploadsDir));


 connectDB();


mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});
app.use("/api/auth", authRoute);
app.use('/api/events', eventRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tickets', ticketRoutes);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
