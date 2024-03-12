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

export const generateRecipe = async (title, description) => {
  const schema = z
    .object({
      title: z.string().describe("Title of the recipe"),
      description: z.string().describe("Detailed introduction of the recipe"),
      serving: z.number().describe("Serving size of the recipe"),
      ingredients: z
        .array(
          z.object({
            quantity: z
              .string()
              .optional()
              .describe("Quantity of the ingredient"),
            name: z
              .string()
              .describe(
                "Name of the ingredient( must be the name of ingredient WITHOUT preparation method )"
              ),
            preparationMethod: z
              .string()
              .optional()
              .describe("Preparation method of the ingredient before cooking"),
          })
        )
        .describe("Ingredients of the recipe"),
      directions: z.array(z.string().describe("Instruction of the recipe")),
      readyTime: z
        .number()
        .describe("Total preparation time in minutes of the recipe"),
    })
    .describe("the recipe generated");
  const parser = StructuredOutputParser.fromZodSchema(schema);
  const formatInstructions = parser.getFormatInstructions();
  const prompt = new PromptTemplate({
    template: `
    PURPOSE:
    Create a recipe titled {title} with the following description: {description}.
    
    DESCRIPTION:
    A recipe should include a title, a newly generated and detailed description, serving size, ingredients, instructions, and total time for preparation in minutes.
    
    OUTPUT:

    Ensure that the output is in JSON format for easy parsing. Align the structure of the output with the provided JSON Schema instance, paying close attention to the keys specified in the JSON Schema.

    Keys of output : "title", "description", "serving", "ingredients","directions", "readyTime"

    Each ingredient should have the following keys: "quantity", "name", "preparationMethod"
    `,
    inputVariables: ["title", "description"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const openAIConfig = {
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.35,
    modelName: "gpt-3.5-turbo",
  };
  const model = new OpenAI(openAIConfig);
  const input = await prompt.format({ title, description });
  console.log(new Date());
  const response = await model.invoke(input);
  console.log(new Date());
  try {
    const recipe = JSON.parse(response)
    return { recipe, response };
  } catch (error) {
    console.log(error);
    return null;
  }
};

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
