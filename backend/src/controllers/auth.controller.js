const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // ✅ Validate input
    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // ✅ Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create new user
    const newUser = await User.create({
      fullname: fullname.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // expires in 7 days
    );

    // ✅ Set cookie with secure options
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // ✅ 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ✅ 3. Compare password (fix: use bcrypt.compare, not campare)
    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ✅ 4. Generate JWT (fix: use existingUser, not newUser)
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ 5. Set cookie with security settings
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ 6. Send response
    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: existingUser._id,
        fullname: existingUser.fullname,
        email: existingUser.email,
      },
      token, // Optional: you can include token if you also support client-side storage
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

module.exports = { register, login };
