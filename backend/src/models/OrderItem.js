import { DataTypes } from 'sequelize';


export default (sequelize) => {
const OrderItem = sequelize.define('OrderItem', {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
priceAtPurchase: { type: DataTypes.FLOAT, allowNull: false }
});
return OrderItem;
};