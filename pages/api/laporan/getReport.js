// pages/api/laporan/getReport.js
import db from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const query = `
            SELECT l.IDTransaksi, l.TglTransaksi, l.IDMenu, m.NamaMenu, l.JumlahPesan, l.SubTotal,
                   p.NamaPelanggan, e.NamaPegawai
            FROM laporantransaksi l
            JOIN transaksi t ON l.IDTransaksi = t.IDTransaksi
            JOIN pelanggan p ON t.IDPelanggan = p.IDPelanggan
            JOIN pegawai e ON t.IDPegawai = e.IDPegawai
            JOIN menu m ON l.IDMenu = m.IDMenu;
        `;

        const [rows] = await db.query(query);
        console.log(rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
