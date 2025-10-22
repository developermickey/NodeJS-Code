const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/user/register", authController.register);
router.post("/user/login", authController.login);
router.get("/user/logout", authController.logout);

// food partner router
router.post("/foodpartner/register", authController.registerFoodPartner);
router.post("/foodpartner/login", authController.loginFoodPartner);
router.get("/foodpartner/logout", authController.logoutFoodPartner);

module.exports = router;
