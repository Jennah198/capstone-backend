"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../model/user"));
// --- Configuration ---
const JWT_SECRET = process.env.JWT_SECRET || "YOUR_MONGO_FALLBACK_SECRET";
/**
 * Generates a JWT token for the given user.
 */
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
};
const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide name, email, and password." });
    }
    try {
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists." });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await user_1.default.create({
            name,
            email,
            password: hashedPassword,
        });
        const token = generateToken(newUser);
        return res.status(201).json({
            message: "User registered successfully!",
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Server error during registration." });
    }
};
exports.register = register;
/**
 * Handles user login (email, password).
 */
// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "Please provide email and password." });
//   }
//   try {
//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials." });
//     }
//     const token = generateToken(user);
//     const userObject = user.toObject();
//     delete userObject.password;
//     return res.status(200).json({
//       message: "Login successful!",
//       token,
//       user: userObject,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({ message: "Server error during login." });
//   }
// };
