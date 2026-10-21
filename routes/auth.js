
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

router.post("/login", async (req, res) => {  
  //return res.status(200).json({ message: "Login route is working!" });
  const { email, password } = req.body;
  try {
    // Validate required fields.
    if (
      typeof email !== "string" ||
      typeof password !== "string"
      
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Unable to process login request. Please try again.",
    });
  }
  const normalizedEmailForValidate = email.trim().toLowerCase();
  try {
    const existingsVal = await User.findOne({
      email: normalizedEmailForValidate,
    });

    if (await bcrypt.compare(password, existingsVal.password))
      res.status(200).json({message:"Login is validate"});
    else {
      res.status(401).json({ message: "Password is not correct" });
    }
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json({
      error: err.message
    });
  }
  
});

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields.
    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "First name, last name, email, and password are required.",
      });
    }

    const normalizedName = `${firstName.trim()} ${lastName.trim()}`;
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length > 100) {
      return res.status(400).json({
        message: "Name must be 100 characters or fewer.",
      });
    }

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and at most 72 bytes.",
      });
    }

    // Check whether the email is already registered.
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Hash the password before saving it.
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstname: firstName.trim(),
      lastname: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Never return the password or password hash.
    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // The unique index also protects against concurrent registrations.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Unable to create account. Please try again.",
    });
  }
});

module.exports = router;
