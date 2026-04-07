import Settings from '../models/Settings.js';

/**
 * @desc    Get user settings (creates defaults if none exist)
 * @route   GET /api/settings
 * @access  Protected
 */
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });

    // If no settings exist yet, create defaults for this user
    if (!settings) {
      const defaults = Settings.getDefaults();
      settings = await Settings.create({ userId: req.user._id, ...defaults });
      console.log(`✅ Created default settings for user ${req.user._id}`);
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('❌ getSettings error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

/**
 * @desc    Update user settings (partial updates supported via deep merge)
 * @route   PUT /api/settings
 * @access  Protected
 */
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Build a flat $set object for partial nested updates
    // e.g. { appearance: { themeMode: 'light' } } → { 'appearance.themeMode': 'light' }
    const setObj = {};

    for (const [section, values] of Object.entries(updates)) {
      if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
        for (const [key, val] of Object.entries(values)) {
          setObj[`${section}.${key}`] = val;
        }
      } else {
        setObj[section] = values;
      }
    }

    let settings = await Settings.findOneAndUpdate(
      { userId },
      { $set: setObj },
      { new: true, runValidators: true }
    );

    // If no doc found, create with defaults then apply updates
    if (!settings) {
      const defaults = Settings.getDefaults();
      settings = await Settings.create({ userId, ...defaults });
      settings = await Settings.findOneAndUpdate(
        { userId },
        { $set: setObj },
        { new: true, runValidators: true }
      );
    }

    console.log(`✅ Settings updated for user ${userId}`);
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('❌ updateSettings error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

/**
 * @desc    Reset user settings to defaults
 * @route   POST /api/settings/reset
 * @access  Protected
 */
export const resetSettings = async (req, res) => {
  try {
    const defaults = Settings.getDefaults();
    
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: defaults },
      { new: true, upsert: true }
    );

    console.log(`🔄 Settings reset for user ${req.user._id}`);
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('❌ resetSettings error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset settings' });
  }
};
