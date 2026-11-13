
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    default: ""
  },

  dateOfBirth: {
    type: Date,
    default: null
  },

  gender: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: ""
  },

  profilePicture: {
    type: String,
    default: ""
  },

  avatar: {
    type: String,
    enum: [
      "pineapple",
      "strawberry",
      "avocado",
      "watermelon",
      "banana",
      "orange",
      "grapes",
      "peach",
      "kiwi",
      "lemon",
      "apple",
      "mango",
      "blueberry",
      "cherries",
      "coconut"
    ],
    default: "pineapple"
  },

  country: {
    type: String,
    default: ""
  },

  city: {
    type: String,
    default: ""
  },

  bio: {
    type: String,
    maxlength: 300,
    default: ""
  }
});

module.exports = mongoose.model("User", userSchema);
