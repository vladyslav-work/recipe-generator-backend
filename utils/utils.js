import { z } from "zod";
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
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

export const createOptions = async (material, nutrition, cuisine) => {
  const parser = StructuredOutputParser.fromZodSchema(
    z
      .array(
        z.object({
          title: z.string().describe("title of a variation of the recipe"),
          description: z
            .string()
            .describe("introduction of a variation of the recipe"),
        })
      )
      .describe("json array of 3 variations of a recipe")
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `generate 3 variations of a recipe that contains the following:
    Ingredient: {material}
    Food Type: {nutrition}
    Cuisine: {cuisine}
    \nA variation must consist of a title and a simple description that is shorter than 50 characters.`,
    inputVariables: ["material", "nutrition", "cuisine"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  });

  const input = await prompt.format({
    material,
    nutrition,
    cuisine,
  });
  console.log("input", input);

  const response = await model.invoke(input);

  try {
    const variations = await parser.parse(response);
    console.log(response);
    return variations;
  } catch (e) {
    console.error("Failed to parse bad output: ", e);

    const fixParser = OutputFixingParser.fromLLM(
      new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" }),
      parser
    );
    const output = await fixParser.parse(response);
    console.log("Fixed output: ", output);
    return output;
  }
};

export const createRecipe = async (title, description) => {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      title: z.string().describe("title of the recipe"),
      description: z.string().describe("detailed introduction of the recipe"),
      servingSize: z.string().describe("serving size of  the recipe"),
      ingredients: z
        .array({
          quantity: z.string().describe("quantity of the ingredient"),
          name: z.string().describe("name of the ingredient"),
          preparationMethod: z
            .string()
            .describe(
              "preparation method of the ingredient - this is optional"
            ),
        })
        .describe("ingredients of the recipe"),
      directions: z
        .array(z.string().describe("a instruction of the instructions"))
        .describe("instructions of the recipe"),
      readyTime: z.string().describe("reparation time in minutes of the recipe")
    })
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `Create a recipe titled {title} with the following description: {description}.

    A recipe should include a title, a detailed description, serving size, ingredients, instructions, and preparation time in minutes.`,
    inputVariables: ["title", "description"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  });

  const input = await prompt.format({
    title,
    description
  });
  const response = await model.invoke(input);

  try {
    const variations = await parser.parse(response);
    console.log(response);
    return variations;
  } catch (e) {
    console.error("Failed to parse bad output: ", e);

    const fixParser = OutputFixingParser.fromLLM(
      new OpenAI({ temperature: 0, modelName: "gpt-3.5-turbo" }),
      parser
    );
    const output = await fixParser.parse(response);
    console.log("Fixed output: ", output);
    return output;
  }
};
