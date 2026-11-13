
const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  country: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ""
  },

  about: {
    type: String,
    default: ""
  },

  history: {
    type: String,
    default: ""
  },

  culture: {
    type: String,
    default: ""
  },

  food: {
    type: [String],
    default: []
  },

  experiences: {
    type: [String],
    default: []
  },

  image: {
    type: String,
    default: ""
  },

  gallery: {
    type: [String],
    default: []
  },

  travelInfo: {
    bestTimeToVisit: {
      type: String,
      default: ""
    },

    idealDuration: {
      type: String,
      default: ""
    },

    knownFor: {
      type: [String],
      default: []
    }
  },

  latitude: {
    type: Number
  },

  longitude: {
    type: Number
  },

  tags: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model("Destination", destinationSchema);
