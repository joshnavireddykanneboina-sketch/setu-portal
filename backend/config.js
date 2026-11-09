import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  llm: {
    apiKey: process.env.LLM_API_KEY || '',
    provider: process.env.LLM_PROVIDER || 'gemini',
    model: process.env.LLM_MODEL || 'gemini-1.5-flash'
  },
  ml: {
    mode: process.env.ML_MODE || 'python',
    predictScript: path.resolve(__dirname, '../ml/src/predict.py')
  },
  jwtSecret: process.env.JWT_SECRET || 'setu_jwt_secret_default_key_2026',
  corsOrigin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || 'https://setu.jharkhand.gov.in')
    : ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173']
};
