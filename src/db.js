const mysql = require('mysql2');

// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: "147.93.118.246",
    user: "root",
    password: "wpfih3xXwrqWYTcnbCaHfuNj55B77MNVDUQUYORKSArl93KMz1e5bgtiy9VswHG2",
    database: "onboarding_db",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 100,  // Aumentado para permitir más conexiones simultáneas si es necesario
    queueLimit: 0,  // Sin límite en la cola de conexiones
    connectTimeout: 5000  // Reducido a 5 segundos para intentar conexiones más rápidas
});


module.exports = pool;