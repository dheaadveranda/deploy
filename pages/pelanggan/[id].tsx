// pages/pelanggan/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar'; // Pastikan jalur ke Sidebar benar
import styles from '../../style/pelanggan/pelangganDetail.module.css'; // Pastikan jalur ke file benar

interface Customer {
    IDPelanggan: string;
    NamaPelanggan: string;
    NoHP: string;
    Email: string;
    Alamat: string;
    TglDaftar: string;
    TotalPoin: string;
}

const PelangganDetail: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Mengambil ID dari URL
    const [customer, setCustomer] = useState<Customer | null>(null); // State untuk pelanggan

    useEffect(() => {
        if (id) {
            const fetchPelangganDetail = async () => {
                const response = await fetch(`/api/pelanggan/getCustomer?id=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setCustomer(data); // Menyimpan data pelanggan di state
                } else {
                    console.error('Failed to fetch pelanggan details');
                }
            };

            fetchPelangganDetail();
        }
    }, [id]); // Mengambil data pelanggan berdasarkan ID yang ada di URL

    if (!customer) return <div>Loading...</div>; // Tampilkan loading saat menunggu data

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Pelanggan" onMenuClick={() => { }}/>
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Pelanggan</h1>
                <hr className={styles.separator} />
                <h2 className={styles.detailPelangganTitle}>Detail Pelanggan</h2>
                <div className={styles.detailsContainer}>
                    {/* Atribut tidak dalam kotak, dan hanya nilai yang ditampilkan di dalam kotak */}
                    <div className={styles.detailRow}>
                        <span className={styles.label}>ID Pelanggan</span>
                        <span className={styles.detailBox}>{customer.IDPelanggan}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Nama Pelanggan</span>
                        <span className={styles.detailBox}>{customer.NamaPelanggan}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>No HP</span>
                        <span className={styles.detailBox}>{customer.NoHP}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Email</span>
                        <span className={styles.detailBox}>{customer.Email}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Alamat</span>
                        <span className={styles.detailBox}>{customer.Alamat}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Tanggal Daftar</span>
                        <span className={styles.detailBox}>{customer.TglDaftar.split('T')[0]}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Total Poin</span>
                        <span className={styles.detailBox}>{customer.TotalPoin}</span>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="button" onClick={() => router.push('/pelanggan')} className={styles.backButton}>Ok sip mantap</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PelangganDetail;
