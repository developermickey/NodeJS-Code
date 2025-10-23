const jwt = require("jsonwebtoken");
const FoodPartner = require("../models/foodpartner.model");
const User = require("../models/user.model");

const authFoodPartner = async (req, res, next) => {
  try {
    // ✅ 1. Check for token in cookies
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Authorization denied.",
      });
    }

    // ✅ 2. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );

    // ✅ 3. Find the food partner by ID
    const foodPartner = await FoodPartner.findById(decoded.id).select(
      "-password"
    );
    if (!foodPartner) {
      return res.status(404).json({
        success: false,
        message: "Food Partner not found.",
      });
    }

    // ✅ 4. Attach to request and continue
    req.foodPartner = foodPartner;
    next();
  } catch (error) {
    console.error("Auth Error:", error);

    // ✅ 5. Handle invalid or expired token
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid token. Access denied.",
    });
  }
};

const authUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    // 🧩 Validate token presence
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please log in first.",
      });
    }

    // 🔐 Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure.",
      });
    }

    // 🧠 Find user and ensure account exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    // ✅ Attach user to request for downstream routes
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);

    return res.status(401).json({
      success: false,
      message:
        err.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid or expired token.",
    });
  }
};

module.exports = {
  authFoodPartner,
  authUser,
};
