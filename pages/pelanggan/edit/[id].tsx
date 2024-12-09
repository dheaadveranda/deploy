// pages/pelanggan/edit/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../../components/Sidebar'; 
import styles from '../../../style/pelanggan/pelangganAdd.module.css'; 

interface Customer {
    IDPelanggan: string;
    NamaPelanggan: string;
    NoHP: string;
    Email: string;
    Alamat: string;
    TglDaftar: string;
    TotalPoin: string;
}

const EditPelanggan: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Mengambil ID dari URL
    const [customer, setCustomer] = useState<Customer | null>(null); // State untuk pelanggan

    useEffect(() => {
        const fetchPelangganDetail = async () => {
            const response = await fetch(`/api/pelanggan/getCustomer?id=${id}`);
            if (response.ok) {
                const data = await response.json();
                setCustomer(data);
            } else {
                console.error('Failed to fetch pelanggan details');
            }
        };

        const fetchUserRole = async () => {
            const response = await fetch('/api/authUser'); // Ambil role pengguna
            if (response.ok) {

            }
        };

        if (id) {
            fetchPelangganDetail(); 
            fetchUserRole(); // Ambil role pengguna saat ID tersedia
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (customer) {
            setCustomer({
                ...customer,
                [e.target.name]: e.target.value // Update sesuai input yang diubah
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const response = await fetch(`/api/pelanggan/updateCustomer`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customer), // Menyimpan data pelanggan yang diubah
        });
    
        if (response.ok) {
            alert('Pelanggan berhasil diubah');
            router.push('/pelanggan'); // Kembali ke halaman pelanggan setelah berhasil
        } else {
            const error = await response.json();
            alert(`Gagal mengubah pelanggan: ${error.error}`);
            console.error('Gagal', error);
        }
    };

    if (!customer) return <div>Loading...</div>; // Tampilkan loading jika data belum siap

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Pelanggan" onMenuClick={() => { }}/>
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Pelanggan</h1>
                <hr className={styles.separator} />
                <h2 className={styles.pelangganTitle}>Detail Pelanggan</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <label>ID Pelanggan</label>
                        <input
                            type="text"
                            value={customer.IDPelanggan}
                            readOnly // ID seharusnya tidak dapat diedit
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Nama Pelanggan</label>
                        <input
                            type="text"
                            name="NamaPelanggan"
                            value={customer.NamaPelanggan}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>No HP:</label>
                        <input
                            type="text"
                            name="NoHP"
                            value={customer.NoHP}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Email</label>
                        <input
                            type="text"
                            name="Email"
                            value={customer.Email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Alamat</label>
                        <input
                            type="text"
                            name="Alamat"
                            value={customer.Alamat}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Tanggal Bergabung:</label>
                        <input
                            type="date"
                            name="TglDaftar"
                            value={customer.TglDaftar.split('T')[0]} // Format YYYY-MM-DD
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Total Poin</label>
                        <input
                            type="text"
                            name="TotalPoin"
                            value={customer.TotalPoin}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.saveButton}>Simpan</button>
                        <button type="button" onClick={() => router.push('/pelanggan')} className={styles.cancelButton}>Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPelanggan;
