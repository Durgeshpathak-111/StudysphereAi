import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/apiResponse.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    throw new ApiError(401, 'Not authorized. Missing access token.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, 'User account no longer exists.');
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired authentication token.');
  }
});