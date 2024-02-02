import express from 'express';
import {createVariations} from '../controllers/dishes.js';

const router = express.Router();

router.post('/', createVariations);

export default router;
