// components/Sidebar.tsx
import styles from '../style/sidebar.module.css'; // Pastikan jalur ini benar
import { Icon } from '@iconify/react'; // Impor ikon dari Iconify
import Link from 'next/link'; // Impor Link dari Next.js
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react'; // Menambahkan useState dan useEffect

const Sidebar: FC<{ activeMenu: string; onMenuClick: (menu: string) => void }> = ({ activeMenu, onMenuClick }) => {
    const [role, setRole] = useState<string | null>(null);  // Menyimpan role dari sessionStorage
    const router = useRouter();

    // Ambil role dari sessionStorage ketika komponen dimuat
    useEffect(() => {
        const storedRole = sessionStorage.getItem('userRole');
        if (!storedRole) {
            router.push('/login');
        } else {
            setRole(storedRole);
            if (storedRole !== 'admin') {
                router.push('/dashboard');
            }
        }
    }, []);

    console.log('User Role:', role);

    // Bisa ditaruh di dalam Sidebar.tsx atau di komponen lainnya yang menangani logout
    const handleLogout = () => {
        // Hapus data pengguna dari sessionStorage
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userName'); // Jika Anda menyimpan nama pengguna
        // Redirect ke halaman login
        router.push('/login');
    };
    
    return (
        <div className={styles.sidebar} role="navigation">
            <h1 className={styles.logo}>Sure Cafe</h1>
            <ul className={styles.sidebarList}>
                {/* Menu Dashboard */}
                <li className={styles.sidebarItem}>
                    <Link href="/dashboard" passHref>
                        <div 
                            onClick={() => onMenuClick('Dashboard')} // Mengubah status menu aktif
                            className={`${styles.sidebarLink} ${activeMenu === 'Dashboard' ? styles.active : ""}`}>
                            <Icon icon="ion:stats-chart" width="25" height="25" />
                            Dashboard
                        </div>
                    </Link>
                </li>

                {/* Menu Pelanggan, tampil untuk semua role */}
                <li className={styles.sidebarItem}>
                    <Link href="/pelanggan" passHref>
                        <div 
                            onClick={() => onMenuClick('Pelanggan')}
                            className={`${styles.sidebarLink} ${activeMenu === 'Pelanggan' ? styles.active : ""}`}>
                            <Icon icon="ion:people" width="25" height="25" />
                            Pelanggan
                        </div>
                    </Link>
                </li>

                {/* Menu Pegawai, hanya tampil untuk Admin */}
                {role === 'admin' && (
                    <li className={styles.sidebarItem}>
                        <Link href="/pegawai" passHref>
                            <div 
                                onClick={() => onMenuClick('Pegawai')}
                                className={`${styles.sidebarLink} ${activeMenu === 'Pegawai' ? styles.active : ""}`}>
                                <Icon icon="ion:person-add" width="25" height="25" />
                                Pegawai
                            </div>
                        </Link>
                    </li>
                )}

                {/* Menu Transaksi, tampil untuk semua role */}
                <li className={styles.sidebarItem}>
                    <Link href="/transaksi" passHref>
                        <div 
                            onClick={() => onMenuClick('Transaksi')}
                            className={`${styles.sidebarLink} ${activeMenu === 'Transaksi' ? styles.active : ""}`}>
                            <Icon icon="ion:card" width="25" height="25" />
                            Transaksi
                        </div>
                    </Link>
                </li>

                {/* Menu Referral, tampil untuk semua role */}
                    <li className={styles.sidebarItem}>
                        <Link href="/referral" passHref>
                            <div 
                                onClick={() => onMenuClick('Referral')}
                                className={`${styles.sidebarLink} ${activeMenu === 'Referral' ? styles.active : ""}`}>
                                <Icon icon="ion:gift" width="25" height="25" />
                                Referral
                            </div>
                        </Link>
                    </li>

                {/* Menu Menu, tampil untuk semua role */}
                <li className={styles.sidebarItem}>
                    <Link href="/menu" passHref>
                        <div 
                            onClick={() => onMenuClick('Menu')}
                            className={`${styles.sidebarLink} ${activeMenu === 'Menu' ? styles.active : ""}`}>
                            <Icon icon="ion:fast-food" width="25" height="25" />
                            Menu
                        </div>
                    </Link>
                </li>

                {/* Menu Stok, tampik untuk semua role */}
                    <li className={styles.sidebarItem}>
                        <Link href="/stok" passHref>
                            <div 
                                onClick={() => onMenuClick('Stok')}
                                className={`${styles.sidebarLink} ${activeMenu === 'Stok' ? styles.active : ""}`}>
                                <Icon icon="ion:archive" width="25" height="25" />
                                Stok
                            </div>
                        </Link>
                    </li>

                {/* Menu Laporan, tampil untuk semua role */}
                <li className={styles.sidebarItem}>
                    <Link href="/laporan" passHref>
                        <div 
                            onClick={() => onMenuClick('Laporan')}
                            className={`${styles.sidebarLink} ${activeMenu === 'Laporan' ? styles.active : ""}`}>
                            <Icon icon="ion:document-text" width="25" height="25" />
                            Laporan
                        </div>
                    </Link>
                </li>
            </ul>

            {/* Tombol logout */}
            <Link href="/login" passHref>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    <Icon icon="ion:log-out" width="25" height="25" /> Log Out
                </button>
            </Link>
        </div>
    );
};

export default Sidebar;
