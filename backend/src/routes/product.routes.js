import { Router } from 'express';
import { Product, Review, User } from '../models/index.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';

const router = Router();
const menuFilePath = path.join(process.cwd(), 'data', 'data.json');

function readMenuCatalog() {
  const raw = JSON.parse(fs.readFileSync(menuFilePath, 'utf8'));
  const wrap = (list = [], type) =>
    list.map((item) => ({
      name: item.name,
      description: item.description,
      price: Number(item.price) || 0,
      imageUrl: item.image || item.image_url || '',
      type,
      sizes: Array.isArray(item.sizes) ? item.sizes : undefined,
    }));

  return [
    ...wrap(raw.hotDrinks, 'hot'),
    ...wrap(raw.ColdDrinks, 'cold'),
    ...wrap(raw.Desserts, 'dessert'),
  ];
}

async function ensureProductFromMenu({ name, typeHint }) {
  if (!name) return null;
  const existing = await Product.findOne({ where: { name } });
  if (existing) return existing;

  const catalog = readMenuCatalog();
  const match = catalog.find(
    (item) =>
      item.name.toLowerCase() === name.toLowerCase() &&
      (!typeHint || item.type === typeHint)
  ) || catalog.find((item) => item.name.toLowerCase() === name.toLowerCase());

  if (!match) return null;

  return Product.create({
    name: match.name,
    type: typeHint || match.type,
    description: match.description,
    price: match.price,
    imageUrl: match.imageUrl,
    sizes: match.sizes,
  });
}

// ✅ list + search/filter: name, category, price range
router.get('/', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    const where = {};

    // 카테고리 필터
    if (category) where.category = category;

    // 가격 필터
    if (minPrice || maxPrice) where.price = {};
    if (minPrice) where.price['$gte'] = Number(minPrice);
    if (maxPrice) where.price['$lte'] = Number(maxPrice);

    // DB에서 조회
    const all = await Product.findAll({
      where,
      order: [['id', 'DESC']],
    });

    // 검색어 필터 (이름 기준)
    const filtered = q
      ? all.filter(p =>
          p.name.toLowerCase().includes(String(q).toLowerCase())
        )
      : all;

    res.json(filtered);
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ✅ get single product (with reviews and user info)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Review, include: [User] }],
    });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    console.error('❌ Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ✅ Admin: create
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      type,
      description = '',
      price,
      imageUrl = '',
      sizes = [],
      stock = 0,
    } = req.body || {};

    if (!name || !type || price === undefined) {
      return res.status(400).json({ message: 'Name, type, and price are required.' });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }

    const numericStock = Number(stock);
    if (Number.isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({ message: 'Stock must be zero or greater.' });
    }

    const normalizedSizes = Array.isArray(sizes)
      ? sizes
      : String(sizes)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const created = await Product.create({
      name: name.trim(),
      type,
      description: description.trim(),
      price: numericPrice,
      imageUrl: imageUrl?.trim() || null,
      sizes: normalizedSizes.length ? normalizedSizes : null,
      stock: numericStock,
    });

    res.json(created);
  } catch (err) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.post('/resolve', async (req, res) => {
  const { name, type } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const product = await ensureProductFromMenu({ name, typeHint: type });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    console.error('❌ Error resolving product:', err);
    res.status(500).json({ error: 'Failed to resolve product' });
  }
});

// ✅ Admin: update
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    await p.update(req.body);
    res.json(p);
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// ✅ Admin: delete
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    await p.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
