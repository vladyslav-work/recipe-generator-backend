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
            .describe("description of a variation of the recipe"),
        })
      )
      .describe("json array of 3 variations of a recipe")
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `generate 3 variations of a recipe that contains the following:
    Ingredient: {material}
    Food Type: {nutrition}
    Cuisine: {cuisine}`,
    inputVariables: ["material", "nutrition", "cuisine"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const model = new OpenAI({openAIApiKey:process.env.OPENAI_API_KEY, temperature: 0.5, modelName: "gpt-3.5-turbo" });

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