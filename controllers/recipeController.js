const Recipe = require("../models/Recipe");
const User = require("../models/User");

const addRecipe = async (req, res) => {
  const {
    name,
    image,
    details,
    youtubeVideoCode,
    country,
    category,
    creatorEmail,
  } = req.body;
  try {
    const newRecipe = new Recipe({
      name,
      image,
      details,
      youtubeVideoCode,
      country,
      category,
      creatorEmail,
    });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ message: "Error adding recipe", error });
  }
};

const getRecipes = async (req, res) => {
  try {
    // Destructure query parameters
    const { search, category, country, page = 1, limit = 10 } = req.query;

    // Initialize query object
    let query = {};

    // Search by recipe name
    if (search) {
      query.name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by country
    if (country) {
      query.country = country;
    }

    // Calculate the skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch recipes with applied filters, search, and pagination
    const recipes = await Recipe.find(
      query,
      "name image purchased_by creatorEmail country category watchCount reactions"
    )
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    // Get total count of documents matching the query
    const total = await Recipe.countDocuments(query);

    // Send response with recipes and total count
    res.status(200).json({ total, recipes });
  } catch (error) {
    res.status(400).json({ message: "Error fetching recipes", error });
  }
};

const viewRecipe = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;
  try {
    const recipe = await Recipe.findById(id);
    const user = await User.findOne({ email: req.user.email });

    if (!recipe || !user) {
      return res.status(404).json({ message: "Recipe or User not found" });
    }

    if (recipe.creatorEmail === user.email) {
      // If the user is the owner, just return the recipe
      return res.status(200).json(recipe);
    }

    if (!recipe.purchased_by.includes(user.email)) {
      if (user.coins < 10) {
        return res.status(400).json({ message: "Insufficient coins" });
      }

      // Deduct 10 coins from the viewer
      user.coins -= 10;

      // Add viewer to the purchased_by list
      recipe.purchased_by.push(user.email);

      // Give 1 coin to the owner
      const owner = await User.findOne({ email: recipe.creatorEmail });
      if (owner) {
        owner.coins += 1;
        await owner.save();
      }

      // Update watch count
      recipe.watchCount += 1;

      await user.save();
      await recipe.save();
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const toggleReaction = async (req, res) => {
  const { id } = req.params;
  const { user, type } = req.body;

  try {
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const reactionIndex = recipe.reactions.findIndex(
      (reaction) => reaction.user === user
    );

    if (reactionIndex === -1) {
      recipe.reactions.push({ user, type });
    } else {
      recipe.reactions.splice(reactionIndex, 1);
    }

    await recipe.save();
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error toggling reaction:", error);
    res.status(500).json({ error: error.message });
  }
};

const getSuggestions = async (req, res) => {
  const { category, country } = req.query;
  let filter = {};
  if (category) filter.category = category;
  if (country) filter.country = country;

  try {
    const recipes = await Recipe.find(filter)
      .select(
        "name image purchased_by creatorEmail country category watchCount reactions"
      )
      .limit(3)
      .sort("-watchCount");
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const recipeViewPermission = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.uid;
  try {
    const recipe = await Recipe.findById(id);
    const user = await User.findOne({ email: req.user.email });

    if (!recipe || !user) {
      return res.status(404).json({ message: "Recipe or User not found" });
    }

    if (recipe.creatorEmail === user.email) {
      // If the user is the owner, just return true to indicate that the user can view the recipe
      return res.status(200).json({ canView: true });
    }

    if (recipe.purchased_by.includes(user.email)) {
      return res.status(200).json({ canView: true });
    }

    res.status(200).json({ canView: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addRecipe,
  getRecipes,
  viewRecipe,
  toggleReaction,
  getSuggestions,
  recipeViewPermission,
};
