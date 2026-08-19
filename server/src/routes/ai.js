import { Router } from 'express';
import { answerQuestion } from '../services/aiService.js';

export const aiRouter = Router();

// Ask Ravi AI
aiRouter.post('/ask', async (req, res) => {
  try {
    const { query, history = [] } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query string is required' });
    }

    const result = await answerQuestion(query.trim(), history);
    res.json({
      success: true,
      answer: result.answer,
      citations: result.citations || []
    });
  } catch (err) {
    console.error('AI Query Error:', err);
    res.status(500).json({
      success: false,
      answer: "I encountered a technical issue retrieving that information. Please try again shortly.",
      citations: []
    });
  }
});

// Prompt Suggestions
aiRouter.get('/suggestions', (req, res) => {
  const suggestions = [
    "Who is Ravi Prakash?",
    "What cybersecurity topics has Ravi studied?",
    "What programming languages does Ravi know?",
    "What projects has Ravi built?",
    "What certifications does Ravi have?",
    "What are Ravi's current learning goals?",
    "Where can I find Ravi's notes on Nmap & SQLi?",
    "How can I contact Ravi?"
  ];
  res.json({ success: true, suggestions });
});
