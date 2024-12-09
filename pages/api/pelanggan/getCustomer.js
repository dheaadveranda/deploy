import pool from '../../../lib/db'; // Pastikan impor menggunakan pool dengan mysql2/promise
 
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
 
    try {
        const { id } = req.query;
 
        let results;
        if (!id) {
            // Ambil semua pegawai
            [results] = await pool.query('SELECT * FROM pelanggan');
        } else {
            // Ambil pegawai berdasarkan ID
            [results] = await pool.query('SELECT * FROM pelanggan WHERE IDPelanggan = ?', [id]);
        }
 
        if (results.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
 
        res.status(200).json(id ? results[0] : results);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}