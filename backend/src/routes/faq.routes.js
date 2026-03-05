import express from "express"
import { sequelize } from "../config/db.js"
import { requireAuth, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

const defaultFaqs = [
  {
    question: "What are your cafe's opening hours?",
    answer:
      "Cafe is open Monday to Friday from 7:00 AM to 8:00 PM, and Saturday to Sunday from 8:00 AM to 6:00 PM.",
  },
  {
    question: "Do you offer vegan or gluten-free options?",
    answer:
      "Yes, we have a variety of vegan and gluten-free options on our menu. Check the Drinks pages for details or ask our staff for recommendations.",
  },
  {
    question: "Can I make a reservation for a group?",
    answer: "Yes, we accept reservations for groups of 4 or more.",
  },
  {
    question: "Do you have Wi-Fi available for customers?",
    answer:
      "Yes, we offer free Wi-Fi to all customers. Ask our staff for the password when you visit.",
  },
  {
    question: "Do you have parking?",
    answer: "Yes, free parking is available nearby.",
  },
  {
    question: "Are pets allowed?",
    answer: "Service animals only are allowed inside the cafe.",
  },
];

async function ensureFaqTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(255) NOT NULL,
      answer TEXT NOT NULL
    )
  `)
}

async function syncFaqTable() {
  await ensureFaqTable()
  const [rows] = await sequelize.query('SELECT * FROM faqs ORDER BY id ASC')

  if (Array.isArray(rows) && rows.length > 0) {
    return rows
  }

  for (const faq of defaultFaqs) {
    await sequelize.query('INSERT INTO faqs (question, answer) VALUES (?, ?)', {
      replacements: [faq.question, faq.answer],
    })
  }

  const [seededRows] = await sequelize.query('SELECT * FROM faqs ORDER BY id ASC')
  return seededRows
}

export async function initFaqTable() {
  try {
    await syncFaqTable()
    console.log('✅ FAQ table ready')
  } catch (err) {
    console.error('❌ Failed to initialize FAQ table:', err.message)
  }
}

// ✅ 모든 FAQ 가져오기
router.get("/", async (req, res) => {
  try {
    const faqs = await syncFaqTable();
    res.json(faqs);
  } catch (err) {
    console.error(err);
    res.json(defaultFaqs);
  }
});

// ✅ (선택) 관리자만 FAQ 추가
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { question, answer } = req.body;
  try {
    await ensureFaqTable()
    await sequelize.query("INSERT INTO faqs (question, answer) VALUES (?, ?)", {
      replacements: [question, answer],
    });
    res.status(201).json({ message: "FAQ added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add FAQ" });
  }
});

export default router;
