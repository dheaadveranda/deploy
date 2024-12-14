import styles from '../style/stok/stok.module.css';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Icon } from '@iconify/react';
import Link from 'next/link';

interface Stok {
    IDBahan: string;
    NamaBahan: string;
    Jumlah: string;
    Satuan: string;
}

const Stok: React.FC = () => {
    const [stoks, setStoks] = useState<Stok[]>([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [stoksPerPage] = useState<number>(7);
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const [modalMessage, setModalMessage] = useState(''); // Message for modal
    const [deletingId, setDeletingId] = useState(''); // ID of the item being deleted

    useEffect(() => {
        const fetchStoks = async () => {
            const response = await fetch('/api/stok/getStok');
            if (!response.ok) {
                console.error('Failed to fetch stoks');
                return;
            }
            const data = await response.json();
            setStoks(data);
        };

        fetchStoks(); 
    }, []);

    const filteredStoks = stoks.filter((stok) =>
        stok.NamaBahan.toLowerCase().includes(searchInput.toLowerCase()) ||
        stok.IDBahan.toLowerCase().includes(searchInput.toLowerCase())
    );

    const indexOfLastStok = currentPage * stoksPerPage;
    const indexOfFirstStok = indexOfLastStok - stoksPerPage;
    const currentStoks = filteredStoks.slice(indexOfFirstStok, indexOfLastStok);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(filteredStoks.length / stoksPerPage);

    // Handle delete click and show confirmation modal
    const handleDelete = (id: string) => {
        setDeletingId(id);
        setModalMessage('Apakah Anda yakin ingin menghapus stok ini?');
        setShowModal(true); // Show the confirmation modal
    };

    const confirmDelete = async () => {
        const response = await fetch(`/api/stok/deleteStok?id=${deletingId}`, { method: 'DELETE' });
        if (response.ok) {
            setStoks((prev) => prev.filter((stok) => stok.IDBahan !== deletingId)); // Remove deleted item
            setModalMessage('Stok berhasil dihapus');
        } else {
            setModalMessage('Gagal menghapus stok');
        }
        setTimeout(() => setShowModal(false), 1500); // Close modal after 1.5s
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Stok" onMenuClick={() => { }} />
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Stok</h1>
                <hr className={styles.separator} />
                <div className={styles.searchContainer}>
                    <div className={styles.inputContainer}>
                        <Icon icon="mdi:search" width="24" height="24" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Cari stok..."
                            className={styles.searchInput}
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                    <Link href="/stok/add" passHref>
                        <button className={styles.addButton}>Tambah</button>
                    </Link>
                </div>

                <table className={styles.stokTable}>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Jumlah</th>
                            <th>Satuan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStoks.length > 0 ? (
                            currentStoks.map((stok, index) => (
                                <tr key={stok.IDBahan}>
                                    <td>{index + 1 + (currentPage - 1) * stoksPerPage}</td>
                                    <td>{stok.NamaBahan}</td>
                                    <td>{stok.Jumlah}</td>
                                    <td>{stok.Satuan}</td>
                                    <td>
                                        <Link href={`/stok/${stok.IDBahan}`}>
                                            <Icon icon="mage:information-circle-fill" width="24" height="24" className={`${styles.actionIcon} ${styles.detailIcon}`} />
                                        </Link>
                                        <Link href={`/stok/edit/${stok.IDBahan}`} passHref>
                                            <Icon icon="mynaui:edit-solid" width="24" height="24" className={`${styles.actionIcon} ${styles.editIcon}`} />
                                        </Link>
                                        <Icon icon="mdi:delete" width="24" height="24" className={`${styles.actionIcon} ${styles.deleteIcon}`}
                                            onClick={() => handleDelete(stok.IDBahan)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.noData}>
                                    <div style={{ textAlign: 'center' }}>
                                        <span className="icon-[lucide--search]"></span>
                                        <p>Data tidak ditemukan!</p>
                                        <p>Coba masukkan kata kunci lain</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className={styles.pagination}>
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Sebelumnya</button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={currentPage === index + 1 ? styles.activePage : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Berikutnya</button>
                </div>
            </div>

            {/* Modal for delete confirmation */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <p>{modalMessage}</p>
                        {modalMessage === 'Apakah Anda yakin ingin menghapus stok ini?' ? (
                            <div>
                                <button className={styles.confirmButton} onClick={confirmDelete}>Konfirmasi</button>
                                <button className={styles.cancelButton} onClick={closeModal}>Batal</button>
                            </div>
                        ) : (
                            <button className={styles.closeModalButton} onClick={closeModal} >Tutup</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stok;
