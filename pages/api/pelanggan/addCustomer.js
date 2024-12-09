// pages/api/pelanggan/addCustomer.js
import pool from '../../../lib/db'; // Pastikan jalur ini benar
 
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {NamaPelanggan, NoHP, Email, Alamat, TglDaftar, TotalPoin } = req.body;
     
        try {
            // Ambil ID pelanggan dengan prefiks 'CUST' terakhir terlebih dahulu
            const [latestIDRows] = await pool.query('SELECT IDPelanggan FROM pelanggan WHERE IDPelanggan LIKE "CUST%" ORDER BY IDPelanggan DESC LIMIT 1');
            let newID = 'CUST0001'; // Default ID pelanggan pertama
         
            if (latestIDRows.length > 0) {
                const latestID = latestIDRows[0].IDPelanggan;
                const numberPart = parseInt(latestID.substring(4), 10); // Mengambil angka dari ID terakhir (contoh CUST0001 menjadi 1)
                const newNumberPart = numberPart + 1; // Increment angka tersebut
                newID = `CUST${newNumberPart.toString().padStart(4, '0')}`; // Membentuk ID baru seperti CUST0002, CUST0003, ...
            }
         
            // Query untuk menambahkan pelanggan
            const query = 'INSERT INTO pelanggan (IDPelanggan, NamaPelanggan, NoHP, Email, Alamat, TglDaftar, TotalPoin) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [newID, NamaPelanggan, NoHP, Email, Alamat, TglDaftar, TotalPoin];
         
            // Menggunakan await untuk query database
            await pool.query(query, values);
 
            // Jika berhasil
            return res.status(201).json({ message: 'Customer added successfully!' });
        } catch (err) {
            console.error('Error inserting Customer:', err); // Logging error
            return res.status(500).json({ error: 'Failed to add Customer' }); // Mengembalikan error ke klien
        }
    } else {
        res.setHeader('Allow', ['POST']); // Mengatur metode yang diizinkan
        return res.status(405).end(`Method ${req.method} Not Allowed`); // Mengembalikan status metode tidak diperbolehkan
    }
}
