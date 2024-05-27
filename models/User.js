const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  photoURL: { type: String },
  email: { type: String, required: true, unique: true },
  coins: { type: Number, default: 50 },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
