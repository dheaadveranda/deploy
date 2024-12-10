import db from '../../../lib/db'; // Sesuaikan path dengan konfigurasi proyek Anda
 
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
 
    try {
        const { Transaksi, TglTransaksi, IDPegawai, IDPelanggan, Items, ReferralCode, TotalPoin } = req.body;
 
        // Validasi data awal
        if (!Transaksi || !TglTransaksi || !IDPegawai || !IDPelanggan || !Items || Items.length === 0) {
            return res.status(400).json({ message: 'Invalid transaction data' });
        }
 
        // Hitung total harga dan diskon
        let TotalHarga = Items.reduce((sum, item) => {
            if (!item.SubTotal || !item.JumlahPesan) {
                console.error('Invalid item:', item);
                throw new Error('Invalid item data');
            }
            return sum + (item.SubTotal * item.JumlahPesan);
        }, 0);
        let discount = 0; // Default tanpa diskon
        let metodePembayaran = 'Cash';
        let finalpoin = 0;
 
        const pool = await db.getConnection();
        try {
            await pool.beginTransaction();
 
            // Validasi dan pengurangan poin jika TotalPoin tersedia
            if (TotalPoin && TotalPoin >= 10) {
                const poinQuery = `SELECT TotalPoin FROM pelanggan WHERE IDPelanggan = ?`;
                const [poinResult] = await pool.execute(poinQuery, [IDPelanggan]);
 
                if (poinResult.length === 0 || poinResult[0].TotalPoin < 10) {
                    throw new Error('Poin tidak mencukupi!');
                }
 
                const updatePoinQuery = `UPDATE pelanggan SET TotalPoin = TotalPoin - 10 WHERE IDPelanggan = ?`;
                await pool.execute(updatePoinQuery, [IDPelanggan]);
                metodePembayaran = 'Poin';
                finalpoin = 10;
            }
 
            // Validasi kode referral
            let finalReferralCode = null;
            if (ReferralCode) {
                const referralQuery = `SELECT KuotaPenggunaan, IDPelanggan FROM referral WHERE KodeReferral = ?`;
                const [referralResult] = await pool.execute(referralQuery, [ReferralCode]);
 
                if (referralResult.length === 0) {
                    throw new Error('Referral code not found');
                }
 
                const { KuotaPenggunaan, IDPelanggan: OwnerID } = referralResult[0];
                if (KuotaPenggunaan >= 5) {
                    const newReferralCode = `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                    const insertNewReferralQuery = `
                        INSERT INTO referral (KodeReferral, KuotaPenggunaan, IDPelanggan)
                        VALUES (?, 0, ?)
                    `;
                    await pool.execute(insertNewReferralQuery, [newReferralCode, OwnerID]);
                    throw new Error('Referral code reached max usage. New referral generated.');
                }
 
                discount = 0.10;
                TotalHarga = TotalHarga * (1 - discount);
 
                const updateReferralQuery = `UPDATE referral SET KuotaPenggunaan = KuotaPenggunaan + 1 WHERE KodeReferral = ?`;
                await pool.execute(updateReferralQuery, [ReferralCode]);
 
                const updatePelangganQuery = `UPDATE pelanggan SET TotalPoin = TotalPoin + 1 WHERE IDPelanggan = ?`;
                await pool.execute(updatePelangganQuery, [IDPelanggan]);
 
                if (OwnerID.startsWith('CUST')) {
                    await pool.execute(updatePelangganQuery, [OwnerID]);
                }
 
                finalReferralCode = ReferralCode;
            }
 
            // Simpan transaksi
            const totalJumlahPesan = Items.reduce((total, item) => total + item.JumlahPesan, 0);
            const insertTransaksiQuery = `
                INSERT INTO transaksi
                (IDTransaksi, TglTransaksi, IDPegawai, IDPelanggan, TotalHarga, Discount, JumlahPesan, KodeReferral, PenggunaanPoin, MetodePembayaran)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await pool.execute(insertTransaksiQuery, [
                Transaksi,
                TglTransaksi,
                IDPegawai,
                IDPelanggan,
                TotalHarga,
                discount,
                totalJumlahPesan,
                finalReferralCode,
                finalpoin,
                metodePembayaran,
            ]);
 
            // Simpan detail transaksi menggunakan Promise.all
            const insertLaporanTransaksiQuery = `
                INSERT INTO laporantransaksi
                (IDTransaksi, TglTransaksi, IDMenu, JumlahPesan, SubTotal)
                VALUES (?, ?, ?, ?, ?)
            `;
            await Promise.all(Items.map(async (item) => {
                await pool.execute(insertLaporanTransaksiQuery, [
                    Transaksi,
                    TglTransaksi,
                    item.IDTransaksi,
                    item.JumlahPesan,
                    item.SubTotal,
                ]);
            }));
 
            await pool.commit();
            res.status(200).json({
                success: true,
                message: 'Transaction saved successfully',
                TotalHarga,
                Discount: discount,
            });
        } catch (error) {
            await pool.rollback();
            console.error('Transaction Error:', error);
            res.status(500).json({ success: false, message: error.message });
        } finally {
            pool.release();
        }
    } catch (error) {
        console.error('Database Connection Error:', error);
        res.status(500).json({ success: false, message: 'Database connection error', error: error.message });
    }
}
 