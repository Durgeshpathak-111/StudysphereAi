import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError, asyncHandler, sendSuccess } from '../utils/apiResponse.js';

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, university, college, course, branch, semester } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, 'Full name, email, and password are required.');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long.');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({
    fullName,
    email,
    passwordHash: password,
    university,
    college,
    course,
    branch,
    semester: Number(semester) || 1
  });

  const token = signToken(user._id);
  const userObj = user.toObject();
  delete userObj.passwordHash;

  sendSuccess(res, 201, 'Registration successful', { token, user: userObj });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken(user._id);
  const userObj = user.toObject();
  delete userObj.passwordHash;

  sendSuccess(res, 200, 'Login successful', { token, user: userObj });
});

export const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Profile fetched', { user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['fullName', 'university', 'college', 'course', 'branch', 'semester'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const updated = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  });

  sendSuccess(res, 200, 'Profile updated successfully', { user: updated });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'Provide current password and a new password (min 6 characters).');
  }

  const user = await User.findById(req.user._id).select('+passwordHash');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  user.passwordHash = newPassword;
  await user.save();

  sendSuccess(res, 200, 'Password changed successfully');
});

export const logoutUser = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Logged out successfully');
});