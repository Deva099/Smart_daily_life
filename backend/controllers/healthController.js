import Health from '../models/Health.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get health data for a specific date
// @route   GET /api/health/:dateStr
// @access  Private
export const getHealthData = async (req, res, next) => {
  try {
    const { dateStr } = req.params;
    const userId = req.user._id;
    
    let health = await Health.findOne({ userId, dateStr });
    
    if (!health) {
      // Return a default object if no data exists for that date
      return res.status(200).json({
        success: true,
        data: {
          userId,
          dateStr,
          waterIntake: 0,
          sleepHours: 0,
          steps: 0,
          exerciseMinutes: 0
        }
      });
    }
    
    res.status(200).json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
};

// @desc    Upsert health data for a date
// @route   PUT /api/health/:dateStr
// @access  Private
export const upsertHealthData = async (req, res, next) => {
  try {
    const { dateStr } = req.params;
    const userId = req.user._id;
    
    const updateData = {};
    const allowedFields = ['waterIntake', 'sleepHours', 'steps', 'exerciseMinutes'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const health = await Health.findOneAndUpdate(
      { userId, dateStr },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.status(200).json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
};
