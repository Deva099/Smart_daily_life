import ErrorResponse from '../utils/errorResponse.js';

/**
 * Validation Middleware helper
 * @param {Array} requiredFields - List of mandatory fields in req.body
 */
export const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return next(new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    next();
  };
};
