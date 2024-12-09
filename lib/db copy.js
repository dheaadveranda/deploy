import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost', // Host database Anda
    user: 'root',      // Username Anda
    password: 'Epdk@4851', // Password Anda
    database: 'padsi', // Nama database Anda
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
