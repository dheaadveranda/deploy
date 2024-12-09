// pages/stok.tsx
import styles from '../style/stok/stok.module.css'; // Pastikan jalur ini benar
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; // Pastikan jalur ini benar
import { Icon } from '@iconify/react'; // Menggunakan Iconify untuk ikon
import Link from 'next/link'; // Impor Link dari Next.js
 
interface Stok {
    IDBahan: string;      
    NamaBahan: string;    
    Jumlah: string
    Satuan: string;
}
 
const Stok: React.FC = () => {
    const [stoks, setStoks] = useState<Stok[]>([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [stoksPerPage] = useState<number>(7);
 
    useEffect(() => {
        const fetchStoks = async () => {
            const response = await fetch('/api/stok/getStok');
            if (!response.ok) {
                console.error('Failed to fetch stoks');
                return;
            }
            const data = await response.json();
            console.log('Fetched Stoks:', data); // Debugging untuk melihat data
            setStoks(data); // Menyimpan data di state
        };
 
        fetchStoks(); // Memanggil fungsi untuk mengambil data
    }, []);
 
    const filteredStoks = stoks.filter((stok) =>
            stok.NamaBahan.toLowerCase().includes(searchInput.toLowerCase()) ||
            stok.IDBahan.toLowerCase().includes(searchInput.toLowerCase())
        );
 
    // Logic untuk menampilkan pegawai sesuai dengan halaman yang aktif
    const indexOfLastStok = currentPage * stoksPerPage;
    const indexOfFirstStok = indexOfLastStok - stoksPerPage;
    const currentStoks = filteredStoks.slice(indexOfFirstStok, indexOfLastStok);

    // Fungsi untuk mengubah halaman aktif
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Menghitung total halaman
    const totalPages = Math.ceil(filteredStoks.length / stoksPerPage);
 
    const handleDelete = async (id: string) => {
        const response = confirm("Apakah Anda yakin ingin menghapus stok ini?");
        if (response) {
            const deleteResponse = await fetch(`/api/stok/deleteStok?id=${id}`, {
                method: 'DELETE',
            });
    
            if (deleteResponse.ok) {
                alert('Stok berhasil dihapus');
                setStoks((prev) => prev.filter((stok) => stok.IDBahan !== id)); // Menghapus stok dari state
            } else {
                alert('Gagal menghapus stok');
            }
        }
    };
 
    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Stok" onMenuClick={() => { }}/>
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
                            value={searchInput} // Menghubungkan input dengan state
                            onChange={(e) => setSearchInput(e.target.value)} // Memperbarui state saat input berubah
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

                {/* Pagination */}
                <div className={styles.pagination}>
                    {/* Tombol Previous */}
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Sebelumnya
                    </button>

                    {/* Tombol Halaman */}
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={currentPage === index + 1 ? styles.activePage : ''}
                        >
                            {index + 1}
                        </button>
                    ))}

                    {/* Tombol Next */}
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
        </div>
    );
};
 
export default Stok;