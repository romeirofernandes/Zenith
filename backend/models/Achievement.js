const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  title: String,
  description: String,
  icon: String, // e.g. "FiAward"
  category: String,
  rarity: { type: String, enum: ["common", "rare", "legendary"], default: "common" },
  criteria: Object, // e.g. { hackathonsJoined: 1 }
});

module.exports = mongoose.model("Achievement", achievementSchema);