import Recipe from "../models/recipes.js";
import Direction from "../models/directions.js";
import Ingredient from "../models/ingredients.js";
import Variation from "../models/variations.js";
import { createImage, createOptions, generateRecipe } from "../utils/utils.js";
import Response from "../models/responses.js";
import { Op } from "sequelize";

export const setFingerprint = (req, res) => {
  const { fingerprint } = req.body;

  console.log(fingerprint);
  if (!fingerprint) {
    return res.status(400).json({ message: "Fingerprint is required" });
  }
  res.cookie("fingerprint", fingerprint, {
    httpOnly: true
  });
  res.send({});
};

const getCount = async (ip, fingerprint) => {
  try {
    const recipes = await Recipe.findAll({
      where: {
        [Op.or]: [{ ip }, { fingerprint }],
      },
    });
    return recipes.filter((recipe) => {
      const createdTime = new Date(recipe.createdAt);
      const today = new Date();
      return (
        createdTime.getFullYear() === today.getFullYear() &&
        createdTime.getMonth() === today.getMonth() &&
        createdTime.getDate() === today.getDate()
      );
    }).length;
  } catch (error) {
    console.log(error);
    return 100;
  }
};

export const createVariations = async (req, res) => {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  ip = ip.split(",")[0];
  ip = ip.includes("::ffff:") ? ip.split("::ffff:")[1] : ip;


  const fingerprint = req.fingerprint;


  const usedCount = await getCount(ip, fingerprint);
  if (usedCount > 19 && ip !== "127.0.0.1") {
    return res.status(429).json({ message: "Daily usage limit exceeded" });
  }
  const { nutrition, protein, cuisine } = req.body;
  if (!nutrition || !protein || !cuisine) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const recipe = await Recipe.create({ protein, nutrition, cuisine, ip, fingerprint });
    const { variations: options, response } = await createOptions(
      protein,
      nutrition,
      cuisine
    );
    const variations = await Promise.all(
      options.map((option) => {
        return Variation.create({
          recipe: recipe.id,
          description: option.description,
          title: option.title,
        });
      })
    );
    const responseObj = await Response.findOne({
      where: { recipe: recipe.id },
    });
    if (responseObj) {
      await Response.update(
        { variations: response },
        { where: { id: responseObj.id } }
      );
    } else
      await Response.create({
        recipe: recipe.id,
        variations: response,
      });

    res.send({ recipeId: recipe.id, variations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Interval server error!" });
  }
};

export const getVariations = async (req, res) => {
  const { id } = req.params;
  try {
    const variations = await Variation.findAll({ where: { recipe: id } });
    if (variations.length === 0)
      return res.status(404).send({ message: "There is no variations." });
    res.send(variations);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error." });
  }
};

export const selectVariation = async (req, res) => {
  const { recipeId, variationId } = req.body;
  try {
    const variation = await Variation.findByPk(variationId);
    if (!variation)
      return res.status(404).send({ message: "There is no variation." });
    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe)
      return res.status(404).send({ message: "There is no recipe." });
    if (recipe.image)
      return res.status(404).send({ message: "A recipe was already created" });
    recipe.title = variation.title;
    recipe.description = variation.description;
    await recipe.save();
    res.json({});
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error." });
  }
};

export const getRecipe = async (req, res) => {
  const { recipeId } = req.params;
  if (!recipeId) {
    return res.status(400).json({ message: "Recipe id is required" });
  }
  try {
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(400).json({ message: "Recipe Id is not valid" });
    }
    if (recipe.image) {
      const ingredients = await Ingredient.findAll({
        where: {
          recipe: recipeId,
        },
      });
      const directions = await Direction.findAll({
        where: {
          recipe: recipeId,
        },
      });
      const completedRecipe = {
        recipe,
        ingredients,
        directions,
      };

      return res.send(completedRecipe);
    }

    const { recipe: generatedRecipe, response } = await generateRecipe(
      recipe.title,
      recipe.description
    );
    const responseObj = await Response.findOne({
      where: { recipe: recipeId },
    });
    if (responseObj) {
      await Response.update(
        { main: response },
        { where: { id: responseObj.id } }
      );
    } else
      await Response.create({
        recipe: recipeId,
        main: response,
      });
    recipe.title = generatedRecipe.title;
    recipe.description = generatedRecipe.description;
    recipe.serving = generatedRecipe.serving;
    recipe.readyTime = generatedRecipe.readyTime;
    await Direction.destroy({ where: { recipe: recipeId } });
    await Ingredient.destroy({ where: { recipe: recipeId } });
    const directions = await Promise.all(
      generatedRecipe.directions.map((direction) =>
        Direction.create({
          recipe: recipe.id,
          description: direction,
        })
      )
    );

    const ingredients = await Promise.all(
      generatedRecipe.ingredients.map((ingredient) => {
        const newIngredient = `${
          ingredient.quantity && ingredient.quantity.toLowerCase() !== "none"
            ? ingredient.quantity
            : ""
        } <strong>${ingredient.name}</strong> <em>${
          ingredient.preparationMethod &&
          ingredient.preparationMethod.toLowerCase() !== "none"
            ? ingredient.preparationMethod
            : ""
        }</em>`;
        return Ingredient.create({
          recipe: recipe.id,
          description: newIngredient,
        });
      })
    );
    /// have to download image
    await recipe.save();
    const completedRecipe = {
      recipe,
      ingredients,
      directions,
    };

    res.send(completedRecipe);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Interval server error!" });
  }
};

export const getImage = async (req, res) => {
  const { recipeId } = req.params;
  if (!recipeId) {
    return res.status(400).json({ message: "Recipe id is required" });
  }
  try {
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(400).json({ message: "Recipe Id is not valid" });
    }
    if (recipe.image) {
      return res.send(recipe.image);
    }

    const imageURL = await createImage(
      recipe.title,
      recipe.description
    );

    recipe.image = imageURL;
    /// have to download image
    await recipe.save();

    res.send(imageURL);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Interval server error!" });
  }
};
