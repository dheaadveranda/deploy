import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../../components/Sidebar';
import styles from '../../../style/pelanggan/pelangganAdd.module.css'; // Menggunakan CSS yang sama

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
    const { id } = router.query;
    const [customer, setCustomer] = useState<Customer | null>(null);

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

        if (id) {
            fetchPelangganDetail();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (customer) {
            setCustomer({
                ...customer,
                [e.target.name]: e.target.value // Update field sesuai input
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
            router.push('/pelanggan'); // Kembali ke halaman pelanggan
        } else {
            const error = await response.json();
            alert(`Gagal mengubah pelanggan: ${error.error}`);
            console.error('Gagal', error);
        }
    };

    if (!customer) return <div>Loading...</div>;

    return (
        <div className={styles.main}>
            <Sidebar activeMenu="Pelanggan" onMenuClick={() => { }} />
            <div className={styles.content}>
                <h1 className={styles.pageTitle}>Edit Pelanggan</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label>ID Pelanggan</label>
                        <input
                            type="text"
                            value={customer.IDPelanggan}
                            readOnly // ID tidak bisa diedit
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Nama Pelanggan</label>
                        <input
                            type="text"
                            name="NamaPelanggan"
                            value={customer.NamaPelanggan}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>No HP</label>
                        <input
                            type="text"
                            name="NoHP"
                            value={customer.NoHP}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="Email"
                            value={customer.Email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Alamat</label>
                        <input
                            type="text"
                            name="Alamat"
                            value={customer.Alamat}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Tanggal Daftar</label>
                        <input
                            type="date"
                            name="TglDaftar"
                            value={customer.TglDaftar}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
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
                        <button
                            type="button"
                            onClick={() => router.push('/pelanggan')}
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

export default EditPelanggan;
