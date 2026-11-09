// Safety Routes for SETU Platform
import express from 'express';
import { evaluateSafety } from '../services/safety/safetyService.js';

const router = express.Router();

// POST /api/safety/check
router.post('/check', (req, res) => {
  const { message } = req.body;
  const result = evaluateSafety(message);
  res.json(result);
});

export default router;
