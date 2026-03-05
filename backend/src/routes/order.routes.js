import { Router } from 'express';
import { Order, OrderItem, Product } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();


router.post('/', requireAuth, async (req, res) => {
const { items } = req.body; // [{productId, quantity}]
if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Empty cart' });


const prods = await Product.findAll({ where: { id: items.map(i => i.productId) } });
if (prods.length !== items.length) return res.status(400).json({ message: 'Invalid items' });


let total = 0;
const lines = items.map(i => {
const p = prods.find(pp => pp.id === i.productId);
total += p.price * i.quantity;
return { productId: p.id, quantity: i.quantity, priceAtPurchase: p.price };
});


const order = await Order.create({ userId: req.user.id, total, status: 'pending' });
for (const line of lines) await OrderItem.create({ ...line, orderId: order.id });


res.json({ orderId: order.id, total });
});


router.get('/mine', requireAuth, async (req, res) => {
const orders = await Order.findAll({
where: { userId: req.user.id },
order: [['id','DESC']],
include: [{ model: OrderItem, include: [Product] }]
});
res.json(orders);
});

router.get('/has-item/:productId', requireAuth, async (req, res) => {
const { productId } = req.params;
const match = await OrderItem.findOne({
where: { productId },
include: [{ model: Order, where: { userId: req.user.id }, attributes: [] }],
});
res.json({ purchased: !!match });
});


export default router;
