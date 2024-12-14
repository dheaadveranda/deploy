import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import styles from '../../style/stok/stokAdd.module.css';
import { useRouter } from 'next/router';

const AddStok: React.FC = () => {
    const router = useRouter();
    const [idBahan, setIdBahan] = useState('');
    const [namaBahan, setNamaBahan] = useState('');
    const [jumlah, setJumlah] = useState('');
    const [satuan, setSatuan] = useState('');
    const [keterangan, setKeterangan] = useState('');
    
    // State for modal visibility and message
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const fetchLatestID = async () => {
            const response = await fetch('/api/stok/getLatestID');
            const data = await response.json();
            let newID = 'STK0001';
            if (data.latestID) {
                const latestNumber = parseInt(data.latestID.substring(3), 10);
                newID = `EMP${(latestNumber + 1).toString().padStart(4, '0')}`;
            }
            setIdBahan(newID);
        };

        fetchLatestID();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch('/api/stok/addStok', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                IDBahan: idBahan,
                NamaBahan: namaBahan,
                Jumlah: jumlah,
                Satuan: satuan,
                Keterangan: keterangan,
            }),
        });

        if (response.ok) {
            setModalMessage('Stok berhasil ditambahkan');
            setShowModal(true); // Show success message
            setTimeout(() => router.push('/stok'), 1500); // Redirect after 1.5 seconds
        } else {
            setModalMessage('Gagal menambahkan stok');
            setShowModal(true); // Show failure message
        }
    };

    const closeModal = () => setShowModal(false); // Close modal

    return (
        <div className={styles.main}>
            <Sidebar activeMenu="Stok" onMenuClick={() => { }} />
            <div className={styles.mainContent}>
                <h1 className={styles.pageTitle}>Kelola Stok</h1>
                <hr className={styles.separator} />
                <h2 className={styles.tambahStokTitle}>Tambah Stok</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <label>ID Bahan</label>
                        <input
                            type="text"
                            value={idBahan}
                            readOnly
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Nama Bahan</label>
                        <input
                            type="text"
                            placeholder="Masukkan Nama Barang"
                            value={namaBahan}
                            onChange={(e) => setNamaBahan(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Jumlah</label>
                        <input
                            type="text"
                            placeholder="Masukkan Jumlah Barang"
                            value={jumlah}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) { // Regex untuk angka saja
                                    setJumlah(value);
                                }
                            }}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Satuan</label>
                        <input
                            type="text"
                            placeholder="Masukkan Satuan Barang"
                            value={satuan}
                            onChange={(e) => setSatuan(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label>Keterangan</label>
                        <input
                            type="text"
                            placeholder="Masukkan Keterangan Barang"
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.saveButton}>Simpan</button>
                        <button type="button" onClick={() => router.push('/stok')} className={styles.cancelButton}>Batal</button>
                    </div>
                </form>
            </div>

            {/* Modal for alert */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <p>{modalMessage}</p>
                        <button onClick={closeModal} className={styles.closeModalButton}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddStok;
