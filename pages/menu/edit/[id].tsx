/* pages/menu/edit/[id].tsx */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../../components/Sidebar';
import styles from '../../../style/menu/menuAdd.module.css';

interface Menu {
    IDMenu: string;
    NamaMenu: string;
    HargaMenu: string;
    KategoriMenu: string;
    Gambar?: string;
}

const EditMenu: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [menu, setMenu] = useState<Menu | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the selected file

    useEffect(() => {
        const fetchMenuDetail = async () => {
            const response = await fetch(`/api/menu/getMenu?id=${id}`);
            if (response.ok) {
                const data = await response.json();
                setMenu(data);
            } else {
                console.error('Failed to fetch menu details');
            }
        };

        if (id) {
            fetchMenuDetail();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (menu) {
            setMenu({
                ...menu,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]); // Set selected file to state
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('IDMenu', menu?.IDMenu || '');
        formData.append('NamaMenu', menu?.NamaMenu || '');
        formData.append('HargaMenu', menu?.HargaMenu || '');
        formData.append('KategoriMenu', menu?.KategoriMenu || '');
        if (selectedFile) {
            formData.append('Gambar', selectedFile); // Append the image file
        }

        const response = await fetch(`/api/menu/updateMenu`, {
            method: 'PUT',
            body: formData,
        });

        console.log(response);

        if (response.ok) {
            await router.push('/menu');  // Navigasi terlebih dahulu
            alert('Menu berhasil diubah');  // Kemudian tampilkan alert
            console.log('Navigated to /menu');
        } else {
            alert('Gagal mengubah menu');
        }
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     const response = await fetch(`/api/menu/updateMenu`, {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(menu), // Menyimpan data menu yang diubah
    //     });

    //     if (response.ok) {
    //         alert('Menu berhasil diubah');
    //         router.push('/menu'); // Kembali ke halaman menu
    //     } else {
    //         const error = await response.json();
    //         alert(`Gagal mengubah menu: ${error.error}`);
    //         console.error('Gagal', error);
    //     }
    // };

    if (!menu) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Menu" onMenuClick={() => { }} />
            <div className={styles.main}>
                <h2 className={styles.editMenuTitle}>Edit Menu</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>ID Menu</label>
                        <input
                            type="text"
                            value={menu.IDMenu}
                            readOnly
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Nama Menu</label>
                        <input
                            type="text"
                            name="NamaMenu"
                            value={menu.NamaMenu}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Harga</label>
                        <input
                            type="text"
                            name="HargaMenu"
                            value={menu.HargaMenu}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Kategori</label>
                        <select
                            name="KategoriMenu"
                            value={menu.KategoriMenu}
                            onChange={handleChange}
                            required
                            className={styles.select}
                        >
                            <option value="Coffee">Coffee</option>
                            <option value="Food">Food</option>
                            <option value="Milkbased">Milkbased</option>
                            <option value="Signature Drink">Signature Drink</option>
                            <option value="Tea">Tea</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Gambar</label>
                        {menu.Gambar && (
                            <div className={styles.previewContainer}>
                                <img
                                    src={menu.Gambar}
                                    alt="Preview Gambar"
                                    className={styles.previewImage}
                                />
                                <p>Recent</p> {/* Menunjukkan gambar terakhir yang diupload */}
                            </div>
                        )}
                        <input
                            type="file"
                            name="Gambar"
                            onChange={handleFileChange}
                            accept="image/*"
                            className={styles.fileInput}
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.saveButton}>Simpan</button>
                        <button type="button" onClick={() => router.push('/menu')} className={styles.cancelButton}>Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMenu;
