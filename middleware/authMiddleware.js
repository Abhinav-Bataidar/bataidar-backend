const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded.userId; // Store user ID in request object
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token." });
  }
};

module.exports = authMiddleware;
 
