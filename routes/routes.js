import express from "express";
import { createVariations,/* getVariations, getRecipe, selectVariation, getImage,*/ setFingerprint, createRecipe } from "../controllers/controller.js";
import { hasFingerprint } from "../middleware/middleware.js";

const router = express.Router();

router.post("/", hasFingerprint,  createVariations);
// router.get("/variations/:id", getVariations);
// router.post("/select", selectVariation);
// router.get("/:recipeId", getRecipe);
// router.get("/:recipeId/image", getImage);
router.post("/fingerprint", setFingerprint)
router.post("/generate", hasFingerprint, createRecipe)

export default router;
