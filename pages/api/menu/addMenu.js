import formidable from 'formidable';
import db from '../../../lib/db';

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = formidable({
      uploadDir: './public/uploads', // Folder tujuan
      keepExtensions: true, // Simpan ekstensi file
      maxFileSize: 5 * 1024 * 1024, // Maksimal ukuran file 5MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      console.log('Fields received by formidable:', fields);
      console.log('Files received by formidable:', files);

      const id = fields.id?.[0];
      const name = fields.name?.[0];
      const price = fields.price?.[0];
      const category = fields.category?.[0];

      // Handle the image
      const image = files.image && files.image[0]
        ? `/uploads/${files.image[0].newFilename}` // Path yang benar, tanpa "public"
        : '/uploads/default.jpg'; // Default jika tidak ada gambar

      // Validate required fields
      if (!id || !name || !price || !category) {
        return res.status(400).json({ error: 'Semua field wajib diisi!' });
      }

      // Ensure price is a valid number
      const priceValue = parseFloat(price);
      if (isNaN(priceValue)) {
        return res.status(400).json({ error: 'Harga harus berupa angka!' });
      }

      try {
        // Insert data into the database
        const query = `
          INSERT INTO menu (IDMenu, NamaMenu, HargaMenu, KategoriMenu, Gambar)
          VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [id, name, priceValue, category, image]);

        console.log('Hasil insert:', result); // Debugging log

        res.status(201).json({ message: 'Menu berhasil ditambahkan!' });
      } catch (dbError) {
        console.error('Database error detail:', dbError);
        res.status(500).json({ error: dbError.sqlMessage || 'Database error' });
      }
    });
  } else {
    // Handle unsupported methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
