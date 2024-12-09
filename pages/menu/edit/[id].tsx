// pages/menu/edit/[id].tsx
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

        const fetchUserRole = async () => {
            const response = await fetch('/api/authUser');
            if (response.ok) {
            }
        };

        if (id) {
            fetchMenuDetail();
            fetchUserRole();
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

        if (response.ok) {
            alert('Menu berhasil diubah');
            router.push('/menu');
        } else {
            alert('Gagal mengubah menu');
        }
    };

    if (!menu) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Menu" onMenuClick={() => { }}/>
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Menu</h1>
                <hr className={styles.separator} />
                <h2 className={styles.editMenuTitle}>Edit Menu</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className={styles.inputContainer}>
                        <label>ID Menu</label>
                        <input
                            type="text"
                            value={menu.IDMenu}
                            readOnly
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Nama Menu</label>
                        <input
                            type="text"
                            name="NamaMenu"
                            value={menu.NamaMenu}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Harga</label>
                        <input
                            type="text"
                            name="HargaMenu"
                            value={menu.HargaMenu}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Kategori</label>
                        <select
                            name="KategoriMenu"
                            value={menu.KategoriMenu}
                            onChange={handleChange}
                            required
                        >
                            <option value="Coffee">Coffee</option>
                            <option value="Food">Food</option>
                            <option value="Milkbased">Milkbased</option>
                            <option value="Signature Drink">Signature Drink</option>
                            <option value="Tea">Tea</option>
                        </select>
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Gambar</label>
                        {menu.Gambar && (
                            <div className={styles.previewContainer}>
                                <img 
                                    src={`/uploads/${menu.Gambar}`} 
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
                            accept="image/*" // Hanya biarkan tipe file gambar
                            className={styles.fileInput} // Anda bisa menambahkan style baru jika ingin pada input file
                        />
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.saveButton}>Simpan</button>
                        <button type="button" onClick={() => router.push('/menu')} className={styles.cancelButton}>Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMenu;
