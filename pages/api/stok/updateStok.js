// pages/api/stok/updateStok.js
import pool from '../../../lib/db'; // Pastikan jalur ini benar
 
export default async function handler(req, res) {
    const { id } = req.query; // Ambil ID dari query parameter
 
    if (req.method === 'PUT') {
        const {NamaBahan, Jumlah, Satuan, Keterangan} = req.body; // Ambil data dari body
 
        // Pastikan ID pegawai ada di query
        if (!id) {
            return res.status(400).json({ error: 'IDBahan is required' });
        }
 
        try {
            const query = 'UPDATE stok SET NamaBahan = ?, Jumlah = ?, Satuan = ?, Keterangan = ? WHERE IDBahan = ?';
            const values = [NamaBahan, Jumlah, Satuan, Keterangan, id]; // Gunakan 'id' dari query
 
            // Menjalankan query
            const [results] = await pool.query(query, values);
 
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Stok not found' }); // Jika tidak ada yang diupdate
            }
 
            return res.status(200).json({ message: 'Stok updated successfully!' }); // Jika berhasil
        } catch (err) {
            console.error('Error updating Stok:', err); // Logging error
            return res.status(500).json({ error: 'Failed to update stok' });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`); // Jika metode selain PUT dipanggil
    }
}