// pages/stok/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar'; // Pastikan jalur ke Sidebar benar
import styles from '../../style/stok/stokDetail.module.css'; // Pastikan jalur ke file benar
 
interface Stok {
    IDBahan: string;
    NamaBahan: string;
    Jumlah: string;
    Satuan: string;
    Keterangan: string;
}
 
const StokDetail: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Mengambil ID dari URL
    const [stok, setStok] = useState<Stok | null>(null); // State untuk stok
 
    useEffect(() => {
        if (id) {
            const fetchStokDetail = async () => {
                const response = await fetch(`/api/stok/getStok?id=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setStok(data); // Menyimpan data stok di state
                } else {
                    console.error('Failed to fetch stok details');
                }
            };
 
            fetchStokDetail();
        }
    }, [id]); // Mengambil data stok berdasarkan ID yang ada di URL
 
    if (!stok) return <div>Loading...</div>; // Tampilkan loading saat menunggu data
 
    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Stok" onMenuClick={() => { }}/>
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Stok</h1>
                <hr className={styles.separator} />
                <h2 className={styles.detailStokTitle}>Detail Stok</h2>
                <div className={styles.detailsContainer}>
                    {/* Atribut tidak dalam kotak, dan hanya nilai yang ditampilkan di dalam kotak */}
                    <div className={styles.detailRow}>
                        <span className={styles.label}>ID Stok</span>
                        <span className={styles.detailBox}>{stok.IDBahan}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Nama Bahan</span>
                        <span className={styles.detailBox}>{stok.NamaBahan}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Jumlah</span>
                        <span className={styles.detailBox}>{stok.Jumlah}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Satuan</span>
                        <span className={styles.detailBox}>{stok.Satuan}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Keterangan</span>
                        <span className={styles.detailBox}>{stok.Keterangan}</span>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="button" onClick={() => router.push('/stok')} className={styles.backButton}>Ok sip mantap</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
 
export default StokDetail;