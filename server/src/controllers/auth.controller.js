import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
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
    let { name, email, password, phone, secretKey, role } = req.body;

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

    // Default role is user
    if (!role) role = "user";

    const secret = process.env.SECRET_KEY;
    // Validate secretKey for admin role only
    if (role === "admin" && (!secretKey || secretKey !== secret)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid secretKey for admin role" });
    }

    // Ensure role is valid
    if (!["user", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
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

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Required for cross-site cookies
      sameSite: "none", // Required for render.com -> localhost
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
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
    const users = await User.find().select("-password").sort({ createdAt: -1 });

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

// ================== GOOGLE OAUTH ==================
export const googleAuthRedirect = (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL; // e.g. https://your-backend.com/api/auth/google/callback
  const scope = [
    "openid",
    "profile",
    "email",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "select_account",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return res.redirect(authUrl);
};

export const googleAuthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code from Google");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return res.status(400).send("Google token exchange failed");
    }

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userInfoRes.json();
    if (!profile || !profile.email) {
      return res.status(400).send("Failed to fetch Google user info");
    }

    // Upsert user
    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email.toLowerCase(),
        password: "", // no local password
        role: "user",
        isVerified: true,
        profilePic: profile.picture || undefined,
      });
    } else {
      // Update profile fields if changed
      let changed = false;
      if (profile.name && user.name !== profile.name) {
        user.name = profile.name;
        changed = true;
      }
      if (profile.picture && user.profilePic !== profile.picture) {
        user.profilePic = profile.picture;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = generateToken(user);

    // Set cookie and redirect to client
    const CLIENT_URL = process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(CLIENT_URL);
  } catch (error) {
    console.error("Google callback error:", error);
    return res.status(500).send("Google auth failed");
  }
};

// ================== GOOGLE ID TOKEN LOGIN ==================
export const googleTokenLogin = async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ success: false, message: "Missing id_token" });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: "Invalid Google token payload" });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];
    const picture = payload.picture;

    // Upsert user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "", // no local password
        role: "user",
        isVerified: true,
        profilePic: picture || undefined,
      });
    } else {
      let changed = false;
      if (name && user.name !== name) {
        user.name = name;
        changed = true;
      }
      if (picture && user.profilePic !== picture) {
        user.profilePic = picture;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = generateToken(user);

    // Set cookie and respond with user
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Google token login error:", error);
    return res.status(500).json({ success: false, message: "Google token verification failed" });
  }
};
