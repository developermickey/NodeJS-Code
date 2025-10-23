const jwt = require("jsonwebtoken");
const FoodPartner = require("../models/foodpartner.model");

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

module.exports = {
  authFoodPartner,
};
