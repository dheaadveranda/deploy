// pages/api/getMenu.js
import db from '../../../lib/db';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            if (!id) {
                const [results] = await db.query('SELECT * FROM menu');
                return res.status(200).json(results);
            }

            const [results] = await db.query('SELECT * FROM menu WHERE IDMenu = ?', [id]);
            if (results.length === 0) {
                return res.status(404).json({ error: 'Menu not found' });
            }

            const menu = results[0];

            if (menu.Gambar) {
                // Jika path sudah lengkap (dimulai dengan '/public/uploads/'), ubah menjadi '/uploads/'
                if (menu.Gambar.startsWith('/public/uploads/')) {
                    menu.Gambar = `/uploads/${menu.Gambar}`;
                } else if (!menu.Gambar.startsWith('/uploads/')) {
                    // Jika hanya berupa nama file, tambahkan '/uploads/'
                    menu.Gambar = `/uploads/${menu.Gambar}`;
                }
            }          
            console.log('Nama File Gambar before:', menu.Gambar);             

            res.status(200).json(menu);
        } catch (err) {
            console.error('Error fetching menu:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
