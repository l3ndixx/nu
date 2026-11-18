import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set it in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/tutor', async (req, res) => {
    try {
      const {
        mode,
        question,
        selectedOptionIndex,
        language = 'en',
        userMessage,
        history = [],
      } = req.body as {
        mode: 'hint' | 'wrong_options' | 'explain_mistake' | 'chat';
        question?: {
          id: string;
          section: string;
          subtopic: string;
          prompt: string;
          options: string[];
          correctIndex: number;
          explanation: string;
        };
        selectedOptionIndex?: number | null;
        language?: 'en' | 'ru' | 'kk';
        userMessage?: string;
        history?: Array<{ role: 'user' | 'assistant'; text: string }>;
      };

      const ai = getGeminiClient();

      const languageInstruction =
        language === 'ru'
          ? 'Keep the problem logic and English terminology visible, but whenever complex English logical or mathematical terms appear (e.g., necessary assumption, sufficient condition, correlation vs causation, discriminant, mutually exclusive, converse), provide clear translations and concise explanations in Russian (Русский язык) alongside the English term.'
          : language === 'kk'
            ? 'Keep the problem logic and English terminology visible, but whenever complex English logical or mathematical terms appear (e.g., necessary assumption, sufficient condition, correlation vs causation, discriminant, mutually exclusive, converse), provide clear translations and concise explanations in Kazakh (Қазақ тілі) alongside the English term.'
            : 'Respond in clear, concise academic English suited for a high school student preparing for NUET.';

      const systemInstruction = `You are an expert Nazarbayev University Entrance Test (NUET) tutor specializing in Mathematics (no calculator) and Critical Thinking & Problem Solving (Cambridge TSA style).
Your tone is encouraging, precise, and structured like a top academic mentor.
${languageInstruction}
Use clean markdown formatting with short paragraphs, bullet points, and clear step-by-step math or logical reasoning. Keep responses focused and under 280 words unless the student explicitly asks for a deep dive.`;

      let promptText = '';
      const optionLetters = ['A', 'B', 'C', 'D', 'E'];

      if (question) {
        const formattedOptions = question.options
          .map((opt, idx) => `${optionLetters[idx]}) ${opt}`)
          .join('\n');

        const studentChoice =
          typeof selectedOptionIndex === 'number' && selectedOptionIndex >= 0
            ? `${optionLetters[selectedOptionIndex]}) ${question.options[selectedOptionIndex]}`
            : 'Not answered yet';

        const questionContext = `Section: ${question.section}
Subtopic: ${question.subtopic}
Question:
${question.prompt}

Options:
${formattedOptions}

Correct Answer: ${optionLetters[question.correctIndex]}) ${question.options[question.correctIndex]}
Student's Selected Answer: ${studentChoice}
Official Solution Reference: ${question.explanation}`;

        if (mode === 'hint') {
          promptText = `${questionContext}

Task: Provide a Socratic hint to guide the student toward solving this problem on their own WITHOUT revealing the final letter or giving away the full calculation/answer. Ask 1–2 probing guiding questions or point out the exact first step / key logical distinction they should examine.`;
        } else if (mode === 'wrong_options') {
          promptText = `${questionContext}

Task: Explain specifically why each of the four incorrect options is wrong, and briefly confirm why the correct option (${optionLetters[question.correctIndex]}) holds. Label each option A–E clearly.`;
        } else if (mode === 'explain_mistake') {
          promptText = `${questionContext}

Task: The student selected ${studentChoice}, which is incorrect. Diagnose the likely reasoning trap or calculation slip that leads to ${studentChoice}, explain clearly why it fails, and walk them step-by-step to the correct answer (${optionLetters[question.correctIndex]}).`;
        } else {
          const priorHistory = history
            .slice(-6)
            .map((h) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`)
            .join('\n\n');
          promptText = `${questionContext}

${priorHistory ? `Previous conversation:\n${priorHistory}\n\n` : ''}Student's question: ${userMessage || 'Can you explain this question further?'}`;
        }
      } else {
        const priorHistory = history
          .slice(-6)
          .map((h) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`)
          .join('\n\n');
        promptText = `${priorHistory ? `Previous conversation:\n${priorHistory}\n\n` : ''}Student's NUET preparation question: ${userMessage || 'How should I prepare for NUET?'}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptText,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
        return;
      }

      res.json({ reply });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate AI tutor response.';
      console.error('Gemini API error:', error);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NUET Prep AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
