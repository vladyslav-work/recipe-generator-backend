import express from 'express';
import {getInformation, getStatus, createSession, openSession, finishSession, restartSession, deleteSessions} from '../controllers/interviews.js';

const router = express.Router();

router.post('/', createDish);
router.get('/:interviewId/status', getStatus);
router.get('/:interviewId', getInformation)
router.post('/create', createSession);
router.post('/open', openSession);
router.post('/finish', finishSession);
router.post('/restart', restartSession);
router.delete('/:ids', deleteSessions);

export default router;
