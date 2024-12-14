import { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar'; 
import styles from '../../style/menu/menuAdd.module.css';

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
      formData.append('image', gambar);
    }

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
    <div className={styles.container}>
      <Sidebar activeMenu="Menu" onMenuClick={() => { }} />
      <div className={styles.main}>
        <h1 className={styles.pageTitle}>Tambah Menu</h1>
        <hr className={styles.separator} />
        <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.form}>
          {/* ID Menu */}
          <div className={styles.inputGroup}>
            <label htmlFor="idMenu">ID Menu</label>
            <input
              type="text"
              id="idMenu"
              value={idMenu}
              onChange={(e) => setIdMenu(e.target.value)}
              placeholder="Masukkan ID Menu"
              required
              className={styles.input}
            />
          </div>

          {/* Nama Menu */}
          <div className={styles.inputGroup}>
            <label htmlFor="namaMenu">Nama Menu</label>
            <input
              type="text"
              id="namaMenu"
              value={namaMenu}
              onChange={(e) => setNamaMenu(e.target.value)}
              placeholder="Masukkan Nama Menu"
              required
              className={styles.input}
            />
          </div>

          {/* Harga */}
          <div className={styles.inputGroup}>
            <label htmlFor="harga">Harga</label>
            <input
              type="number"
              id="harga"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              placeholder="Masukkan Harga"
              required
              className={styles.input}
            />
          </div>

          {/* Kategori */}
          <div className={styles.inputGroup}>
            <label htmlFor="kategori">Kategori</label>
            <select
              id="kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className={styles.select}
            >
              <option value="Coffee">Coffee</option>
              <option value="Food">Food</option>
              <option value="Signature Drink">Signature Drink</option>
              <option value="Milkbased">Milkbased</option>
              <option value="Tea">Tea</option>
            </select>
          </div>

          {/* Upload Gambar */}
          <div className={styles.inputGroup}>
            <label htmlFor="gambar">Upload Gambar</label>
            <input
              type="file"
              id="gambar"
              accept="image/*"
              name="gambar"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>

          {/* Tombol Simpan dan Batal */}
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.saveButton}
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => router.push('/menu')}
              className={styles.cancelButton}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMenu;
