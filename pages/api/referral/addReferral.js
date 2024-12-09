// pages/api/referral/addReferral.js

import db from '../../../lib/db'; // Ensure the correct import for your DB connection
import { generateReferralCode } from '../../../lib/utils';  // Adjusting for the correct directory

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { IDPelanggan, NamaPelanggan } = req.body;

    // Validation check
    if (!IDPelanggan || !NamaPelanggan) {
        return res.status(400).json({ message: 'IDPelanggan dan NamaPelanggan harus disertakan' });
    }

    // Normalize the input
    const normalizedID = IDPelanggan.trim().toUpperCase();
    const normalizedNama = NamaPelanggan.trim().toUpperCase();

    try {
        // Check current referral status
        const queryCheckReferral = `
            SELECT KuotaPenggunaan 
            FROM Referral 
            WHERE IDPelanggan = ? 
            ORDER BY KuotaPenggunaan DESC 
            LIMIT 1
        `;
        const [referralRows] = await db.execute(queryCheckReferral, [normalizedID]);

        // If quota is full, create a new referral code
        if (referralRows.length > 0 && referralRows[0].KuotaPenggunaan >= 5) {
            const newReferralCode = generateReferralCode();

            // Insert new referral
            const queryInsertReferral = `
                INSERT INTO Referral (IDPelanggan, KodeReferral, KuotaPenggunaan) 
                VALUES (?, ?, ?)
            `;
            await db.execute(queryInsertReferral, [normalizedID, newReferralCode, 0]);

            return res.status(200).json({
                message: 'Referral baru berhasil dibuat',
                KodeReferral: newReferralCode,
                IDPelanggan: normalizedID,
                NamaPelanggan: normalizedNama,
            });
        } else {
            return res.status(400).json({
                message: 'Kuota referral belum penuh atau tidak ditemukan',
            });
        }
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
