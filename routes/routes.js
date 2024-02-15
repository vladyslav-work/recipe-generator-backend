import express from "express";
import { createVariations, getVariations, getRecipe, selectVariation } from "../controllers/controller.js";

const router = express.Router();

router.post("/", createVariations);
router.get("/variations/:id", getVariations);
router.post("/select", selectVariation)
router.get("/:recipeId", getRecipe);

export default router;
