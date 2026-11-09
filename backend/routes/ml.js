// Machine Learning & AI Inference Routes for SETU Platform
// Exposes endpoints for:
// - Thematic Domain Classification & Urgency Prediction
// - Semantic Duplicate Detection
// - Intelligent Multi-Factor HEI Routing Engine
// - Generative AI Problem Structuring, Summaries & Research Directions

import express from 'express';
import { classifySocietalChallenge } from '../services/ml/mlClient.js';
import { detectDuplicateChallenges } from '../services/ml/duplicateDetection.js';
import { routeChallenge } from '../services/routing/routingEngine.js';
import {
  structureCitizenProblem,
  generateClarificationQuestions,
  suggestResearchDirections,
  explainClassification
} from '../services/llm/geminiService.js';

const router = express.Router();

/**
 * POST /api/ml/classify
 * Analyzes societal challenge text using Scikit-Learn TF-IDF Logistic Regression pipeline
 * Returns: primaryDomain, confidenceScore, probabilityDistribution, urgencyLevel, urgencyReason, humanVerificationRequired
 */
router.post('/classify', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text field is required for classification' });
  }

  try {
    const result = await classifySocietalChallenge(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'ML classification failed', details: err.message });
  }
});

/**
 * POST /api/ml/detect-duplicates
 * Computes semantic cosine similarity against existing database challenges
 */
router.post('/detect-duplicates', async (req, res) => {
  const { query, threshold } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'query text is required for duplicate detection' });
  }

  try {
    const result = await detectDuplicateChallenges(query, { threshold: threshold ? Number(threshold) : 0.35 });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Duplicate detection failed', details: err.message });
  }
});

/**
 * POST /api/ml/route-hei
 * Matches a challenge to the best university using 100-point multi-factor scoring
 */
router.post('/route-hei', (req, res) => {
  const { domain, district, urgency, beneficiaries, description } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'domain is required for HEI routing' });
  }

  try {
    const result = routeChallenge({
      domain,
      district,
      urgency: urgency || 'GREEN',
      beneficiaries: beneficiaries ? Number(beneficiaries) : 5000,
      description: description || ''
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'HEI routing failed', details: err.message });
  }
});

/**
 * POST /api/ml/structure-problem
 * Uses Generative AI / Deterministic NLP to turn unstructured citizen text into a formal problem statement
 */
router.post('/structure-problem', async (req, res) => {
  const { text, district, metadata } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required to structure problem' });
  }

  try {
    const result = await structureCitizenProblem({ text, district, metadata });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Problem structuring failed', details: err.message });
  }
});

/**
 * POST /api/ml/clarification-questions
 * Generates focused clarification questions to gather missing technical and geospatial details
 */
router.post('/clarification-questions', async (req, res) => {
  const { text, domain, district } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'text is required for clarification generation' });
  }

  try {
    const result = await generateClarificationQuestions({ text, domain, district });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Clarification generation failed', details: err.message });
  }
});

/**
 * POST /api/ml/suggest-research
 * Generates actionable research directions, prototypes, and field methodologies for university teams
 */
router.post('/suggest-research', async (req, res) => {
  const { domain, description } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'domain is required for research suggestions' });
  }

  try {
    const result = await suggestResearchDirections({ domain, description: description || '' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Research suggestion failed', details: err.message });
  }
});

/**
 * POST /api/ml/explain
 * Explains domain and urgency classification in accessible plain language
 */
router.post('/explain', async (req, res) => {
  const { text, domain, urgency, confidence } = req.body;
  try {
    const result = await explainClassification({
      text: text || '',
      domain: domain || 'General',
      urgency: urgency || 'GREEN',
      confidence: confidence || 0.8
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Classification explainability failed', details: err.message });
  }
});

export default router;
