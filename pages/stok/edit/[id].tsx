// pages/stok/edit/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../../components/Sidebar';
import styles from '../../../style/stok/stokAdd.module.css';

interface Stok {
    IDBahan: string;
    NamaBahan: string;
    Jumlah: string;
    Satuan: string;
    Keterangan: string;
}

const EditStok: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Mengambil ID dari URL
    const [stok, setStok] = useState<Stok | null>(null); // State untuk stok

    useEffect(() => {
        const fetchStokDetail = async () => {
            const response = await fetch(`/api/stok/getStok?id=${id}`);
            if (response.ok) {
                const data = await response.json();
                setStok(data);
            } else {
                console.error('Failed to fetch stok details');
            }
        };

        const fetchUserRole = async () => {
            const response = await fetch('/api/authUser'); // Ambil role pengguna
            if (response.ok) {

            }
        };

        if (id) {
            fetchStokDetail();
            fetchUserRole(); // Ambil role pengguna saat ID tersedia
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (stok) {
            setStok({
                ...stok,
                [e.target.name]: e.target.value // Update sesuai input yang diubah
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch(`/api/stok/updateStok?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(stok), // Mengirim data stok yang diubah
        });

        if (response.ok) {
            alert('Stok berhasil diubah');
            router.push('/stok'); // Kembali ke halaman stok setelah berhasil
        } else {
            alert('Gagal mengubah stok');
        }
    };

    if (!stok) return <div>Loading...</div>; // Tampilkan loading jika data belum siap

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Stok" onMenuClick={() => { }}/>
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Edit Stok</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <label>ID Bahan</label>
                        <input
                            type="text"
                            value={stok.IDBahan}
                            readOnly // ID seharusnya tidak dapat diedit
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Nama Bahan</label>
                        <input
                            type="text"
                            name="NamaBahan"
                            value={stok.NamaBahan}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Jumlah</label>
                        <input
                            type="text"
                            name="Jumlah"
                            value={stok.Jumlah}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Satuan</label>
                        <input
                            type="text"
                            name="Satuan"
                            value={stok.Satuan}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Keterangan</label>
                        <input
                            type="text"
                            name="Keterangan"
                            value={stok.Keterangan}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.saveButton}>Simpan</button>
                        <button type="button" onClick={() => router.push('/stok')} className={styles.cancelButton}>Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStok;