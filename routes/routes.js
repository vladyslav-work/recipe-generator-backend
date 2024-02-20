import express from "express";
import { createVariations, getVariations, getRecipe, selectVariation, setFingerprint } from "../controllers/controller.js";
import { hasFingerprint } from "../middleware/middleware.js";

const router = express.Router();

router.post("/", hasFingerprint, createVariations);
router.get("/variations/:id", hasFingerprint, getVariations);
router.post("/select", hasFingerprint, selectVariation);
router.get("/:recipeId", hasFingerprint, getRecipe);
router.post("/fingerprint", setFingerprint)

export default router;
