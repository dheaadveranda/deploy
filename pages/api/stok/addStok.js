// pages/api/stok/addStok.js
import pool from '../../../lib/db'; // Pastikan jalur ini benar
 
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {NamaBahan, Jumlah, Satuan, Keterangan } = req.body;
     
        try {
            // Ambil ID pegawai terakhir terlebih dahulu
            const [latestIDRows] = await pool.query('SELECT IDBahan FROM stok ORDER BY IDBahan DESC LIMIT 1');
            let newID = 'STK0001'; // Default ID pegawai pertama
 
            if (latestIDRows.length > 0) {
                const latestID = latestIDRows[0].IDBahan;
                const numberPart = parseInt(latestID.substring(3), 10); // Mengambil angka dari ID terakhir (contoh EMP0001 menjadi 1)
                const newNumberPart = numberPart + 1; // Increment angka tersebut
                newID = `STK${newNumberPart.toString().padStart(4, '0')}`; // Membentuk ID baru seperti EMP0002, EMP0003, ...
            }
 
            // Query untuk menambahkan pegawai
            const query = 'INSERT INTO stok (IDBahan, NamaBahan, Jumlah, Satuan, Keterangan) VALUES (?, ?, ?, ?, ?)';
            const values = [newID, NamaBahan, Jumlah, Satuan, Keterangan];
         
            // Menggunakan await untuk query database
            await pool.query(query, values);
 
            // Jika berhasil
            return res.status(201).json({ message: 'Stok added successfully!' });
        } catch (err) {
            console.error('Error inserting stok:', err); // Logging error
            return res.status(500).json({ error: 'Failed to add stok' }); // Mengembalikan error ke klien
        }
    } else {
        res.setHeader('Allow', ['POST']); // Mengatur metode yang diizinkan
        return res.status(405).end(`Method ${req.method} Not Allowed`); // Mengembalikan status metode tidak diperbolehkan
    }
}