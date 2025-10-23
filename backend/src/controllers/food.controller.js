const Food = require("../models/food.model");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");

const createFood = async (req, res) => {
  try {
    // Validate required fields
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required",
      });
    }

    // Validate food partner authentication
    if (!req.foodPartner?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Food partner authentication required",
      });
    }

    // Upload file with better naming
    const fileName = `${req.foodPartner._id}_${uuid()}_${Date.now()}`;
    const fileUploadResult = await storageService.uploadFile(
      req.file.buffer,
      fileName
    );

    // Create food item
    const foodItem = await Food.create({
      name: name.trim(),
      description: description.trim(),
      video: fileUploadResult.url,
      foodPartner: req.foodPartner._id,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Food item created successfully",
      data: {
        id: foodItem._id,
        name: foodItem.name,
        description: foodItem.description,
        video: foodItem.video,
        foodPartner: foodItem.foodPartner,
      },
    });
  } catch (error) {
    // Handle specific errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Food item already exists",
      });
    }

    // Log error for debugging
    console.error("Error creating food item:", error);

    // Generic error response
    return res.status(500).json({
      success: false,
      message: "Failed to create food item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getFoodItems = async (req, res) => {
  try {
    // 🧠 Fetch all food items, optionally sorted by latest first
    const foodItems = await Food.find().sort({ createdAt: -1 }).lean();

    if (!foodItems || foodItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No food items found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Food items fetched successfully.",
      total: foodItems.length,
      foodItems,
    });
  } catch (error) {
    console.error("Error fetching food items:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching food items.",
    });
  }
};

module.exports = { createFood, getFoodItems };
