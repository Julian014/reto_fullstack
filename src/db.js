const mysql = require('mysql2');
require('dotenv').config();

// Configuración del pool de conexiones desde variables de entorno
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 100,
    queueLimit: 0,
    connectTimeout: process.env.DB_TIMEOUT || 5000
});

module.exports = pool;