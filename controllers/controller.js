import Recipe from "../models/recipes.js";
import Direction from "../models/directions.js";
import Ingredient from "../models/ingredients.js";
import Variation from "../models/variations.js";
import { createImage, createOptions, generateRecipe } from "../utils/utils.js";
import { Op } from "sequelize";

export const setFingerprint = (req, res) => {
  const { fingerprint } = req.body;

  console.log(fingerprint);
  if (!fingerprint) {
    return res.status(400).json({ message: "Fingerprint is required" });
  }
  res.cookie("fingerprint", fingerprint, {
    httpOnly: true,
  });
  res.send({});
};

const getCount = async (ip, fingerprint, isRecipe = false) => {
  try {
    let objects = [];
    if (isRecipe)
      objects = await Recipe.findAll({
        where: {
          [Op.or]: [{ ip }, { fingerprint }],
        },
      });
    else
      objects = await Variation.findAll({
        where: {
          [Op.or]: [{ ip }, { fingerprint }],
        },
      });
    return objects.filter((recipe) => {
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

  // const usedCount = await getCount(ip, fingerprint);
  // if (usedCount > 19 && ip !== "127.0.0.1") {
  //   return res.status(429).json({ message: "Daily usage limit exceeded" });
  // }
  const { nutrition, protein, cuisine } = req.body;
  if (!nutrition || !protein || !cuisine) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const { variations, response } = await createOptions(
      protein,
      nutrition,
      cuisine
    );
    Variation.create({
      protein,
      nutrition,
      cuisine,
      description1: variations[0].description,
      title1: variations[0].title,
      description2: variations[1].description,
      title2: variations[1].title,
      description3: variations[2].description,
      title3: variations[2].title,
      response: response,
    });

    res.send({ variations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Interval server error!" });
  }
};

const saveAllData = async (
  protein,
  nutrition,
  cuisine,
  generatedRecipe,
  response
) => {
  const { readyTime, serving, title, description } = generatedRecipe;
  const recipe = await Recipe.create({
    protein,
    nutrition,
    cuisine,
    response,
    title,
    description,
    readyTime,
    serving,
  });
  await Promise.all(
    generatedRecipe.directions.map((direction) =>
      Direction.create({
        recipe: recipe.id,
        description: direction,
      })
    )
  );
  await Promise.all(
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
};

export const createRecipe = async (req, res) => {
  const { title, description, protein, nutrition, cuisine } = req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }
  try {
    const { recipe, response } = await generateRecipe(title, description);
    saveAllData(protein, nutrition, cuisine, recipe, response);
    res.send({ protein, nutrition, cuisine, ...recipe });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Interval server error!" });
  }
};

// export const getImage = async (req, res) => {
//   const { recipeId } = req.params;
//   if (!recipeId) {
//     return res.status(400).json({ message: "Recipe id is required" });
//   }
//   try {
//     const recipe = await Recipe.findByPk(recipeId);
//     if (!recipe) {
//       return res.status(400).json({ message: "Recipe Id is not valid" });
//     }
//     if (recipe.image) {
//       return res.send(recipe.image);
//     }

//     const imageURL = await createImage(recipe.title, recipe.description);

//     recipe.image = imageURL;
//     /// have to download image
//     await recipe.save();

//     res.send(imageURL);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Interval server error!" });
//   }
// };
