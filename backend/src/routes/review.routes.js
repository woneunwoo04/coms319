import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sequelize } from '../config/db.js';

const router = Router();
const Review = sequelize.models.Review;
const Product = sequelize.models.Product;
const Order = sequelize.models.Order;
const OrderItem = sequelize.models.OrderItem;

// ✅ 모든 리뷰 조회 (관리자만 전체 / 일반 유저는 승인된 리뷰만)
router.get('/', async (req, res) => {
  const reviews = await Review.findAll({ where: { approved: true } });
  res.json(reviews);
});

// ✅ 로그인한 유저가 리뷰 작성
router.post('/', requireAuth, async (req, res) => {
  try {
    console.log('📥 Review payload:', req.headers['content-type'], req.body);
    const productName = req.body.product?.trim();
    const productId = req.body.productId;
    const comment = req.body.comment?.trim();
    const ratingValue = Number(req.body.rating);

    if ((!productName && !productId) || !comment || Number.isNaN(ratingValue)) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const productRecord = productId
      ? await Product.findByPk(productId)
      : await Product.findOne({ where: { name: productName } });

    if (!productRecord) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const hasPurchased = await OrderItem.findOne({
      where: { productId: productRecord.id },
      include: [{
        model: Order,
        where: { userId: req.user.id },
        attributes: [],
      }],
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review items you have ordered.' });
    }

    const newReview = await Review.create({
      userId: req.user.id,
      product: productRecord.name,
      rating: ratingValue,
      comment,
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error('❌ Review create error:', err);
    res.status(400).json({ message: 'Failed to save review' });
  }
});

// ✅ 관리자: 리뷰 승인
router.put('/:id/approve', requireAdmin, async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  review.approved = true;
  await review.save();
  res.json(review);
});

// ✅ 관리자: 리뷰 삭제
router.delete('/:id', requireAdmin, async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  await review.destroy();
  res.json({ message: 'Deleted' });
});

export default router;
