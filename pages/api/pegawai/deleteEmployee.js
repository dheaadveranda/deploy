// pages/api/deleteEmployee.js
import connection from '../../../lib/db'; // Mengimpor koneksi ke database

export default function handler(req, res) {
    const { id } = req.query; // Mendapatkan ID dari parameter query

    if (req.method === 'DELETE') { // Memastikan hanya menerima metode DELETE
        connection.query('DELETE FROM pegawai WHERE IDPegawai = ?', [id], (err, results) => {
            if (err) {
                console.error('Error deleting employee:', err);
                return res.status(500).json({ error: 'Database query failed' });
            }
            if (results.affectedRows > 0) { // Memeriksa apakah ada pegawai yang dihapus
                return res.status(200).json({ message: 'Employee deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Employee not found' });
            }
        });
    } else {
        res.setHeader('Allow', ['DELETE']); // Mengatur metode yang diizinkan
        return res.status(405).end(`Method ${req.method} Not Allowed`); // Mengembalikan status metode tidak diperbolehkan
    }
}
