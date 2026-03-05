import express from "express";
import fetch from "node-fetch"; // if needed
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();
const router = express.Router();

// DB 연결
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// ✅ Gemini API 키 환경 변수에 저장
// .env에 추가: GEMINI_API_KEY=your_api_key_here

router.post("/", async (req, res) => {
  try {
    const { preference } = req.body;
    if (!preference) return res.status(400).json({ error: "No preference given" });

    // DB에서 메뉴 불러오기
    const [drinks] = await db.query("SELECT name, description FROM drinks");

    // Gemini 프롬프트 구성
    const prompt = `
You are an AI barista at Café Delight.
Here is our menu: ${drinks
      .map((d) => `${d.name}: ${d.description}`)
      .join(", ")}.
Based on the user's preference — "${preference}" — suggest 2 to 3 drinks or desserts from the menu.
Explain why each one suits their taste in one sentence.
Output in JSON format: [{name, reason}]
    `;

    // Gemini API 요청
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const recommendations = JSON.parse(text);

    res.json({ recommendations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI recommendation failed" });
  }
});

export default router;
