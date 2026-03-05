import { connectDB } from "../src/config/db.js";
import { Product } from "../src/models/index.js";
import fs from "fs";

(async () => {
  try {
    await connectDB();

    const data = JSON.parse(fs.readFileSync(new URL("../data/data.json", import.meta.url), "utf8")); // 메뉴 JSON 파일
    const existing = await Product.count();
    if (existing > 0) {
      console.log("🟡 Products already exist in DB. Skipping seeding.");
      process.exit(0);
    }

    for (const item of data) {
      await Product.create({
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image,
        ingredients: Array.isArray(item.ingredients)
          ? item.ingredients.join(", ")
          : item.ingredients,
        category: item.type,
      });
    }

    console.log("✅ Menu seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
})();
