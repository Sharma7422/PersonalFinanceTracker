const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      // console.log("Authorization Header:", req.headers.authorization);

      // console.log("🔑 Received Token:", token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("✅ Decoded Token:", decoded);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");
      // console.log("👤 User found:", req.user ? req.user.email : "null");

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      return next(); // ✅ stop here if success
    } catch (error) {
      console.error("❌ JWT Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    console.warn("⚠️ No token provided");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
