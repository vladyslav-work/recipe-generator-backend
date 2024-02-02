import Dish from "../models/dishes";
import Direction from "../models/directions";
import Ingredient from "../models/ingredients";
import Variation from "../models/variations";
import { createOptions } from "../utils/utils";

export const createVariations = async (req, res) => {
  const { nutrition, material, cuisine } = req.body;
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