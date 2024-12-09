// pages/api/pelanggan/updateCustomer.js
import pool from '../../../lib/db'; // Ganti jika menggunakan pool

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const { IDPelanggan, NamaPelanggan, NoHP, Email, Alamat, TglDaftar, TotalPoin } = req.body;

        // Validasi input
        if (!IDPelanggan) {
            return res.status(400).json({ error: 'IDPelanggan is required' });
        }

        console.log("Received data:", req.body);

        try {
            // Cek data pelanggan yang ada
            const [currentData] = await pool.query('SELECT * FROM pelanggan WHERE IDPelanggan = ?', [IDPelanggan]);

            if (currentData.length === 0) {
                return res.status(404).json({ error: 'Customer not found' });
            }

            // Update data pelanggan
            const query = 'UPDATE pelanggan SET NamaPelanggan = ?, NoHP = ?, Email = ?, Alamat = ?, TglDaftar = ?, TotalPoin = ? WHERE IDPelanggan = ?';
            const values = [NamaPelanggan, NoHP, Email, Alamat, TglDaftar, TotalPoin, IDPelanggan];

            const [results] = await pool.query(query, values);

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'No changes made or customer not found' });
            }

            return res.status(200).json({ message: 'Customer updated successfully!' });
        } catch (err) {
            console.error('Error updating customer:', err);
            return res.status(500).json({ error: 'Failed to update customer' });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
