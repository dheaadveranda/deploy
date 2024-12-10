import mysql from 'mysql2/promise';
import 'dotenv/config';

// Create a connection pool
const pool = mysql.createPool({
    host: '34.128.80.82',
    user: 'baru',
    password: '123456',
    database: 'padsi',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: false,
    queueLimit: 0
});

// const pool = mysql.createPool({  
//     host: 'localhost',
//     user: 'root',
//     password: 'Epdk@4851',
//     database: 'padsi',
//     waitForConnections: true,
//     connectionLimit: 10,
//     connectTimeout: false,
//     queueLimit: 0
// });

// Export the pool for use in other parts of the application
export default pool;