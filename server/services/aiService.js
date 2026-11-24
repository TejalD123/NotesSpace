const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenAI, ThinkingLevel } = require('@google/genai');
const {
  SYSTEM_PROMPT,
  buildTopicPrompt,
  buildUrlPrompt,
  buildImagePrompt,
} = require('./promptBuilder');

// ---------- Provider select ----------
// .env: AI_PROVIDER=gemini | claude
// (set nasel tar: GEMINI_API_KEY asla tar gemini, nahi tar claude)
const provider = () =>
  (process.env.AI_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'claude')).toLowerCase();

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// ---------- Claude ----------
let claude;
const getClaude = () => {
  if (!claude) {
    if (!process.env.ANTHROPIC_API_KEY) throw httpError(500, 'ANTHROPIC_API_KEY is missing in .env');
    claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return claude;
};

const callClaude = async ({ prompt, image }) => {
  const content = image
    ? [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.mimeType,
            data: image.buffer.toString('base64'),
          },
        },
        { type: 'text', text: prompt },
      ]
    : prompt;

  const response = await getClaude().messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  });

  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
};

// ---------- Gemini ----------
let gemini;
const getGemini = () => {
  if (!gemini) {
    if (!process.env.GEMINI_API_KEY) throw httpError(500, 'GEMINI_API_KEY is missing in .env');
    gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return gemini;
};

const geminiModel = () => process.env.GEMINI_MODEL || 'gemini-3.6-flash';
// 503 (busy) aala tar ha backup model vaparto. Disable karayla .env madhe GEMINI_FALLBACK_MODEL= (rikama) thev.
const geminiFallback = () => process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-3.5-flash-lite';
const retryDelayMs = () => Number(process.env.GEMINI_RETRY_MS) || 2000;
const timeoutMs = () => Number(process.env.GEMINI_TIMEOUT_MS) || 70000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isBusy = (e) => e.status === 503;

const mapGeminiError = (e, model) => {
  const status = e.status || e.code;
  const msg = String(e.message || '');
  if (status === 503)
    return httpError(
      503,
      'Gemini is very busy right now (high demand on Google\'s side). Please try again in a minute.'
    );
  if (status === 429)
    return httpError(
      429,
      'Gemini free limit reached. Wait a minute and try again, or set a different GEMINI_MODEL in .env.'
    );
  if (status === 401 || status === 403 || /API key not valid|API_KEY_INVALID/i.test(msg))
    return httpError(500, 'Gemini API key is invalid or not allowed. Check GEMINI_API_KEY in .env.');
  if (status === 404)
    return httpError(500, `Gemini model "${model}" was not found. Check GEMINI_MODEL in .env.`);
  if (e.name === 'AbortError' || /timed? ?out|timeout|aborted/i.test(msg))
    return httpError(504, 'Gemini took too long to respond. Try again, or choose "Quick summary".');
  return httpError(502, `Gemini request failed: ${msg.slice(0, 200)}`);
};

// Ek model var call; 503 aala tar thamba ani parat try (2s, 4s...)
const runGemini = async (ai, model, parts, retries) => {
  const config = {
    systemInstruction: SYSTEM_PROMPT,
    maxOutputTokens: 12000,
    httpOptions: { timeout: timeoutMs() },
  };
  // thinkingLevel fakt Gemini 3 models sathi (2.5 madhe he support nahi)
  if (/^gemini-3/.test(model)) {
    config.thinkingConfig = { thinkingLevel: process.env.GEMINI_THINKING || 'low' };
  }

  for (let attempt = 0; ; attempt++) {
    try {
      return await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config,
      });
    } catch (e) {
      if (isBusy(e) && attempt < retries) {
        console.warn(`[gemini] ${model} busy (503), retry ${attempt + 1}/${retries}`);
        await sleep(retryDelayMs() * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
};

const callGemini = async ({ prompt, image }) => {
  const ai = getGemini();

  const parts = [{ text: prompt }];
  if (image) {
    parts.unshift({
      inlineData: { mimeType: image.mimeType, data: image.buffer.toString('base64') },
    });
  }

  const primary = geminiModel();
  const fallback = geminiFallback();

  let response;
  try {
    response = await runGemini(ai, primary, parts, 2);
  } catch (e) {
    if (isBusy(e) && fallback && fallback !== primary) {
      console.warn(`[gemini] ${primary} still busy, trying ${fallback}`);
      try {
        response = await runGemini(ai, fallback, parts, 1);
      } catch (e2) {
        throw mapGeminiError(e2, fallback);
      }
    } else {
      throw mapGeminiError(e, primary);
    }
  }
  return (response.text || '').trim();
};

// ---------- Common ----------
const generate = async (input) => {
  const text = provider() === 'gemini' ? await callGemini(input) : await callClaude(input);
  if (!text) throw httpError(502, 'AI returned empty notes. Try again or change the input.');
  return text;
};

const generateFromTopic = (topic, depth) => generate({ prompt: buildTopicPrompt(topic, depth) });

const generateFromUrl = (url, pageText, depth) =>
  generate({ prompt: buildUrlPrompt(url, pageText, depth) });

const generateFromImage = (buffer, mimeType, depth) =>
  generate({ prompt: buildImagePrompt(depth), image: { buffer, mimeType } });

// Markdown chya pahilya "# Title" line pasun title kadhto
const extractTitle = (markdown, fallback = 'Untitled Notes') => {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim().slice(0, 150) : fallback;
};

module.exports = { generateFromTopic, generateFromUrl, generateFromImage, extractTitle };