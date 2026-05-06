const jwt = require('jsonwebtoken');
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/response");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendResponse(res, false, "No Authorization header", null, 401);
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return sendResponse(res, false, "Invalid token format", null, 401);
    }

    const token = parts[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return sendResponse(res, false, "Invalid token", null, 401);
    } else if (err.name === 'TokenExpiredError') {
      return sendResponse(res, false, "Token expired", null, 401);
    }
    return sendResponse(res, false, "Invalid or expired token", null, 401);
  }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.userRole} is not authorized to access this route`
            });
        }
        next();
    };
};