import styles from '../style/referral/referral.module.css';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Icon } from '@iconify/react';
import Link from 'next/link';

interface Referral {
    KodeReferral: string;  // Kode referral
    KuotaPenggunaan: string; // Kuota penggunaan
    IDPelanggan: string;   // ID pelanggan
    NamaPelanggan: string;  // Nama pelanggan yang sudah ditambahkan
}

const Referral: React.FC = () => {
    const [referrals, setReferrals] = useState<Referral[]>([]);

    useEffect(() => {
        const fetchReferrals = async () => {
            const response = await fetch('/api/referral/getReferral'); // Mengambil data dari API
            if (!response.ok) {
                console.error('Failed to fetch referrals');
                return;
            }
            const data = await response.json();
            console.log('Fetched Referrals:', data);

            if (Array.isArray(data)) {
                setReferrals(data);
            } else {
                console.error('Data tidak sesuai format yang diharapkan');
            }

            // Cek jika API merespons kode referral baru
            if (data.KodeReferralBaru) {
                console.log(`Kode referral baru diterima: ${data.KodeReferralBaru}`);
                handleNewReferralCode(data.KodeReferralBaru); // Update state jika kode referral baru ada
            }
        };

        fetchReferrals();
    }, []);

    const handleNewReferralCode = (newCode: string) => {
        console.log('Menambahkan kode referral baru:', newCode); // Log untuk memastikan kode baru ditambahkan
        setReferrals(prevReferrals => [
            ...prevReferrals,
            { KodeReferral: newCode, KuotaPenggunaan: '0', IDPelanggan: '', NamaPelanggan: '' }
        ]);
    };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Referral" onMenuClick={() => {}}/>
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Referral</h1>
                <hr className={styles.separator} />
                <div className={styles.searchContainer}>
                    <div className={styles.inputContainer}>
                        <Icon icon="mdi:search" width="24" height="24" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Cari referral..."
                            className={styles.searchInput}
                        />
                    </div>
                    <Link href="/referral/add" passHref>
                        <button className={styles.addButton}>
                            Tambah
                        </button>
                    </Link>
                </div>
                <table className={styles.referralTable}>
                    <thead>
                        <tr>
                            <th>ID Pelanggan</th>
                            <th>Nama Pelanggan</th>
                            <th>Kode Referral</th>
                            <th>Kuota Penggunaan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrals.map((referral) => (
                            <tr key={referral.KodeReferral}>
                                <td>{referral.IDPelanggan}</td>
                                <td>{referral.NamaPelanggan}</td>
                                <td>{referral.KodeReferral}</td>
                                <td>{referral.KuotaPenggunaan}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Referral;
