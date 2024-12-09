import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import styles from '../../style/referral/referralAdd.module.css';

// Definisikan tipe Customer
interface Customer {
    IDPelanggan: string;
    NamaPelanggan: string;
}

const AddReferral: React.FC = () => {
    const router = useRouter();
    const [customerID, setCustomerID] = useState<string>(''); // ID Pelanggan
    const [customerName, setCustomerName] = useState<string>(''); // Nama Pelanggan
    const [customers, setCustomers] = useState<Customer[]>([]); // Daftar Pelanggan
    const [errorMessage, setErrorMessage] = useState<string>(''); // Pesan error

    // Ambil daftar pelanggan dari API saat komponen dimuat
    useEffect(() => {
        const fetchCustomers = async () => {
            const response = await fetch('/api/referral/getCustomers');
            if (response.ok) {
                const data = await response.json();
                setCustomers(data); // Set data pelanggan
            } else {
                console.error('Gagal memuat data pelanggan');
            }
        };

        fetchCustomers();

        const fetchUserRole = async () => {
            const response = await fetch('/api/authUser');
            if (response.ok) {
                // const user = await response.json(); // Jika perlu ambil data user
            }
        };

        fetchUserRole();
    }, []); // Dependency kosong artinya hanya dijalankan sekali saat mount

    // Handle perubahan pelanggan yang dipilih
    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCustomer = customers.find((customer) => customer.IDPelanggan === e.target.value);
        setCustomerID(selectedCustomer?.IDPelanggan || '');
        setCustomerName(selectedCustomer?.NamaPelanggan || '');
    };

    // Handle submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            IDPelanggan: customerID,
            NamaPelanggan: customerName,
        };

        const response = await fetch('/api/referral/addReferral', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            alert('Referral berhasil ditambahkan: ' + result.KodeReferral);
            router.push('/referral');
        } else {
            const errorMessage = await response.json();
            setErrorMessage(errorMessage.message || 'Gagal menambahkan referral');
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Referral" onMenuClick={() => { }} />
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Referral</h1>
                <hr className={styles.separator} />
                <h2 className={styles.addTReferralTitle}>Tambah Referral</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    {/* ID Pelanggan (Tidak diubah, tetap ada) */}
                    <div className={styles.inputContainer}>
                        <label>ID Pelanggan</label>
                        <input
                            type="text"
                            value={customerID}
                            disabled // ID Pelanggan otomatis terisi, tidak bisa diubah
                            placeholder="ID Pelanggan akan terisi otomatis"
                        />
                    </div>

                    {/* Dropdown untuk Memilih Nama Pelanggan */}
                    <div className={styles.inputContainer}>
                        <label>Nama Pelanggan</label>
                        <select
                            value={customerID}
                            onChange={handleCustomerChange}
                            required
                        >
                            <option value="" disabled>Pilih pelanggan</option>
                            {customers.map((customer) => (
                                <option key={customer.IDPelanggan} value={customer.IDPelanggan}>
                                    {customer.NamaPelanggan}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tombol Aksi */}
                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.saveButton}>Simpan</button>
                        <button type="button" onClick={() => router.push('/referral')} className={styles.cancelButton}>Batal</button>
                    </div>
                </form>

                {/* Error Message */}
                {errorMessage && <div className={styles.error}>{errorMessage}</div>}
            </div>
        </div>
    );
};

export default AddReferral;
