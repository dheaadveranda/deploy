// pages/pegawai/add.tsx
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Sidebar from '../../components/Sidebar';
import styles from '../../style//pegawai/pegawaiAdd.module.css';
import { useRouter } from 'next/router'; 

const AddPegawai: React.FC = () => {
    const router = useRouter();
    const [idPegawai, setIdPegawai] = useState('');
    const [namaPegawai, setNamaPegawai] = useState('');
    const [noHP, setNoHP] = useState('');
    const [peran, setPeran] = useState('admin');
    const [email, setEmail] = useState('');
    const [alamat, setAlamat] = useState('');
    const [tglBergabung, setTglBergabung] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State untuk kontrol tampilan password

    useEffect(() => {
        const storedRole = sessionStorage.getItem('userRole');
        if (storedRole !== 'admin') {
            router.push('/dashboard');
            return; // Hentikan eksekusi lebih lanjut
        }

        const fetchLatestID = async () => {
            const response = await fetch('/api/pegawai/getLatestID');
            const data = await response.json();
            let newID = 'EMP0001';
            if (data.latestID) {
                const latestNumber = parseInt(data.latestID.substring(3), 10);
                newID = `EMP${(latestNumber + 1).toString().padStart(4, '0')}`;
            }
            setIdPegawai(newID);
        };
    
        fetchLatestID();
    
        const fetchUserRole = async () => {
            const response = await fetch('/api/authUser');
            if (response.ok) {

            }
        };
        fetchUserRole();
    }, [router]);    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/pegawai/addEmployee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                IDPegawai: idPegawai,
                NamaPegawai: namaPegawai,
                NoHP: noHP,
                Peran: peran,
                Email: email,
                Alamat: alamat,
                TglBergabung: tglBergabung || new Date().toISOString(),
                Username: username,
                Password: password,
            }),
        });

        if (response.ok) {
            alert('Pegawai berhasil ditambahkan');
            router.push('/pegawai');
        } else {
            alert('Gagal menambahkan pegawai');
            const errorMessage = await response.json();
            console.error('Error:', errorMessage);
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Pegawai" onMenuClick={() => { }} />
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Pegawai</h1>
                <hr className={styles.separator} />
                <h2 className={styles.tambahPegawaiTitle}>Tambah Pegawai</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <label>ID Pegawai</label>
                        <input
                            type="text"
                            value={idPegawai}
                            readOnly
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Nama Pegawai</label>
                        <input
                            type="text"
                            placeholder='Masukkan Nama Pegawai'
                            value={namaPegawai}
                            onChange={(e) => setNamaPegawai(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>No HP</label>
                        <input
                            type="text"
                            placeholder='Masukkan Nomor Handphone'
                            value={noHP}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) { // Regex untuk angka saja
                                    setNoHP(value);
                                }
                            }}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Peran</label>
                        <select
                            value={peran}
                            onChange={(e) => setPeran(e.target.value)} // Mengupdate state saat dropdown berubah
                        >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Email:</label>
                        <input
                            type="email"
                            placeholder='Masukkan Email Pegawai'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Alamat:</label>
                        <input
                            type="text"
                            placeholder='Masukkan Alamat Pegawai'
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Tanggal Bergabung:</label>
                        <input
                            type="date"
                            value={tglBergabung}
                            onChange={(e) => setTglBergabung(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Username:</label>
                        <input
                            type="text"
                            placeholder='Masukkan Username Pegawai'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} // Mengatur username saat input berubah
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Password</label>
                        <div className={styles.passwordContainer}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder='Masukkan Password Pegawai'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
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

export default AddPegawai;