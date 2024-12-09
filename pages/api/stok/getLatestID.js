import pool from '../../../lib/db';
 
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
 
    try {
        // Query untuk mengambil ID transaksi terakhir
        const [rows] = await pool.query('SELECT IDBahan FROM stok ORDER BY IDBahan DESC LIMIT 1');
 
        if (rows.length > 0) {
            const latestID = rows[0].IDBahan;
            res.status(200).json({ latestID });
        } else {
            // Jika tidak ada transaksi ditemukan
            res.status(200).json({ latestID: null });
        }
    } catch (error) {
        console.error('Error fetching the latest stock ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
 