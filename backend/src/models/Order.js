import { DataTypes } from 'sequelize';


export default (sequelize) => {
const Order = sequelize.define('Order', {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
status: { type: DataTypes.ENUM('pending','approved','declined','completed','paid'), defaultValue: 'pending' },
total: { type: DataTypes.FLOAT, allowNull: false },
notification: { type: DataTypes.STRING, allowNull: true }
});
return Order;
};
