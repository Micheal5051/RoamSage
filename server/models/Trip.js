
const mongoose = require("mongoose");

const itineraryItemSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      default: 1
    },
    title: {
      type: String,
      default: ""
    },
    time: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { _id: true }
);

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    },
    visited: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const journeyPlanSchema = new mongoose.Schema(
  {
    origin: {
      type: String,
      default: ""
    },
    transportMode: {
      type: String,
      enum: ["train", "bus", "flight", "car", "other", ""],
      default: ""
    },
    planningMethod: {
      type: String,
      enum: ["live", "manual", ""],
      default: ""
    },
    outbound: {
      departureLocation: {
        type: String,
        default: ""
      },
      departureDateTime: {
        type: Date,
        default: null
      },
      arrivalLocation: {
        type: String,
        default: ""
      },
      arrivalDateTime: {
        type: Date,
        default: null
      },
      provider: {
        type: String,
        default: ""
      },
      serviceName: {
        type: String,
        default: ""
      },
      bookingUrl: {
        type: String,
        default: ""
      }
    },
    returnJourney: {
      departureLocation: {
        type: String,
        default: ""
      },
      departureDateTime: {
        type: Date,
        default: null
      },
      arrivalLocation: {
        type: String,
        default: ""
      },
      arrivalDateTime: {
        type: Date,
        default: null
      },
      provider: {
        type: String,
        default: ""
      },
      serviceName: {
        type: String,
        default: ""
      },
      bookingUrl: {
        type: String,
        default: ""
      }
    },
    restDurationMinutes: {
      type: Number,
      min: 0,
      max: 1440,
      default: 120
    },
    hotelBudget: {
      type: String,
      enum: ["budget", "moderate", "premium", ""],
      default: "moderate"
    },
    travelPace: {
      type: String,
      enum: ["relaxed", "balanced", "packed"],
      default: "balanced"
    },
    travelerCount: {
      type: Number,
      min: 1,
      max: 100,
      default: 1
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      default: ""
    },
    journeyPlan: {
      type: journeyPlanSchema,
      default: null
    },
    itinerary: {
      type: [itineraryItemSchema],
      default: []
    },
    places: {
      type: [placeSchema],
      default: []
    },
    generatedItinerary: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Trip", tripSchema);
