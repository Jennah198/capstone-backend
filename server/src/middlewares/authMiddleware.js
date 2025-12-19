import jwt from 'jsonwebtoken';
export const protect = (req, res, next) => {
  const token = req.cookies?.token; 

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error("JWT verify error:", error);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};
