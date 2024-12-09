// pages/api/referral/getCustomers.js
import db from '../../../lib/db';
 
export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const query = 'SELECT IDPelanggan, NamaPelanggan FROM pelanggan'; // Sesuaikan dengan nama tabel dan kolom di database Anda
            const [rows] = await db.query(query);
 
            if (rows.length > 0) {
                res.status(200).json(rows);
            } else {
                res.status(404).json({ message: 'Tidak ada pelanggan ditemukan' });
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}
 