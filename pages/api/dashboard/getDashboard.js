import db from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Query Pendapatan per Bulan
        const revenueQuery = `
            SELECT
                YEAR(TglTransaksi) AS year,
                MONTH(TglTransaksi) AS month,
                SUM(TotalHarga) AS totalRevenue
            FROM transaksi
            GROUP BY YEAR(TglTransaksi), MONTH(TglTransaksi)
            ORDER BY year DESC, month DESC;
        `;

        const [revenueData] = await db.query(revenueQuery);

        // Query Menu Terlaris
        const bestSellingMenuQuery = `
            SELECT
                m.NamaMenu,
                SUM(l.JumlahPesan) AS totalSold
            FROM laporantransaksi l
            JOIN menu m ON l.IDMenu = m.IDMenu
            GROUP BY m.NamaMenu
            ORDER BY totalSold DESC
            LIMIT 1;
        `;
        
        const [bestSellingMenu] = await db.query(bestSellingMenuQuery);

        // Query Jumlah Transaksi per Bulan
        const transactionsQuery = `
            SELECT
                YEAR(TglTransaksi) AS year,
                MONTH(TglTransaksi) AS month,
                COUNT(*) AS totalTransactions
            FROM transaksi
            GROUP BY YEAR(TglTransaksi), MONTH(TglTransaksi)
            ORDER BY year DESC, month DESC;
        `;
        
        const [transactionsData] = await db.query(transactionsQuery);

        // Jumlah Pelanggan
        const customerCountQuery = `SELECT COUNT(*) AS totalCustomers FROM pelanggan`;
        const [customerData] = await db.query(customerCountQuery);

        // Kirimkan data ke frontend
        res.status(200).json({
            revenueData,
            bestSellingMenu,
            transactionsData,
            totalCustomers: customerData[0].totalCustomers,
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
