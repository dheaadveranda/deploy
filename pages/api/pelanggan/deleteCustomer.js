// pages/api/pelanggan/deleteCustomer.js
import pool from '../../../lib/db'; // Pastikan jalur ini benar
 
export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        // Ambil IDPelanggan dari query parameter, bukan body
        const { id } = req.query;
 
        // Validasi apakah id ada
        if (!id) {
            return res.status(400).json({ error: 'IDPelanggan is required' });
        }
 
        try {
            const query = 'DELETE FROM pelanggan WHERE IDPelanggan = ?';
            const values = [id];
 
            // Menjalankan query untuk menghapus pelanggan
            const [result] = await pool.query(query, values);
 
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Pelanggan not found' });
            }
 
            return res.status(200).json({ message: 'Pelanggan deleted successfully!' });
        } catch (err) {
            console.error('Error deleting pelanggan:', err); // Logging error
            return res.status(500).json({ error: 'Failed to delete pelanggan' }); // Mengembalikan error
        }
    } else {
        // Pastikan hanya metode DELETE yang diizinkan
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}