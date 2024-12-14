// pages/menu/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar'; // Pastikan jalur ke Sidebar benar
import styles from '../../style/menu/menuDetail.module.css'; // Pastikan jalur ke file benar

interface Menu {
    Gambar?: string;
    IDMenu: string;
    NamaMenu: string;
    HargaMenu: string;
    KategoriMenu: string;
}

const MenuDetail: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Mengambil ID dari URL
    const [menu, setMenu] = useState<Menu | null>(null); // State untuk menu

    useEffect(() => {
        if (id) {
            const fetchMenuDetail = async () => {
                const response = await fetch(`/api/menu/getMenu?id=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setMenu(data); // Menyimpan data menu di state
                } else {
                    console.error('Failed to fetch menu details');
                }
            };

            fetchMenuDetail();
        }
    }, [id]); // Mengambil data menu berdasarkan ID yang ada di URL

    if (!menu) return <div className={styles.loading}>Loading...</div>; // Tampilkan loading saat menunggu data

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Menu" onMenuClick={() => {}}/>
            <div className={styles.main}>
            <h1  className={styles.pageTitle}>Detail Menu</h1>
                <div className={styles.card}>
                {/* <h1  className={styles.pageTitle}>Detail Menu</h1> */}
                    {/* Gambar Menu */}
                    {menu.Gambar && (
                        <img src={menu.Gambar} alt={menu.NamaMenu} className={styles.menuImage} />
                    )}
                    {/* Informasi Menu */}
                    <div className={styles.details}>
                        <div className={styles.detailGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>ID Menu:</span>
                                <span className={styles.value}>{menu.IDMenu}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Nama Menu:</span>
                                <span className={styles.value}>{menu.NamaMenu}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Harga Menu:</span>
                                <span className={styles.value}>Rp {menu.HargaMenu}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.label}>Kategori Menu:</span>
                                <span className={styles.value}>{menu.KategoriMenu}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className={styles.backButton}
                        onClick={() => router.push('/menu')}
                    >
                        Kembali ke Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuDetail;
