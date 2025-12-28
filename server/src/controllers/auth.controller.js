import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../model/schema.js"; // use .js if your file is JS

// ================== CONFIG ==================
const JWT_SECRET = process.env.JWT_SECRET || "JWT_FALLBACK_SECRET";
const JWT_EXPIRES_IN = "1d";

// ================== TOKEN ==================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// ================== REGISTER ==================
export const register = async (req, res) => {
  try {
    let { name, email, password, phone, secretKey } = req.body;

    if (email) email = email.toLowerCase().trim();

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exist",
      });
    }

    let role = "user"
    const secret = process.env.SECRET_KEY
    // FOR REGISTER AS ADMIN IF SECRET KEY IS CORRECT, OTHERWISE REGISTER AS USER
    if (secretKey) {
      if (secretKey !== secret) {
        return res.status(400).json({ success: false, message: "Invalid secretKey" })
      } else {
        role = "admin"
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      isVerified: false,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// ================== LOGIN ==================
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (email) email = email.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    //Email verfication(eg,OTP) should be integrated at registration otherwise user not verified

    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     message: "Account not verified",
    //   });
    // }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Required for cross-site cookies
      sameSite: "none", // Required for render.com -> localhost
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};


export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};



//CHANGE ROLE ---------> ONLY FOR ADMIN
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;


    const allowedRoles = ["user", "organizer", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET ALL USERS ---------> ONLY FOR ADMIN
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password -otp -otpExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};