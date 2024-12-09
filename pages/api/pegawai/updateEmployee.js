import pool from '../../../lib/db'; // Pastikan jalur ini benar

export default async function handler(req, res) {
    const { id } = req.query; // Ambil ID dari query parameter

    if (req.method === 'PUT') {
        const { NamaPegawai, NoHP, Peran, Email, Alamat, TglBergabung, Username, Password } = req.body; // Ambil data dari body

        // Pastikan ID pegawai ada di query
        if (!id) {
            return res.status(400).json({ error: 'IDPegawai is required' });
        }

        try {
            // Ambil data pegawai saat ini berdasarkan ID
            const [currentData] = await pool.query('SELECT * FROM pegawai WHERE IDPegawai = ?', [id]);

            if (currentData.length === 0) {
                return res.status(404).json({ error: 'Employee not found' }); // Jika pegawai tidak ditemukan
            }

            // Ambil data lama (currentData) dan periksa nilai baru (req.body)
            const updatedData = {
                NamaPegawai: NamaPegawai || currentData[0].NamaPegawai,
                NoHP: NoHP || currentData[0].NoHP,
                Peran: Peran || currentData[0].Peran,
                Email: Email || currentData[0].Email,
                Alamat: Alamat || currentData[0].Alamat,
                TglBergabung: TglBergabung || currentData[0].TglBergabung,
                Username: Username || currentData[0].Username,
                Password: Password || currentData[0].Password // Update password jika ada nilai baru
            };

            console.log("Updated Data:", updatedData);  // Log updatedData untuk debugging

            // Query untuk melakukan pembaruan data pegawai
            const query = `
                UPDATE pegawai
                SET NamaPegawai = ?, NoHP = ?, Peran = ?, Email = ?, Alamat = ?, TglBergabung = ?, Username = ?, Password = ?
                WHERE IDPegawai = ?
            `;
            const values = [
                updatedData.NamaPegawai,
                updatedData.NoHP,
                updatedData.Peran,
                updatedData.Email,
                updatedData.Alamat,
                updatedData.TglBergabung,
                updatedData.Username,
                updatedData.Password,
                id
            ];

            // Menjalankan query
            const [results] = await pool.query(query, values);

            console.log("Query Results:", results); // Log results untuk melihat affectedRows

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Employee not found' }); // Jika tidak ada yang diupdate
            }

            return res.status(200).json({ message: 'Employee updated successfully!' }); // Jika berhasil
        } catch (err) {
            console.error('Error updating employee:', err); // Logging error
            return res.status(500).json({ error: 'Failed to update employee' });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`); // Jika metode selain PUT dipanggil
    }
}


