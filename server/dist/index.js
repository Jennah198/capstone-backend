"use strict";
// import express, { Express, Request, Response } from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// // import chatRoutes from './routes/chat.route';
// // import authRoutes from './routes/auth.route';
// dotenv.config();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_route_js_1 = __importDefault(require("./routes/auth.route.js"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
(0, db_1.default)();
app.get('/', auth_route_js_1.default);
mongoose_1.default.connection.once('open', () => {
    console.log('Connected to MongoDB');
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
