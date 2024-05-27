const express = require("express");
const {
  loginUser,
  getCurrentUser,
  purchaseCoin,
  countUserAndRecipe,
} = require("../controllers/authController");
const Protected = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);
router.get("/getCounts", countUserAndRecipe);
router.get("/current-user", Protected, getCurrentUser);
router.post("/purchase-coin", Protected, purchaseCoin);

module.exports = router;
