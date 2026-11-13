
const express = require("express");
const attractions = require("../data/attractions");
const { isIndianAttraction } = require("../utils/indiaOnly");

const router = express.Router();
const indianAttractions = attractions.filter(isIndianAttraction);

// GET ALL ATTRACTIONS
router.get("/", (req, res) => {
  res.json(indianAttractions);
});

// GET ONE ATTRACTION BY ID
router.get("/:id", (req, res) => {
  const attraction = indianAttractions.find(
    (item) => item.id === req.params.id
  );

  if (!attraction) {
    return res.status(404).json({
      message: "Attraction not found"
    });
  }

  res.json(attraction);
});

module.exports = router;
