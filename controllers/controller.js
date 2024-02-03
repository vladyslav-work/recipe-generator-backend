import Recipe from "../models/recipes.js";
import Direction from "../models/directions.js";
import Ingredient from "../models/ingredients.js";
import Variation from "../models/variations.js";
import { createOptions } from "../utils/utils.js";

export const createVariations = async (req, res) => {
  const { nutrition, material, cuisine } = req.body;
  console.log(req.body);
  if (!nutrition || !material || !cuisine) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const recipe = await Recipe.create({material, nutrition, cuisine})
    const options = await createOptions(material, nutrition, cuisine)
    const variations = await Promise.all(
      options.map((option) => {
        console.log('option', option);
        return Variation.create({
          recipe: recipe.id,
          description: option.description,
          title: option.title,
        });
      })
    );
    console.log('variations', variations);
    res.send(variations)
  } catch (error) {
    console.log(error);
    res.status(500).json({message : 'Interval server error!'})
  } 
};

export const createRecipe = async (req, res) => {
  const { recipeId, variationId } = req.body;
  if (!recipeId || !variationId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const recipe = await Recipe.findByPk(recipeId)
    if(recipe) {
      return res.status(400).json({message : "Recipe Id is not valid"})
    }
    const variation = await Variation.findByPk(variationId)
    if(variation) {
      return res.status(400).json({message : "Variation Id is not valid"})
    }
    const generatedRecipe = await createRecipe(material, nutrition, cuisine)
    const variations = await Promise.all(
      options.map((option) => {
        console.log('option', option);
        return Variation.create({
          recipe: recipe.id,
          description: option.description,
          title: option.title,
        });
      })
    );
    console.log('variations', variations);
    res.send(variations)
  } catch (error) {
    console.log(error);
    res.status(500).json({message : 'Interval server error!'})
  } 
};