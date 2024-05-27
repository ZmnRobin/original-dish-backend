const Recipe = require("../models/Recipe");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { displayName, photoURL, email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ displayName, photoURL, email });
      await user.save();
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const purchaseCoin = async (req, res) => {
  const { coins, cost } = req.body;

  if (!coins || !cost) {
    return res
      .status(400)
      .json({ message: "Invalid request: coins and cost are required." });
  }

  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${coins} coins`,
            },
            unit_amount: cost * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    // update database with new coins
    user.coins += coins;
    await user.save();

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Error purchasing coins:", error);
    res.status(500).json({ message: "Error purchasing coins", error });
  }
};

const countUserAndRecipe = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const recipeCount = await Recipe.countDocuments();
    const feedbackCount = userCount + recipeCount;
    res.status(200).json({ userCount, recipeCount, feedbackCount });
  } catch (error) {
    console.error("Error counting users and recipes:", error);
    res
      .status(500)
      .json({ message: "Error counting users and recipes", error });
  }
};

module.exports = {
  loginUser,
  getCurrentUser,
  purchaseCoin,
  countUserAndRecipe,
};
