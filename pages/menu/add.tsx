import { useState } from 'react';
import { useRouter } from 'next/router';

const AddMenu: React.FC = () => {
  const [idMenu, setIdMenu] = useState('');
  const [namaMenu, setNamaMenu] = useState('');
  const [harga, setHarga] = useState('');
  const [kategori, setKategori] = useState('Coffee');
  const [gambar, setGambar] = useState<File | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setGambar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idMenu.trim()) {
      alert('ID Menu wajib diisi!');
      return;
    }

    const categoryPrefix = kategori === 'Coffee' ? 'MNUC' :
      kategori === 'Food' ? 'MNUF' :
        kategori === 'Signature Drink' ? 'MNUS' :
          kategori === 'Milkbased' ? 'MNUM' :
            kategori === 'Tea' ? 'MNUT' : '';

    const idRegex = new RegExp(`^${categoryPrefix}\\d{4}$`);
    if (!idRegex.test(idMenu)) {
      alert(`ID Menu harus sesuai format: ${categoryPrefix}XXXX`);
      return;
    }

    // Validasi harga untuk memastikan harga yang dimasukkan adalah angka
    const parsedPrice = parseFloat(harga);
    if (isNaN(parsedPrice)) {
      alert('Harga harus berupa angka yang valid!');
      return;
    }

    const formData = new FormData();
    formData.append('id', idMenu.trim());
    formData.append('name', namaMenu.trim());
    formData.append('price', parsedPrice.toString());
    formData.append('category', kategori.trim());
    if (gambar) {
      formData.append('image', gambar); // Kirim file gambar dengan nama 'image'
    }

    console.log('FormData Contents:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });


    const res = await fetch('/api/menu/addMenu', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('Menu berhasil ditambahkan!');
      router.push('/menu');
    } else {
      const error = await res.json();
      alert(`Gagal menambahkan menu: ${error.error}`);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
      <h1 style={{ textAlign: 'center' }}>Tambah Menu</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* ID Menu */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="idMenu">ID Menu</label>
          <input
            type="text"
            id="idMenu"
            value={idMenu}
            onChange={(e) => setIdMenu(e.target.value)}
            placeholder="Masukkan ID Menu"
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>

        {/* Nama Menu */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="namaMenu">Nama Menu</label>
          <input
            type="text"
            id="namaMenu"
            value={namaMenu}
            onChange={(e) => setNamaMenu(e.target.value)}
            placeholder="Masukkan Nama Menu"
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>

        {/* Harga */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="harga">Harga</label>
          <input
            type="number"
            id="harga"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            placeholder="Masukkan Harga"
            required
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>

        {/* Kategori */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="kategori">Kategori</label>
          <select
            id="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          >
            <option value="Coffee">Coffee</option>
            <option value="Food">Food</option>
            <option value="Signature Drink">Signature Drink</option>
            <option value="Milkbased">Milkbased</option>
            <option value="Tea">Tea</option>
          </select>
        </div>

        {/* Upload Gambar */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="gambar">Upload Gambar</label>
          <input
            type="file"
            id="gambar"
            accept="image/*"
            name="gambar"
            onChange={handleFileChange}
            style={{ width: '100%', marginTop: '5px' }}
          />
        </div>

        {/* Tombol Simpan dan Batal */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="submit"
            style={{
              background: 'green',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => router.push('/menu')}
            style={{
              background: 'red',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMenu;
