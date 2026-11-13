
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// AVAILABLE FRUIT AVATARS
const allowedAvatars = [
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
];


// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Failed to register user"
    });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "pineapple"
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Failed to login"
    });
  }
});


// GET LOGGED-IN USER PROFILE
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      user
    });

  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Failed to fetch profile"
    });
  }
});


// UPDATE USER PROFILE
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      phone,
      dateOfBirth,
      gender,
      profilePicture,
      avatar,
      country,
      city,
      bio
    } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // UPDATE NAME
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty"
        });
      }

      user.name = name.trim();
    }

    // UPDATE PHONE
    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    // UPDATE DATE OF BIRTH
    if (dateOfBirth !== undefined) {
      if (dateOfBirth === "") {
        user.dateOfBirth = null;
      } else {
        const parsedDate = new Date(dateOfBirth);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            message: "Invalid date of birth"
          });
        }

        user.dateOfBirth = parsedDate;
      }
    }

    // UPDATE GENDER
    if (gender !== undefined) {
      if (!["Male", "Female", "Other", ""].includes(gender)) {
        return res.status(400).json({
          message: "Invalid gender value"
        });
      }

      user.gender = gender;
    }

    // UPDATE PROFILE PICTURE URL
    if (profilePicture !== undefined) {
      user.profilePicture = String(profilePicture).trim();
    }

    // UPDATE FRUIT AVATAR
    if (avatar !== undefined) {
      if (!allowedAvatars.includes(avatar)) {
        return res.status(400).json({
          message: "Invalid avatar selection"
        });
      }

      user.avatar = avatar;
    }

    // UPDATE COUNTRY
    if (country !== undefined) {
      user.country = String(country).trim();
    }

    // UPDATE CITY
    if (city !== undefined) {
      user.city = String(city).trim();
    }

    // UPDATE BIO
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 300) {
        return res.status(400).json({
          message: "Bio cannot exceed 300 characters"
        });
      }

      user.bio = bio.trim();
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Failed to update profile"
    });
  }
});


module.exports = router;
