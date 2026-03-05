import express from 'express';
import fetch from 'node-fetch';
import { Product } from '../models/index.js'; // 메뉴 정보를 불러올 때 사용
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const normalizeName = (value = '') =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const tokenize = (value = '') =>
  value.toLowerCase().match(/[a-z0-9]+/g) || [];

function extractJsonArray(text = '') {
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return cleaned.slice(firstBracket, lastBracket + 1);
  }
  return '[]';
}

function extractJsonObject(text = '') {
  const cleaned = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  return '{}';
}

const shortenReason = (text = '') => {
  if (!text) return 'A popular pick from our actual menu.';
  const squeezed = text.replace(/\s+/g, ' ').trim();
  return squeezed.length > 160 ? `${squeezed.slice(0, 157)}...` : squeezed;
};

const fallbackFromMenu = (items = [], limit = 3, includeType = false) =>
  items.slice(0, limit).map(item => {
    const entry = {
      name: item.name,
      reason: shortenReason(item.description)
    };
    if (includeType && item.type) entry.type = item.type;
    return entry;
  });

const fallbackChatReply =
  'Our AI barista is stretching its circuits, but here are some staff favorites while you wait!';

// POST /api/ai/recommend
router.post('/recommend', async (req, res) => {
  try {
    const { preference } = req.body;
    if (!preference)
      return res.status(400).json({ error: 'Please describe your taste or mood.' });

    // 메뉴 데이터 가져오기 (drinks/desserts)
    const items = await Product.findAll({ attributes: ['id', 'name', 'description', 'type'] });
    console.log('🗂️ Loaded menu items:', items.length);
    const menuEntries = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description
    }));
    const idMap = new Map(items.map(item => [item.id, item]));
    const menuJson = JSON.stringify(menuEntries, null, 2);

    // Gemini Prompt 구성
    const prompt = `
You are an AI barista at Café Delight.
Only recommend from this menu list (id, name, description):
${menuJson}
The user said: "${preference}".
Return 2–3 items using their id field.
If nothing fits, return an empty array.
Respond strictly in JSON like this:
[
  {"productId": 7, "reason": "Short reason why it fits"}
]
`;

    if (!GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY is missing. Returning fallback menu picks.');
      return res.json({ recommendations: fallbackFromMenu(items) });
    }

    // Gemini API 호출
    let data;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              response_mime_type: 'application/json'
            }
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini recommend HTTP ${response.status}: ${errText}`);
      }
      data = await response.json();
    } catch (callErr) {
      console.error('❌ Gemini recommend request failed. Using fallback menu items.', callErr);
      return res.json({ recommendations: fallbackFromMenu(items) });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    console.log('🔎 Gemini raw response:', text);
    const jsonBody = extractJsonArray(text);

    let recommendations = [];
    try {
      const parsed = JSON.parse(jsonBody);
      if (Array.isArray(parsed)) {
        recommendations = parsed;
      }
    } catch (parseErr) {
      console.error('AI recommendation parse error:', parseErr, jsonBody);
    }
    console.log('📋 Parsed recommendations:', recommendations);

    const filtered = recommendations
      .map(rec => {
        const productId = Number(rec?.productId ?? rec?.id);
        if (!productId || !idMap.has(productId)) return null;
        const product = idMap.get(productId);
        return {
          name: product.name,
          reason: rec.reason || 'Perfect for your taste.'
        };
      })
      .filter(Boolean);
    console.log('✅ Filtered recommendations:', filtered);

    if (filtered.length === 0) {
      console.warn('⚠️ No AI picks matched menu names. Raw AI output:', recommendations);
      return res.json({ recommendations: fallbackFromMenu(items) });
    }

    res.json({ recommendations: filtered });
  } catch (err) {
    console.error('AI recommendation error:', err);
    res.status(500).json({ error: 'AI recommendation failed.' });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Please enter a message.' });
    }

    const items = await Product.findAll({
      attributes: ['id', 'name', 'description', 'type'],
      limit: 25,
      order: [['id', 'ASC']]
    });
    const idMap = new Map(items.map(item => [item.id, item]));
    const menuJson = JSON.stringify(items, null, 2);

    if (!GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY missing. Returning fallback chat response.');
      return res.json({
        reply: fallbackChatReply,
        recommendations: fallbackFromMenu(items, 3, true)
      });
    }

    const systemPrompt = `
You are Café Delight's friendly AI barista.
Use the menu list (drinks and desserts) to craft pairings and suggestions.
Always return JSON with two fields:
{
  "reply": "two or three friendly sentences",
  "recommendations": [
    { "productId": 1, "reason": "why it fits" }
  ]
}
Recommend 2-3 items whenever possible. If a request falls outside the menu, keep the JSON format but set "recommendations" to an empty array and explain why.
Menu you must reference:
${menuJson}
    `.trim();

    const recentHistory = history
      .slice(-6)
      .filter(h => h?.role && h?.text)
      .map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text }]
      }));

    let data;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              role: 'system',
              parts: [{ text: systemPrompt }]
            },
            contents: [
              ...recentHistory,
              { role: 'user', parts: [{ text: message }] }
            ],
            generationConfig: {
              response_mime_type: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini chat HTTP ${response.status}: ${errText}`);
      }

      data = await response.json();
    } catch (callErr) {
      console.error('❌ Gemini chat request failed. Using fallback reply.', callErr);
      return res.json({
        reply: fallbackChatReply,
        recommendations: fallbackFromMenu(items, 3, true)
      });
    }
    const jsonText = extractJsonObject(
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    );

    let aiPayload = {};
    try {
      aiPayload = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('AI chat JSON parse error:', parseError, jsonText);
    }

    const reply = typeof aiPayload.reply === 'string'
      ? aiPayload.reply.trim()
      : 'Here to help with any Café Delight cravings! Ask me about drinks or desserts.';

    const selected = Array.isArray(aiPayload.recommendations)
      ? aiPayload.recommendations
      : [];

    const recommendations = selected
      .map(entry => {
        const productId = Number(entry?.productId ?? entry?.id);
        if (!productId || !idMap.has(productId)) return null;
        const product = idMap.get(productId);
        return {
          name: product.name,
          type: product.type,
          reason: entry?.reason || 'Matches your taste preferences.'
        };
      })
      .filter(Boolean);

    res.json({ reply, recommendations });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI chat failed.' });
  }
});

export default router;
