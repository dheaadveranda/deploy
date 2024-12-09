import db from '../../../lib/db'; // Adjust path as needed

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let pool;
    try {
        const {
            Transaksi,
            TglTransaksi,
            IDPegawai,
            IDPelanggan,
            Items,
            ReferralCode,
            UsePoints,
            MetodePembayaran,
        } = req.body;

        // Validasi data transaksi
        if (!Transaksi || !TglTransaksi || !IDPegawai || !IDPelanggan || !Items || Items.length === 0) {
            return res.status(400).json({ message: 'Invalid transaction data' });
        }

        pool = await db.getConnection();
        await pool.beginTransaction();

        console.log('Transaction started with data:', req.body); // Log transaksi data

        try {
            let TotalHarga = Items.reduce((sum, item) => sum + (item.SubTotal * item.JumlahPesan), 0);
            let discount = 0;
            let pointsToUse = 0;
            let updatedPelanggan = null;
            let PenggunaanPoin = pointsToUse || 0;
            
            // Cek apakah pelanggan memiliki cukup poin
            if (UsePoints) {
    // Cek apakah pelanggan memiliki poin yang cukup
    const PoinQuery = `SELECT TotalPoin FROM pelanggan WHERE IDPelanggan = ?`;
    const [poinResult] = await pool.execute(PoinQuery, [IDPelanggan]);
    console.log('Poin query result:', poinResult);

    if (poinResult.length === 0) {
        await pool.rollback();
        return res.status(400).json({ message: 'Customer not found' });
    }

    const totalPoin = poinResult[0]?.TotalPoin || 0;

    // Jika poin kurang dari 10, tidak bisa menggunakan poin
    if (totalPoin < 10) {
        await pool.rollback();
        return res.status(400).json({ message: 'Insufficient points for transaction' });
    }

    // Update poin pelanggan
    const updatePoinQuery = `UPDATE pelanggan SET TotalPoin = TotalPoin - 10 WHERE IDPelanggan = ?;`;
    const [updatePoinResult] = await pool.execute(updatePoinQuery, [IDPelanggan]);

    console.log('Points update result:', updatePoinResult);

    if (updatePoinResult.affectedRows === 0) {
        await pool.rollback();
        return res.status(500).json({ message: 'Failed to update customer points' });
    }

    // Ambil data pelanggan yang sudah terupdate
    const [updatedPelangganResult] = await pool.execute(
        `SELECT IDPelanggan, TotalPoin FROM pelanggan WHERE IDPelanggan = ?`, [IDPelanggan]
    );
    updatedPelanggan = updatedPelangganResult[0];  // Set pelanggan yang sudah terupdate

    pointsToUse = 10; // Menyimpan nilai poin yang digunakan
}


            // Proses kode referral jika ada
            if (ReferralCode) {
                const [referralResult] = await pool.execute(
                    `SELECT KuotaPenggunaan, IDPelanggan 
                    FROM referral 
                    WHERE KodeReferral = ?`,
                    [ReferralCode]
                );

                console.log('Referral code result:', referralResult); // Log referral result

                if (referralResult.length === 0) {
                    throw new Error('Referral code not found');
                }

                const { KuotaPenggunaan, IDPelanggan: OwnerID } = referralResult[0];

                if (KuotaPenggunaan >= 5) {
                    throw new Error('Referral code usage quota reached');
                }

                discount = 0.10;
                TotalHarga = TotalHarga * (1 - discount);

                await pool.execute(
                    `UPDATE referral SET KuotaPenggunaan = KuotaPenggunaan + 1 WHERE KodeReferral = ?`,
                    [ReferralCode]
                );

                await pool.execute(
                    `UPDATE pelanggan SET TotalPoin = TotalPoin + 1 WHERE IDPelanggan = ?`,
                    [IDPelanggan]
                );

                if (OwnerID.startsWith('CUST')) {
                    await pool.execute(
                        `UPDATE pelanggan SET TotalPoin = TotalPoin + 1 WHERE IDPelanggan = ?`,
                        [OwnerID]
                    );
                }
            }

            // Simpan transaksi utama
            console.log('starting transaksi');
            const [insertTransaksiResult] = await pool.execute(
                `INSERT INTO transaksi 
                (IDTransaksi, TglTransaksi, IDPegawai, IDPelanggan, TotalHarga, Discount, JumlahPesan, KodeReferral, MetodePembayaran, PenggunaanPoin)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    Transaksi,
                    TglTransaksi,
                    IDPegawai,
                    IDPelanggan,
                    TotalHarga,
                    discount,
                    Items.reduce((total, item) => total + item.JumlahPesan, 0),
                    ReferralCode || null,
                    MetodePembayaran,
                    PenggunaanPoin,
                ]
            );
            console.log("Insert Transaksi Result:", insertTransaksiResult);

            // Simpan detail transaksi per item
            for (const item of Items) {
                await pool.execute(
                    `INSERT INTO laporantransaksi 
                    (IDTransaksi, TglTransaksi, IDMenu, JumlahPesan, SubTotal)
                    VALUES (?, ?, ?, ?, ?)`,
                    [Transaksi, TglTransaksi, item.IDTransaksi, item.JumlahPesan, item.SubTotal]
                );
            }

            await pool.commit();
            console.log('Transaction committed successfully'); // Log commit success

            res.status(200).json({
                success: true,
                message: 'Transaction saved successfully',
                TotalHarga,
                Discount: discount,
                PointsUsed: pointsToUse,
                updatedPelanggan
            });
        } catch (error) {
            await pool.rollback();
            console.error('Transaction Error:', error); // Log error message
            res.status(500).json({ success: false, message: error.message });
        } finally {
            if (pool) pool.release();
        }
    } catch (error) {
        console.error('Handler Error:', error); // Log error message for the entire handler
        res.status(500).json({ success: false, message: error.message });
    }
}
