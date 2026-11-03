const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  country: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  image: {
    type: String
  },

  latitude: {
    type: Number
  },

  longitude: {
    type: Number
  },

  tags: {
    type: [String]
  }
});

module.exports = mongoose.model("Destination", destinationSchema);