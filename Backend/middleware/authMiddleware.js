import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return next(new ApiError(401, "Not authorized, no token provided"));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return next(new ApiError(401, "Not authorized, user not found"));
    }

    next();
  } catch (error) {
    return next(new ApiError(401, "Not authorized, token failed"));
  }
};

export default protect;