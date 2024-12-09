import db from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { IDPelanggan, KodeReferral } = req.body;

        if (!IDPelanggan || !KodeReferral) {
            return res.status(400).json({ message: 'Invalid data' });
        }

        const pool = await db.getConnection();

        try {
            await pool.beginTransaction();

            // Validasi apakah referral code ada dan kuotanya cukup
            const referralQuery = `
                SELECT KuotaPenggunaan, IDPelanggan FROM referral 
                WHERE KodeReferral = ? AND KuotaPenggunaan > 0
            `;
            const [referralResult] = await pool.execute(referralQuery, [KodeReferral]);

            if (referralResult.length === 0) {
                await pool.rollback();
                return res.status(404).json({ message: 'Referral code not found or no available quota' });
            }

            const {IDPelanggan: ReferralOwner } = referralResult[0];

            // Kurangi kuota penggunaan referral
            await pool.execute(
                `UPDATE referral SET KuotaPenggunaan = KuotaPenggunaan - 1 WHERE KodeReferral = ?`,
                [KodeReferral]
            );

            // Tambahkan poin kepada pemilik referral
            await pool.execute(
                `UPDATE pelanggan SET TotalPoin = TotalPoin + 1 WHERE IDPelanggan = ?`,
                [ReferralOwner]
            );

            // Tambahkan poin kepada pelanggan yang menggunakan referral
            await pool.execute(
                `UPDATE pelanggan SET TotalPoin = TotalPoin + 1 WHERE IDPelanggan = ?`,
                [IDPelanggan]
            );

            await pool.commit();

            res.status(200).json({ message: 'Referral applied and points updated successfully' });
        } catch (error) {
            await pool.rollback();
            res.status(500).json({ message: 'Internal server error', error: error.message });
        } finally {
            pool.release();
        }
    } catch (error) {
        res.status(500).json({ message: 'Database connection error', error: error.message });
    }
}
