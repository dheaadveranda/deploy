// import mysql from 'mysql2';
// import bcrypt from 'bcrypt';

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root', // Ganti dengan username database Anda
//     password: 'Epdk@4851', // Ganti dengan password database Anda
//     database: 'sisuca', // Ganti dengan nama database Anda
// });

// // Koneksi ke database
// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err.stack);
//         return;
//     }
//     console.log('Connected to the database as id ' + connection.threadId);
// });

// // Mengambil semua pegawai
// connection.query('SELECT * FROM pegawai', async (err, results) => {
//     if (err) {
//         console.error('Error fetching employees:', err);
//         return;
//     }

//     console.log('Fetched Employees:', results); // Melihat data pegawai

//     for (const employee of results) {
//         const plainPassword = employee.Password; // Pastikan ini nama kolom di database
        
//         if (plainPassword) {
//             const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash password
//             // Update password di database dari plaintext menjadi hashed
//             connection.query('UPDATE pegawai SET Password = ? WHERE IDPegawai = ?', [hashedPassword, employee.IDPegawai], (updateErr) => {
//                 if (updateErr) {
//                     console.error('Error updating employee password:', updateErr);
//                 } else {
//                     console.log(`Password for ${employee.NamaPegawai} updated successfully`); // Pastikan ini sesuai pengambilan di database
//                 }
//             });
//         } else {
//             console.log(`Password is empty for ${employee.NamaPegawai}. Skipping...`); // Tanda jika kosong
//         }
//     }
//     connection.end(); // Tutup koneksi setelah selesai
// });


// // import mysql from 'mysql2';
// // import bcrypt from 'bcrypt';

// // const connection = mysql.createConnection({
// //     host: 'localhost',
// //     user: 'root',
// //     password: 'Epdk@4851', 
// //     database: 'sisuca',
// // });

// // connection.connect((err) => {
// //     if (err) {
// //         console.error('Error connecting to the database:', err.stack);
// //         return;
// //     }
// //     console.log('Connected to the database as id ' + connection.threadId);
// // });

// // // Mengambil semua pegawai
// // connection.query('SELECT * FROM pegawai', async (err, results) => {
// //     if (err) {
// //         console.error('Error fetching employees:', err);
// //         return;
// //     }

// //     console.log('Fetched Employees:', results);

// //     for (const employee of results) {
// //         const plainPassword = employee.Password;
// //         if (plainPassword) {
// //             const hashedPassword = await bcrypt.hash(plainPassword, 10);
            
// //             connection.query('UPDATE pegawai SET password = ? WHERE idpegawai = ?', [hashedPassword, employee.IDPegawai], (updateErr) => {
// //                 if (updateErr) {
// //                     console.error('Error updating employee password:', updateErr);
// //                 } else {
// //                     console.log(`Password for ${employee.namapegawai} updated successfully`);
// //                 }
// //             });
// //         } else {
// //             console.log(`Password is empty for ${employee.namapegawai}. Skipping...`);
// //         }
// //     }
// //     connection.end();
// // });

