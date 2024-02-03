import Dish from "../models/dishes.js";
import Direction from "../models/directions.js";
import Ingredient from "../models/ingredients.js";
import Variation from "../models/variations.js";
import { createOptions } from "../utils/utils.js";

export const createVariations = async (req, res) => {
  const { nutrition, material, cuisine } = req.body;
  console.log(req.body);
  if (!nutrition || !material || !cuisine) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const dish = await new Dish({material, nutrition, cuisine}).save()
    const options = await createOptions(material, nutrition, cuisine)
    const variations = Promise.all(options.map((option) => {
      const variation = new Variation({
        dish: dish.id,
        description: option.description,
        title: option.title,
      });

      return variation.save();
    }));
    res.send(variations)
  } catch (error) {
    console.log(error);
    res.status(500).json({message : 'Interval server error!'})
  } 
};