import { DataTypes } from 'sequelize';


export default (sequelize) => {
const Product = sequelize.define('Product', {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
name: { type: DataTypes.STRING, allowNull: false },
type: { type: DataTypes.ENUM('hot', 'cold', 'dessert'), allowNull: false },
description: { type: DataTypes.TEXT },
price: { type: DataTypes.FLOAT, allowNull: false },
imageUrl: { type: DataTypes.STRING },
sizes: { type: DataTypes.JSON, defaultValue: ["S","M","L"] },
stock: { type: DataTypes.INTEGER, defaultValue: 100 }
});
return Product;
};