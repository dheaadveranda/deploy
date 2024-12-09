const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost', // Ganti dengan host database Anda
    user: 'root',      // Ganti dengan username database Anda
    password: 'Epdk@4851',      // Ganti dengan password database Anda
    database: 'sisuca' // Ganti dengan nama database Anda
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database successfully!');
    }
    connection.end();
});
