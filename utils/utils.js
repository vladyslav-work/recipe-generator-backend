import { z } from "zod";
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import OpenAIClient from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  StructuredOutputParser,
  OutputFixingParser,
} from "langchain/output_parsers";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// type Option = {
//   title: string;
//   description: string;
// };

export const createOptions = async (protein, nutrition, cuisine) => {
  const parser = StructuredOutputParser.fromZodSchema(
    z
      .array(
        z.object({
          title: z.string().describe("title of a variation of the recipe"),
          description: z
            .string()
            .describe("description of a variation of the recipe"),
        })
      )
      .describe("json array of 3 variations of a recipe")
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `generate 3 variations of a recipe that contains the following:
    Ingredient: {protein}
    Food Type: {nutrition}
    Cuisine: {cuisine}
    \nA variation must consist of a title and a simple description that is shorter than 50 characters.
    
    Output has to be JSON that can be parsed and don't contain '\n'`,
    inputVariables: ["protein", "nutrition", "cuisine"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  });

  const input = await prompt.format({
    protein,
    nutrition,
    cuisine,
  });


  const response = await model.invoke(input);

  try {
    const result = JSON.parse(response);
    const keys = Object.keys(result);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (result[key] && result[key].length === 3) {
        return { variations: result[key], response };
      }
    }
  } catch (e) {
    console.log(e);
    return null
  }
};

const generateIngredients = async (title, description) => {
  const prompt = new PromptTemplate({
    template: `
    PURPOSE:
    As soon as possible, Create ingredients a recipe titled {title} with the following description: {description}.
    
    DESCRIPTION:
    A recipe should include ingredients
    
    OUTPUT:
    - Output has to be JSON that can be parsed and don't contain '\n'
    - Each ingredient should be represented as a string with the quantity, name, and preparation method separated by commas.
    template : "{quantity}, {name}, {preparation method}"
    e.g. "1, onion, chopped", "2 lbs, pork shoulder, diced", "1 tsp, cumin`,
    inputVariables: ["title", "description"],
  });

  const openAIConfig = {
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  };
  const model = new OpenAI(openAIConfig);
  const input = await prompt.format({ title, description });
  console.log(new Date());
  const response = await model.invoke(input);
  console.log(new Date());
    try {
    const recipe = JSON.parse(response.replace(/```json/g, "").replace(/```/g, ""))
    return { ingredients: recipe.ingredients, response };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const generateOthers = async (title, description) => {
  const prompt = new PromptTemplate({
    template: `
    PURPOSE:
    Create a recipe titled {title} with the following description: {description}.
    
    DESCRIPTION:
    A recipe should include a title, a description( Generate more detailed ), serving size, and total time for preparation in minutes.
    
    OUTPUT:

    Output has to be JSON that can be parsed and don't contain '\n'
    Keys of output : "title", "description", "serving", "readyTime"

    `,
    inputVariables: ["title", "description"],
  });


  const openAIConfig = {
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  };
  const model = new OpenAI(openAIConfig);
  const input = await prompt.format({ title, description });
  console.log(new Date());
  const response = await model.invoke(input);
  console.log(new Date());
  try {
    const recipe = JSON.parse(response.replace(/```json/g, "").replace(/```/g, ""))
    return { recipe, response };
  } catch (error) {
    console.log(error);
    return null;
  }
};


const generateDirections = async (title, description) => {
  const prompt = new PromptTemplate({
    template: `
    PURPOSE:
    Create directions of a recipe titled {title} with the following description: {description}.
    
    DESCRIPTION:
    A recipe should include directions
    
    OUTPUT:

    Output has to be JSON that can be parsed and don't contain '\n'
    `,
    inputVariables: ["title", "description"],
  });

  const openAIConfig = {
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  };
  const model = new OpenAI(openAIConfig);
  const input = await prompt.format({ title, description });
  console.log(new Date());
  const response = await model.invoke(input);
  console.log(new Date());
  try {
    const recipe = JSON.parse(response.replace(/```json/g, "").replace(/```/g, ""))
    return { directions: recipe.directions, response };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const generateRecipe = async (title, description) => {
  const responses = await Promise.all([generateOthers(title, description), generateIngredients(title, description), generateDirections(title, description)])
  return {recipe: {
    title: responses[0].recipe.title,
    description: responses[0].recipe.description,
    serving: responses[0].recipe.serving,
    readyTime: responses[0].recipe.readyTime,
    ingredients: responses[1].ingredients,
    directions: responses[2].directions,
  }, response : responses.map(r => r.response).join("\n")}
}


export const createImage = async (title, description) => {
  const prompt = `
  I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS:

  Please create an image of ${title}

  Description of the dish: ${description}

  Don't contain images of ingredients and any text.
  `;

  try {
    const openaiClient = new OpenAIClient({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await openaiClient.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
    const image_b64 = response.data[0].b64_json;

    const base64Data = image_b64.replace(/^data:image\/png;base64,/, ""); // Remove the data URL prefix

    const imageName = `${Date.now()}.png`;

    // Directory where the image will be saved
    const __filename = fileURLToPath(import.meta.url);

    // 👇️ "/home/john/Desktop/javascript"
    const __dirname = path.dirname(__filename);
    const dirPath = path.join(__dirname, "../public/api/images");
    const imagePath = path.resolve(
      __dirname,
      `../public/api/images/${imageName}`
    );

    // Make sure the directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(imagePath, base64Data, "base64");
    return `/api/images/${imageName}`;
  } catch (err) {
    console.log(err);
    return null;
  }
};
