import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import styles from '../../style/pelanggan/pelangganAdd.module.css';
import { useRouter } from 'next/router';

const AddPelanggan: React.FC = () => {
    const router = useRouter();
    const [idPelanggan, setIdPelanggan] = useState('');
    const [namaPelanggan, setNamaPelanggan] = useState('');
    const [noHP, setNoHP] = useState('');
    const [email, setEmail] = useState('');
    const [alamat, setAlamat] = useState('');
    const [tglDaftar, setTglDaftar] = useState('');
    const [totalPoin, setTotalPoin] = useState('');

    // Fetch latest ID and generate new ID
    useEffect(() => {
        const fetchLatestID = async () => {
            const response = await fetch('/api/pelanggan/getLatestID');
            const data = await response.json();

            let newID = 'CUST0001';  // Default ID pertama

            if (data.latestID) {
                // Pastikan ID terakhir valid
                const latestID = data.latestID;
                const numberPart = parseInt(latestID.substring(4), 10);  // Ambil angka setelah "CUST"
                if (!isNaN(numberPart)) {
                    const newNumberPart = numberPart + 1;  // Increment angka tersebut
                    newID = `CUST${newNumberPart.toString().padStart(4, '0')}`;  // Format menjadi CUSTXXXX
                }
            }

            setIdPelanggan(newID);
        };

        fetchLatestID();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/pelanggan/addCustomer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                IDPelanggan: idPelanggan,
                NamaPelanggan: namaPelanggan,
                NoHP: noHP,
                Email: email,
                Alamat: alamat,
                TglDaftar: tglDaftar || new Date().toISOString(),
                TotalPoin: totalPoin,
            }),
        });

        if (response.ok) {
            alert('Pelanggan berhasil ditambahkan');
            router.push('/pelanggan');
        } else {
            alert('Gagal menambahkan pelanggan');
            const errorMessage = await response.json();
            console.error('Error:', errorMessage);
        }
    };

    return (
        <div className={styles.main}>
            <Sidebar activeMenu="Pelanggan" onMenuClick={() => { }} />
            <div className={styles.content}>
            <h1 className={styles.pageTitle}>Kelola Pelanggan</h1>
                <hr className={styles.separator} />
                <h2 className={styles.tambahPelangganTitle}>Tambah Pelanggan</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <label>ID Pelanggan</label>
                        <input type="text" value={idPelanggan} readOnly />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Nama Pelanggan</label>
                        <input
                            type="text"
                            placeholder="Masukkan Nama Pelanggan"
                            value={namaPelanggan}
                            onChange={(e) => setNamaPelanggan(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>No HP</label>
                        <input
                            type="text"
                            placeholder="Masukkan Nomor Handphone"
                            value={noHP}
                            onChange={(e) => setNoHP(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Masukkan Email Pelanggan"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Alamat</label>
                        <input
                            type="text"
                            placeholder="Masukkan Alamat Pelanggan"
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Tanggal Daftar</label>
                        <input
                            type="date"
                            value={tglDaftar}
                            onChange={(e) => setTglDaftar(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Total Poin</label>
                        <input
                            type="text"
                            placeholder="Masukkan Total Poin"
                            value={totalPoin}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                    setTotalPoin(value);
                                }
                            }}
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

export default AddPelanggan;
