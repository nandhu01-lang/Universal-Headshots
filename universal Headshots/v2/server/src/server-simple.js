import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API check
app.get('/api', (req, res) => {
  res.json({ message: 'Universal Headshots API', version: '2.0.0' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Universal Headshots running on port ${PORT}`);
});
