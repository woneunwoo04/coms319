// src/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;
const SOCKET_PATH = '/tmp/mysql.sock';

function buildConfig(useSocket) {
  const cfg = { dialect: 'mysql', logging: false };
  if (useSocket) {
    cfg.dialectOptions = { socketPath: SOCKET_PATH };
  } else {
    cfg.host = DB_HOST;
    cfg.port = DB_PORT;
  }
  return cfg;
}

let sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, buildConfig(false));
export { sequelize };

export async function connectDB() {
  try {
    console.log('🔌 Trying MySQL connection using host/port', `${DB_HOST}:${DB_PORT}`);
    await sequelize.authenticate();
    console.log('✅ MySQL DB connected (host/port)');
  } catch (err) {
    console.warn('⚠️ Host/port connection failed:', err.message, '→ trying socket');
    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, buildConfig(true));
    try {
      await sequelize.authenticate();
      console.log('✅ MySQL DB connected (socket)');
    } catch (socketErr) {
      console.error('❌ DB connection error:', socketErr.message);
      process.exit(1);
    }
  }
}
