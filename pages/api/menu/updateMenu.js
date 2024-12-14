// pages/api/menu/updateMenu.js
import connection from '../../../lib/db';
import multer from 'multer';
import nextConnect from 'next-connect';
import path from 'path';
import fs from 'fs';

// Setup multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './public/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

const handler = nextConnect({
    onError(error, req, res) {
        res.status(500).json({ error: `Something went wrong: ${error.message}` });
    },
    onNoMatch(req, res) {
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    },
});

handler.use(upload.single('Gambar'));

handler.put((req, res) => {
    const { IDMenu, NamaMenu, HargaMenu, KategoriMenu } = req.body;
    const Gambar = req.file ? `uploads/${req.file.filename}` : null;

    if (!IDMenu || !NamaMenu || !HargaMenu || !KategoriMenu) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = Gambar
        ? 'UPDATE menu SET NamaMenu = ?, HargaMenu = ?, KategoriMenu = ?, Gambar = ? WHERE IDMenu = ?'
        : 'UPDATE menu SET NamaMenu = ?, HargaMenu = ?, KategoriMenu = ? WHERE IDMenu = ?';

    const values = Gambar
        ? [NamaMenu, HargaMenu, KategoriMenu, Gambar, IDMenu]
        : [NamaMenu, HargaMenu, KategoriMenu, IDMenu];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating menu:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Menu not found' });
        }

        res.status(200).json({ message: 'Menu updated successfully!' });
    });
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;
