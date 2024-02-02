import express from 'express';
import {createDishes} from '../controllers/dishes.js';

const router = express.Router();

router.post('/', createVariations);

export default router;
