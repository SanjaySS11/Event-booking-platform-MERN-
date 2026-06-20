import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError(400, "Please provide all required fields"));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "User already exists with this email"));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "user",
  });

  const token = generateToken(user._id, user.role);

  return res.status(201).json(
    new ApiResponse(201, { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token }, "User registered successfully")
  );
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Please provide email and password"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError(401, "Invalid email or password"));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ApiError(401, "Invalid email or password"));
  }

  if (!user.isActive) {
    return next(new ApiError(403, "Your account has been deactivated"));
  }

  const token = generateToken(user._id, user.role);

  return res.status(200).json(
    new ApiResponse(200, { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token }, "User logged in successfully")
  );
};

export const getMe = async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
};