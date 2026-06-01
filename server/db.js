import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.DB_USER || 'webuser',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '123456',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'web_web',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export default pool