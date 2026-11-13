
const express = require("express");
const { getRecommendations } = require("../utils/recommendationEngine");

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const { interests } = req.body || {};

    if (!Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one interest."
      });
    }

    const result = getRecommendations({ interests });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Recommendation API error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate recommendations."
    });
  }
});

module.exports = router;
