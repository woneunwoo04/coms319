import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { User, Order, Product, Review, OrderItem } from '../models/index.js';
const router = Router();


router.use(requireAuth, requireAdmin);


router.get('/stats', async (req, res) => {
const [users, orders, products, reviews] = await Promise.all([
User.count(), Order.count(), Product.count(), Review.count()
]);
res.json({ users, orders, products, reviews });
});

// List pending (unapproved) reviews
router.get('/reviews/pending', async (req, res) => {
const pending = await Review.findAll({
where: { approved: false },
include: [User, Product],
order: [['id','DESC']]
});
res.json(pending);
});


// Approve a review
router.put('/reviews/:id/approve', async (req, res) => {
const r = await Review.findByPk(req.params.id);
if (!r) return res.status(404).json({ message: 'Not found' });
await r.update({ approved: true });
res.json(r);
});


// Delete a review
router.delete('/reviews/:id', async (req, res) => {
const r = await Review.findByPk(req.params.id);
if (!r) return res.status(404).json({ message: 'Not found' });
await r.destroy();
res.json({ ok: true });
});


router.get('/users', async (req, res) => res.json(await User.findAll()));
router.get('/orders', async (req, res) => {
const orders = await Order.findAll({
order: [['id','DESC']],
include: [
{ model: User, attributes: ['id','name','email'] },
{ model: OrderItem, include: [Product] }
]
});
res.json(orders);
});

router.put('/orders/:id/approve', async (req, res) => {
const order = await Order.findByPk(req.params.id, {
include: [{ model: OrderItem, include: [Product] }]
});
if (!order) return res.status(404).json({ message: 'Order not found' });
if (!['pending','paid'].includes(order.status)) return res.status(400).json({ message: 'Only pending orders can be approved' });

for (const item of order.OrderItems) {
if (!item.Product) return res.status(400).json({ message: 'Product missing for order item' });
if (item.Product.stock < item.quantity) {
return res.status(400).json({ message: `Not enough stock for ${item.Product.name}` });
}
}

for (const item of order.OrderItems) {
const product = item.Product;
await product.update({ stock: product.stock - item.quantity });
}

order.status = 'approved';
order.notification = 'Your order has been approved';
await order.save();
res.json(order);
});

router.put('/orders/:id/decline', async (req, res) => {
const { reason = 'We are currently busy. Please try again later.' } = req.body || {};
const order = await Order.findByPk(req.params.id);
if (!order) return res.status(404).json({ message: 'Order not found' });
if (!['pending','paid'].includes(order.status)) return res.status(400).json({ message: 'Only pending orders can be declined' });
order.status = 'declined';
order.notification = reason;
await order.save();
res.json(order);
});

router.put('/orders/:id/complete', async (req, res) => {
const order = await Order.findByPk(req.params.id);
if (!order) return res.status(404).json({ message: 'Order not found' });
if (order.status !== 'approved') return res.status(400).json({ message: 'Only approved orders can be completed' });
order.status = 'completed';
order.notification = 'Your order is completed';
await order.save();
res.json(order);
});


export default router;
