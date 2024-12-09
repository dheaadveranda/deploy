import mysql from 'mysql2/promise';
// const mysql = require('mysql2'); // Make sure to install mysql2 package

const pool = mysql.createPool({
    host: '34.128.80.82', // Host database Anda
    user: 'baru',      // Username Anda
    password: '123456', // Password Anda
    database: 'padsi', // Nama database Anda
    waitForConnections: true,
    port: 3306,
    connectionLimit: 10,
    connectTimeout: 10000, // Timeout dalam milidetik
    queueLimit: 0
});

// Contoh query untuk menguji koneksi
pool.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Query result:', results[0].result);
    }
    pool.end(); // Tutup pool setelah selesai
});

export default pool;
