import Health from '../models/Health.js';

export const getHealthData = async (req, res, next) => {
  try {
    const { dateStr } = req.params;
    const userId = req.user._id;
    
    // Find existing or return default baseline
    let health = await Health.findOne({ userId, dateStr });
    if (!health) {
      health = {
        userId,
        dateStr,
        waterIntake: 0,
        sleepHours: 0,
        steps: 0,
        exerciseMinutes: 0
      };
    }
    res.json(health);
  } catch (error) {
    next(error);
  }
};

export const upsertHealthData = async (req, res, next) => {
  try {
    const { dateStr } = req.params;
    const userId = req.user._id;
    
    // Ensure only valid updatable fields map dynamically
    const updateData = {};
    if (req.body.waterIntake !== undefined) updateData.waterIntake = req.body.waterIntake;
    if (req.body.sleepHours !== undefined) updateData.sleepHours = req.body.sleepHours;
    if (req.body.steps !== undefined) updateData.steps = req.body.steps;
    if (req.body.exerciseMinutes !== undefined) updateData.exerciseMinutes = req.body.exerciseMinutes;

    const health = await Health.findOneAndUpdate(
      { userId, dateStr },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.json(health);
  } catch (error) {
    next(error);
  }
};
