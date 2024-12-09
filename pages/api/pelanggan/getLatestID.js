import pool from '../../../lib/db';
 
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
 
    try {
        // Ambil ID pelanggan yang diawali dengan 'CUST' saja, mengabaikan 'GUEST'
        const [rows] = await pool.query('SELECT IDPelanggan FROM pelanggan WHERE IDPelanggan LIKE "CUST%" ORDER BY IDPelanggan DESC LIMIT 1');
 
        if (rows.length > 0) {
            const latestID = rows[0].IDPelanggan; // Misal: CUST0012
            return res.status(200).json({ latestID });
        } else {
            // Jika tidak ada ID pelanggan yang dimulai dengan 'CUST', kembalikan null
            return res.status(200).json({ latestID: null });
        }
    } catch (error) {
        console.error('Error fetching the latest customer ID:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}