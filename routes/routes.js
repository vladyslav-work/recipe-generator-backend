import express from "express";
import { createVariations, createRecipe } from "../controllers/controller.js";

const router = express.Router();

router.post("/", createVariations);
router.put("/", createRecipe);

export default router;
