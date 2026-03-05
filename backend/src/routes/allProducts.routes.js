import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

router.get("/", (req, res) => {
  try {
    // ✅ process.cwd()는 nodemon 실행 기준 (프로젝트 루트)
    const filePath = path.join(process.cwd(), "data", "data.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(data);
  } catch (err) {
    console.error("❌ Error reading data.json:", err);
    res.status(500).json({ error: "Failed to load menu data" });
  }
});

export default router;


