import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { syncModels, User, Product } from './models/index.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import reviewRoutes from './routes/review.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import aiRoutes from './routes/ai.routes.js';
import allProductsRoutes from './routes/allProducts.routes.js';   // ✅ 추가됨
import faqRoutes, { initFaqTable } from "./routes/faq.routes.js";
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/all-products', allProductsRoutes);   // ✅ 추가됨
app.use('/api/reviews', reviewRoutes);
app.use('/api/faq',faqRoutes);




const PORT = process.env.PORT || 8080;

async function seedProductsFromFile() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'data.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const collect = (list = [], type) =>
      list.map((item) => ({
        name: item.name,
        type,
        description: item.description,
        price: Number(item.price) || 0,
        imageUrl: item.image || item.image_url || '',
        sizes: Array.isArray(item.sizes) ? item.sizes : undefined,
      }));

    const candidates = [
      ...collect(raw.hotDrinks, 'hot'),
      ...collect(raw.ColdDrinks, 'cold'),
      ...collect(raw.Desserts, 'dessert'),
    ];

    for (const entry of candidates) {
      await Product.findOrCreate({
        where: { name: entry.name },
        defaults: entry,
      });
    }

    console.log(`🍽️ Menu seeded/verified (${candidates.length} items)`);
  } catch (err) {
    console.error('❌ Failed to seed menu items:', err.message);
  }
}

(async () => {
  await connectDB();
  await syncModels();
  await initFaqTable();
  await seedProductsFromFile();

  const email = process.env.ADMIN_EMAIL;
  const pwd = process.env.ADMIN_PASSWORD;
  if (email && pwd) {
    const found = await User.findOne({ where: { email } });
    if (!found) {
      await User.create({
        name: 'Admin',
        email,
        passwordHash: await bcrypt.hash(pwd, 10),
        role: 'admin'
      });
      console.log('👑 Admin account created:', email);
    }
  }

  app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
  
})();
