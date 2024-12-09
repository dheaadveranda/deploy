// pages/api/login.js
import pool from '../../lib/db'; // pastikan ini mengarah ke file db.js yang benar

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        try {
            // Gunakan pool.query dengan async/await
            const [results] = await pool.query('SELECT * FROM pegawai WHERE Username = ? AND Password = ?', [username, password]);

            if (results.length > 0) {
                const user = results[0]; // Ambil data user
                console.log(user);
                return res.status(200).json({
                    username: user.Username,
                    role: user.Peran // Kirim kembali peran pengguna
                });
            } else {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`); // Menanggapi jika ada request selain POST
    }
}
