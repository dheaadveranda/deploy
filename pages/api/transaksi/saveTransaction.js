//saveTrasanction.js
import db from '../../../lib/db'; // Sesuaikan path dengan konfigurasi proyek Anda

export default async function handler(req, res) {
    const pool = await db.getConnection();
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // const { Transaksi, TglTransaksi, IDPegawai, IDPelanggan, Items, ReferralCode, TotalPoin } = req.body;
        const TglTransaksi = new Date().toISOString().replace('T', ' ').split('.')[0];
        const { Transaksi, IDPegawai, IDPelanggan, Items, ReferralCode, TotalPoin } = req.body;

        if (!Transaksi || !TglTransaksi || !IDPegawai || !IDPelanggan || !Items || Items.length === 0) {
            return res.status(400).json({ message: 'Invalid transaction data' });
        }

        let TotalHarga = Items.reduce((sum, item) => sum + (item.SubTotal * item.JumlahPesan), 0);
        let discount = 0; // Default tanpa diskon
        let metodePembayaran = 'Cash'

        try {
            await pool.beginTransaction();
            let finalpoin = 10;
            metodePembayaran = 'Poin'
            if (TotalPoin && TotalPoin >= 10) {
                const poinquery = `
                    SELECT TotalPoin
                    FROM pelanggan
                    WHERE IDPelanggan = ?
                `;
                const [poinResult] = await pool.execute(poinquery, [IDPelanggan]);

                if (poinResult.length === 0) {
                    await pool.rollback();
                    return res.status(400).json({ message: 'Referral code not found' });
                }

                if (poinResult[0].TotalPoin < 10) {
                    await pool.rollback();
                    return res.status(400).json({ message: 'Poin tidak mencukupi!' });
                }

                const updatePoinQuery = `
                    UPDATE pelanggan
                    SET TotalPoin = TotalPoin - 10
                    WHERE IDPelanggan = ?
                `;
                await pool.execute(updatePoinQuery, [IDPelanggan]);
                console.log(`Mengurangi 10 poin untuk pelanggan: ${IDPelanggan}`);

                // Proses kode referral jika ada
                let finalReferralCode = ReferralCode || null;
                if (ReferralCode) {
                    const referralQuery = `
                    SELECT KuotaPenggunaan, IDPelanggan
                    FROM referral
                    WHERE KodeReferral = ?
                `;
                    const [referralResult] = await pool.execute(referralQuery, [ReferralCode]);

                    if (referralResult.length === 0) {
                        await pool.rollback();
                        return res.status(400).json({ message: 'Referral code not found' });
                    }

                    const { KuotaPenggunaan, IDPelanggan: OwnerID } = referralResult[0];

                    if (KuotaPenggunaan >= 5) {
                        // Jika kuota referral sudah penuh, kirimkan pesan kesalahan
                        console.log('Referral code has reached its maximum usage. Generating new referral code...');

                        // Generate kode referral baru
                        const newReferralCode = `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                        console.log('New Referral Code:', newReferralCode);
                        let kuota = 0
                        // Simpan kode referral baru ke dalam database
                        const insertNewReferralQuery = `
                        INSERT INTO referral (KodeReferral, KuotaPenggunaan, IDPelanggan)
                        VALUES (?, ?, ?)
                    `;
                        await pool.execute(insertNewReferralQuery, [newReferralCode, kuota, OwnerID]);

                        // Kirimkan response dengan kode referral baru
                        return res.status(200).json({
                            message: 'Referral code has reached its maximum usage. A new referral code has been generated.',
                            newReferralCode: newReferralCode // Kode referral baru yang sudah dibuat
                        });
                    }

                    // Terapkan diskon jika kode referral valid
                    discount = 0.10; // Diskon 10%
                    TotalHarga = TotalHarga * (1 - discount);

                    // Update kuota referral
                    const updateReferralQuery = `
                    UPDATE referral
                    SET KuotaPenggunaan = KuotaPenggunaan + 1
                    WHERE KodeReferral = ?
                `;
                    await pool.execute(updateReferralQuery, [ReferralCode]);

                    // Tambahkan poin ke pelanggan yang menggunakan kode referral
                    const updatePelangganQuery = `
                    UPDATE pelanggan
                    SET TotalPoin = TotalPoin + 1
                    WHERE IDPelanggan = ?
                `;
                    await pool.execute(updatePelangganQuery, [IDPelanggan]);

                    // Tambahkan poin ke pemilik kode referral
                    if (OwnerID.startsWith('CUST')) {
                        await pool.execute(updatePelangganQuery, [OwnerID]);
                    }
                }

                const totalJumlahPesan = Items.reduce((total, item) => {
                    // Pastikan item valid sebelum dihitung
                    if (item.JumlahPesan !== undefined) {
                        return total + item.JumlahPesan;
                    }
                    return total;
                }, 0);

                // Simpan transaksi
                const insertTransaksiQuery = `
                INSERT INTO transaksi
                (IDTransaksi, TglTransaksi, IDPegawai, IDPelanggan, TotalHarga, Discount, JumlahPesan, KodeReferral, PenggunaanPoin, MetodePembayaran)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
                // const TglTransaksi = new Date().toISOString().replace('T', ' ').split('.')[0];
                await pool.execute(insertTransaksiQuery, [
                    Transaksi,
                    TglTransaksi,
                    IDPegawai,
                    IDPelanggan,
                    TotalHarga,
                    discount,
                    totalJumlahPesan,
                    finalReferralCode || null, // Gunakan kode referral yang sudah diset atau null
                    finalpoin,
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
                        console.error('Invalid item:', item);
                        continue; // Skip item yang tidak valid
                    }

                    // const TglTransaksi = new Date().toISOString().replace('T', ' ').split('.')[0];
                    await pool.execute(insertLaporanTransaksiQuery, [
                        Transaksi,
                        TglTransaksi,
                        IDTransaksi,
                        JumlahPesan,
                        SubTotal,
                    ]);
                }

                await pool.commit();
                res.status(200).json({
                    success: true,
                    message: 'Transaction saved successfully',
                    TotalHarga,
                    Discount: discount
                });

            }
        }
        catch (error) {
            await pool.rollback();
            console.error('Transaction Error:', error);
            res.status(500).json({
                success: false,
                message: error.message,
                error: error.message
            });
        } finally {
            pool.release();
        }
    } catch (error) {
        await pool.rollback();
        console.error('Database Connection Error:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection error',
            error: error.message
        });
    } finally {
        pool.release();
    }
}