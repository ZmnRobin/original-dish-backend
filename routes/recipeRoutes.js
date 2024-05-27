const express = require("express");
const Protected = require("../middlewares/authMiddleware");
const {
  addRecipe,
  getRecipes,
  viewRecipe,
  toggleReaction,
  getSuggestions,
  recipeViewPermission,
} = require("../controllers/recipeController");

const router = express.Router();

router.post("/", Protected, addRecipe);
router.get("/", getRecipes);
router.post("/:id/view", Protected, viewRecipe);
router.post("/:id/reaction", Protected, toggleReaction);
router.get("/suggestedRecipe", Protected, getSuggestions);
router.get("/recipeViewPermission/:id", Protected, recipeViewPermission);

module.exports = router;
