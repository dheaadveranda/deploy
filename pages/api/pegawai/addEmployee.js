// pages/api/pegawai/addEmployee.js
import pool from '../../../lib/db'; // Pastikan jalur ini benar

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { NamaPegawai, NoHP, Peran, Email, Alamat, TglBergabung, Username, Password } = req.body;

        try {
            // Ambil ID pegawai terakhir terlebih dahulu
            const [latestIDRows] = await pool.query('SELECT IDPegawai FROM pegawai ORDER BY IDPegawai DESC LIMIT 1');
            let newID = 'EMP0001'; // Default ID pegawai pertama

            if (latestIDRows.length > 0) {
                const latestID = latestIDRows[0].IDPegawai;
                const numberPart = parseInt(latestID.substring(3), 10); // Mengambil angka dari ID terakhir (contoh EMP0001 menjadi 1)
                const newNumberPart = numberPart + 1; // Increment angka tersebut
                newID = `EMP${newNumberPart.toString().padStart(4, '0')}`; // Membentuk ID baru seperti EMP0002, EMP0003, ...
            }

            // Query untuk menambahkan pegawai
            const query = 'INSERT INTO pegawai (IDPegawai, NamaPegawai, NoHP, Peran, Email, Alamat, TglBergabung, Username, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [newID, NamaPegawai, NoHP, Peran, Email, Alamat, TglBergabung, Username, Password];

            // Menggunakan await untuk query database
            await pool.query(query, values);

            // Jika berhasil
            return res.status(201).json({ message: 'Employee added successfully!' });
        } catch (err) {
            console.error('Error inserting employee:', err); // Logging error
            return res.status(500).json({ error: 'Failed to add employee' }); // Mengembalikan error ke klien
        }
    } else {
        res.setHeader('Allow', ['POST']); // Mengatur metode yang diizinkan
        return res.status(405).end(`Method ${req.method} Not Allowed`); // Mengembalikan status metode tidak diperbolehkan
    }
}
