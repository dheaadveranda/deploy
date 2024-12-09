// pages/pegawai/[id].tsx
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import styles from '../../style/pegawai/pegawaiDetail.module.css';

interface Employee {
    IDPegawai: string;
    NamaPegawai: string;
    Peran: string;
    NoHP: string;
    Email: string;
    Alamat: string;
    TglBergabung: string;
    Username: string;
    Password: string;
}

const PegawaiDetail: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Mengambil ID dari URL
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (id) {
            const fetchPegawaiDetail = async () => {
                const response = await fetch(`/api/pegawai/getEmployee?id=${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setEmployee(data);
                } else {
                    console.error('Failed to fetch pegawai details');
                }
            };

            fetchPegawaiDetail();
        }
    }, [id]);

    if (!employee) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Pegawai" onMenuClick={() => { }}/>
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Pegawai</h1>
                <hr className={styles.separator} />
                <h2 className={styles.detailPegawaiTitle}>Detail Pegawai</h2>
                <div className={styles.detailsContainer}>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>ID Pegawai</span>
                        <span className={styles.detailBox}>{employee.IDPegawai}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Nama Pegawai</span>
                        <span className={styles.detailBox}>{employee.NamaPegawai}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Peran</span>
                        <span className={styles.detailBox}>{employee.Peran}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>No HP</span>
                        <span className={styles.detailBox}>{employee.NoHP}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Email</span>
                        <span className={styles.detailBox}>{employee.Email}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Alamat</span>
                        <span className={styles.detailBox}>{employee.Alamat}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Tanggal Bergabung</span>
                        <span className={styles.detailBox}>{employee.TglBergabung.split('T')[0]}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Username</span>
                        <span className={styles.detailBox}>{employee.Username}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Password</span>
                        <div className={styles.passwordContainer}>
                            <span className={styles.detailBox}>
                                {showPassword ? employee.Password : '•'.repeat(employee.Password.length)}
                            </span>
                            <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                                <Icon icon={showPassword ? "fluent:eye-16-filled" : "fluent:eye-off-16-filled"} width={24} height={24} />
                            </span>
                        </div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="button" onClick={() => router.push('/pegawai')} className={styles.backButton}>Ok sip mantap</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PegawaiDetail;
