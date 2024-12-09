// pages/pegawai/edit/[id].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../../components/Sidebar';
import styles from '../../../style/pegawai/pegawaiAdd.module.css';
import { Icon } from '@iconify/react';
 
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
 
const EditPegawai: React.FC = () => {
    const router = useRouter();
    const { id } = router.query; // Mengambil ID dari URL
    const [employee, setEmployee] = useState<Employee | null>(null); // State untuk pegawai
    const [showPassword, setShowPassword] = useState(false);
 
    useEffect(() => {
        const fetchPegawaiDetail = async () => {
            const response = await fetch(`/api/pegawai/getEmployee?id=${id}`);
            if (response.ok) {
                const data = await response.json();
                setEmployee(data);
            } else {
                console.error('Failed to fetch pegawai details');
            }
        };
 
        const fetchUserRole = async () => {
            const response = await fetch('/api/authUser'); // Ambil role pengguna
            if (response.ok) {
                // const user = await response.json();
            }
        };
 
        if (id) {
            fetchPegawaiDetail();
            fetchUserRole(); // Ambil role pengguna saat ID tersedia
        }
    }, [id]);
 
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (employee) {
            setEmployee({
                ...employee,
                [e.target.name]: e.target.value // Update sesuai input yang diubah
            });
        }
    };
 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
 
        console.log("Data dikirim ke API:", employee);
 
        const response = await fetch(`/api/pegawai/updateEmployee?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employee), // Mengirim data pegawai yang diubah
        });
 
        if (response.ok) {
            alert('Pegawai berhasil diubah');
            router.push('/pegawai'); // Kembali ke halaman pegawai setelah berhasil
        } else {
            alert('Gagal mengubah pegawai');
        }
    };
 
    if (!employee) return <div>Loading...</div>; // Tampilkan loading jika data belum siap
 
    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Pegawai" onMenuClick={() => { }}/> {/* Kirim userRole */}
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Pegawai</h1>
                <hr className={styles.separator} />
                <h2 className={styles.pegawaiTitle}>Edit Pegawai</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <label>ID Pegawai:</label>
                        <input
                            type="text"
                            value={employee.IDPegawai}
                            readOnly // ID seharusnya tidak dapat diedit
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Nama Pegawai:</label>
                        <input
                            type="text"
                            name="NamaPegawai"
                            value={employee.NamaPegawai}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Peran</label>
                        <select
                            name="Peran"
                            value={employee.Peran}
                            onChange={handleChange}
                            required
                        >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    <div className={styles.inputContainer}>
                        <label>No HP</label>
                        <input
                            type="text"
                            name="NoHP"
                            value={employee.NoHP}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Email</label>
                        <input
                            type="text"
                            name="Email"
                            value={employee.Email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Alamat</label>
                        <input
                            type="text"
                            name="Alamat"
                            value={employee.Alamat}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Tanggal Bergabung:</label>
                        <input
                            type="date"
                            name="TglBergabung"
                            value={employee.TglBergabung.split('T')[0]} // Format YYYY-MM-DD
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Username</label>
                        <input
                            type="text"
                            name="Username"
                            value={employee.Username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Password</label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="Password"
                                onChange={handleChange}
                            />
                            <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                                <Icon icon={showPassword ? "fluent:eye-16-filled" : "fluent:eye-off-16-filled"} width={24} height={24} />
                            </span>
                        </div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.saveButton}>Simpan</button>
                        <button type="button" onClick={() => router.push('/pegawai')} className={styles.cancelButton}>Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
 
export default EditPegawai;