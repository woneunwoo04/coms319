import { sequelize } from '../config/db.js';
import UserModel from './User.js';
import ProductModel from './Product.js';
import ReviewModel from './Review.js';
import OrderModel from './Order.js';
import OrderItemModel from './OrderItem.js';


export const User = UserModel(sequelize);
export const Product = ProductModel(sequelize);
export const Review = ReviewModel(sequelize);
export const Order = OrderModel(sequelize);
export const OrderItem = OrderItemModel(sequelize);


// Associations
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });


Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });


User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });


Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'orderId' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'productId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });


export async function syncModels() {
  try {
    await sequelize.sync({ alter: true });
    console.log("🧱 Tables synced");
  } catch (err) {
    console.error("❌ Sync error", err);
  }
}
