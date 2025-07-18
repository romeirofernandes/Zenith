const mongoose = require("mongoose");

const userAchievementSchema = new mongoose.Schema({
  userId: String,
  achievementCode: String,
  unlocked: { type: Boolean, default: false },
  unlockedAt: Date,
});

module.exports = mongoose.model("UserAchievement", userAchievementSchema);