import Recipe from "../models/recipes.js";
import Direction from "../models/directions.js";
import Ingredient from "../models/ingredients.js";
import Variation from "../models/variations.js";
import axios from "axios";
import { createImage, createOptions, generateRecipe } from "../utils/utils.js";

export const createVariations = async (req, res) => {
  const { nutrition, protein, cuisine } = req.body;
  console.log(req.body);
  if (!nutrition || !protein || !cuisine) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const recipe = await Recipe.create({ protein, nutrition, cuisine });
    const options = await createOptions(protein, nutrition, cuisine);
    const variations = await Promise.all(
      options.map((option) => {
        console.log("option", option);
        return Variation.create({
          recipe: recipe.id,
          description: option.description,
          title: option.title,
        });
      })
    );
    res.send({ recipeId: recipe.id, variations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Interval server error!" });
  }
};

export const getVariations = async (req, res) => {
  const { id } = req.params;
  console.log("id================>", id);
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
    recipe.title = variation.title;
    recipe.description = variation.description;
    await recipe.save()
    res.json({});
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error." });
  }
};

export const getRecipe = async (req, res) => {
  console.log(req.body);
  const { recipeId } = req.params;
  if (!recipeId) {
    return res.status(400).json({ message: "Recipe id is required" });
  }
  try {
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(400).json({ message: "Recipe Id is not valid" });
    }
    if(recipe.image) {
      const ingredients = await Ingredient.findAll({where :{
        recipe: recipeId
      }})
      const directions = await Direction.findAll({where :{
        recipe: recipeId
      }})
      const completedRecipe = {
        recipe,
        ingredients,
        directions,
      };
  
      return res.send(completedRecipe);
    }
    const generatedRecipe = await generateRecipe(
      recipe.title,
      recipe.description
    );
    console.log(generatedRecipe);
    recipe.title = generatedRecipe.title;
    recipe.description = generatedRecipe.description;
    recipe.serving = generatedRecipe.serving;
    recipe.readyTime = generatedRecipe.readyTime;
    await Direction.destroy({ where: { recipe: recipeId } });
    await Ingredient.destroy({ where: { recipe: recipeId } });
    const directions = await Promise.all(
      generatedRecipe.directions.map((direction) =>
        Direction.create({
          recipeId: recipe.id,
          description: direction,
        })
      )
    );

    const ingredients = await Promise.all(
      generatedRecipe.ingredients.map((ingredient) => {
        const newIngredient = `${ingredient.quantity} <strong>${ingredient.name}</strong> <em>${ingredient.preparationMethod}</em>`;
        return Ingredient.create({
          recipe: recipe.id,
          description: newIngredient,
        });
      })
    );
    const imageURL = await createImage(
      recipe.title,
      recipe.description,
      generatedRecipe.directions,
      generatedRecipe.ingredients.map((ingredient) =>
        Object.values(ingredient).join(" ")
      )
    );


    recipe.image = imageURL;
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
