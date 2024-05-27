const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  user: { type: String, required: true },
  type: { type: String, required: true },
});

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  details: { type: String, required: true },
  youtubeVideoCode: { type: String, required: true },
  country: { type: String, required: true },
  category: { type: String, required: true },
  creatorEmail: { type: String, required: true },
  watchCount: { type: Number, default: 0 },
  purchased_by: { type: [String], default: [] },
  reactions: [reactionSchema],
});

const Recipe = mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
