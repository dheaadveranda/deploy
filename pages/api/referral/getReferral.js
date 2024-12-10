import db from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const query = `
                SELECT r.IDPelanggan, r.KodeReferral, r.KuotaPenggunaan, p.NamaPelanggan
                FROM referral r
                LEFT JOIN pelanggan p ON r.IDPelanggan = p.IDPelanggan
                ORDER BY r.IDPelanggan, r.KodeReferral
            `;

            const [rows] = await db.execute(query);

            res.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching referrals:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
