import db from '../../../lib/db'; // Sesuaikan path dengan konfigurasi proyek Anda

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const pool = await db.getConnection();
    let transactionStarted = false; // Flag untuk memastikan rollback hanya dilakukan jika transaksi dimulai

    try {
        // Validasi input
        const { Transaksi, IDPegawai, IDPelanggan, Items, ReferralCode, TotalPoin } = req.body;
        const TglTransaksi = new Date().toISOString().replace('T', ' ').split('.')[0];

        if (!Transaksi || !IDPegawai || !IDPelanggan || !Items || Items.length === 0) {
            return res.status(400).json({ message: 'Invalid transaction data' });
        }

        // Hitung Total Harga
        let TotalHarga = Items.reduce((sum, item) => sum + (item.SubTotal * item.JumlahPesan), 0);
        let discount = 0; // Default tanpa diskon
        let metodePembayaran = 'Cash';
        let finalReferralCode = ReferralCode || null;

        // Mulai transaksi database
        await pool.beginTransaction();
        transactionStarted = true;

        // Proses pembayaran dengan poin
        if (TotalPoin && TotalPoin >= 10) {
            const poinQuery = `
                SELECT TotalPoin
                FROM pelanggan
                WHERE IDPelanggan = ?
            `;
            const [poinResult] = await pool.execute(poinQuery, [IDPelanggan]);

            if (poinResult.length === 0 || poinResult[0].TotalPoin < 10) {
                throw new Error('Poin tidak mencukupi!');
            }

            const updatePoinQuery = `
                UPDATE pelanggan
                SET TotalPoin = TotalPoin - 10
                WHERE IDPelanggan = ?
            `;
            await pool.execute(updatePoinQuery, [IDPelanggan]);
            metodePembayaran = 'Poin';
        }

        // Proses kode referral
        if (ReferralCode) {
            const referralQuery = `
                SELECT KuotaPenggunaan, IDPelanggan
                FROM referral
                WHERE KodeReferral = ?
            `;
            const [referralResult] = await pool.execute(referralQuery, [ReferralCode]);

            if (referralResult.length === 0) {
                throw new Error('Referral code not found');
            }

            const { KuotaPenggunaan, IDPelanggan: OwnerID } = referralResult[0];
            if (KuotaPenggunaan >= 5) {
                // Generate kode referral baru
                const newReferralCode = `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                const insertNewReferralQuery = `
                    INSERT INTO referral (KodeReferral, KuotaPenggunaan, IDPelanggan)
                    VALUES (?, ?, ?)
                `;
                await pool.execute(insertNewReferralQuery, [newReferralCode, 0, OwnerID]);

                return res.status(200).json({
                    message: 'Referral code has reached its maximum usage. A new referral code has been generated.',
                    newReferralCode
                });
            }

            // Terapkan diskon
            discount = 0.10; // Diskon 10%
            TotalHarga = TotalHarga * (1 - discount);

            // Update kuota referral
            const updateReferralQuery = `
                UPDATE referral
                SET KuotaPenggunaan = KuotaPenggunaan + 1
                WHERE KodeReferral = ?
            `;
            await pool.execute(updateReferralQuery, [ReferralCode]);

            // Tambahkan poin ke pengguna dan pemilik referral
            const updatePelangganQuery = `
                UPDATE pelanggan
                SET TotalPoin = TotalPoin + 1
                WHERE IDPelanggan = ?
            `;
            await pool.execute(updatePelangganQuery, [IDPelanggan]);
            if (OwnerID.startsWith('CUST')) {
                await pool.execute(updatePelangganQuery, [OwnerID]);
            }
        }

        // Simpan transaksi
        const insertTransaksiQuery = `
            INSERT INTO transaksi
            (IDTransaksi, TglTransaksi, IDPegawai, IDPelanggan, TotalHarga, Discount, JumlahPesan, KodeReferral, PenggunaanPoin, MetodePembayaran)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const totalJumlahPesan = Items.reduce((total, item) => total + item.JumlahPesan, 0);
        await pool.execute(insertTransaksiQuery, [
            Transaksi,
            TglTransaksi,
            IDPegawai,
            IDPelanggan,
            TotalHarga,
            discount,
            totalJumlahPesan,
            finalReferralCode,
            TotalPoin || 0,
            metodePembayaran
        ]);

        // Simpan detail transaksi
        const insertLaporanTransaksiQuery = `
            INSERT INTO laporantransaksi
            (IDTransaksi, TglTransaksi, IDMenu, JumlahPesan, SubTotal)
            VALUES (?, ?, ?, ?, ?)
        `;
        for (const item of Items) {
            const { IDTransaksi, JumlahPesan, SubTotal } = item;
            if (!IDTransaksi || JumlahPesan === undefined || SubTotal === undefined) {
                console.warn('Invalid item data:', item);
                continue;
            }
            await pool.execute(insertLaporanTransaksiQuery, [
                Transaksi,
                TglTransaksi,
                IDTransaksi,
                JumlahPesan,
                SubTotal
            ]);
        }

        // Commit transaksi
        await pool.commit();
        res.status(200).json({
            success: true,
            message: 'Transaction saved successfully',
            TotalHarga,
            Discount: discount
        });
    } catch (error) {
        if (transactionStarted) {
            await pool.rollback();
        }
        console.error('Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred during the transaction.',
            error: error.message
        });
    } finally {
        pool.release();
    }
}
