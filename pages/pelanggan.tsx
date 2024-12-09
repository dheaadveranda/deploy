// pages/pelanggan.tsx
import styles from '../style/pelanggan/pelanggan.module.css'; // Pastikan jalur ini benar
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Icon } from '@iconify/react';
import Link from 'next/link';

interface Customer {
    IDPelanggan: string;
    NamaPelanggan: string;
    TglDaftar: string;
    TotalPoin: string;
}

const Pelanggan: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [customersPerPage] = useState<number>(6);

    useEffect(() => {
        const fetchCustomers = async () => {
            const response = await fetch('/api/pelanggan/getCustomer');
            if (!response.ok) {
                console.error('Failed to fetch customers');
                return;
            }
            const data = await response.json();
            console.log('Fetched Customers:', data); // Tambahkan log untuk debug
            setCustomers(data); // Mengatur state customers
        };

        fetchCustomers(); // Call the function to fetch data when the component mounts
    }, []); // Empty dependency array ensures it only runs once on mount

    // Filter pelanggan berdasarkan input pencarian
    const filteredCustomers = customers.filter((customer) =>
        customer.NamaPelanggan.toLowerCase().includes(searchInput.toLowerCase()) ||
        customer.IDPelanggan.toLowerCase().includes(searchInput.toLowerCase())
    );

    // Logic untuk menampilkan pelanggan sesuai dengan halaman yang aktif
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

    // Fungsi untuk mengubah halaman aktif
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Menghitung total halaman
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    // Fungsi Hapus Pelanggan
    const handleDelete = async (id: string) => {
        const response = confirm("Apakah Anda yakin ingin menghapus pelanggan ini?");
        if (response) {
            const deleteResponse = await fetch(`/api/pelanggan/deleteCustomer?id=${id}`, {
                method: 'DELETE',
            });

            if (deleteResponse.ok) {
                alert('Pelanggan berhasil dihapus');
                setCustomers((prev) => prev.filter((customer) => customer.IDPelanggan !== id)); // Menghapus pelanggan dari state
            } else {
                alert('Gagal menghapus pelanggan');
            }
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Pelanggan" onMenuClick={() => { }} />
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Pelanggan</h1>
                <hr className={styles.separator} />
                <div className={styles.searchContainer}>
                    <div className={styles.inputContainer}>
                        <Icon icon="mdi:search" width="24" height="24" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Cari pelanggan..."
                            className={styles.searchInput}
                            value={searchInput} // Menghubungkan input dengan state
                            onChange={(e) => setSearchInput(e.target.value)} // Memperbarui state saat input berubah
                        />
                    </div>
                    <Link href="/pelanggan/add" passHref>
                        <button className={styles.addButton}>Tambah</button>
                    </Link>
                </div>
                <table className={styles.customerTable}>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Tanggal Daftar</th>
                            <th>Total Poin</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCustomers.length > 0 ? (
                            currentCustomers.map((customer, index) => (
                                <tr key={customer.IDPelanggan}>
                                    <td>{index + 1 + (currentPage - 1) * customersPerPage}</td>
                                    <td>{customer.NamaPelanggan}</td>
                                    <td>{customer.TglDaftar}</td>
                                    <td>{customer.TotalPoin}</td>
                                    <td>
                                        <Link href={`/pelanggan/${customer.IDPelanggan}`}>
                                            <Icon icon="mage:information-circle-fill" width="24" height="24" className={`${styles.actionIcon} ${styles.detailIcon}`} />
                                        </Link>
                                        <Link href={`/pelanggan/edit/${customer.IDPelanggan}`} passHref>
                                            <Icon icon="mynaui:edit-solid" width="24" height="24" className={`${styles.actionIcon} ${styles.editIcon}`} />
                                        </Link>
                                        <Icon icon="mdi:delete" width="24" height="24" className={`${styles.actionIcon} ${styles.deleteIcon}`}
                                            onClick={() => handleDelete(customer.IDPelanggan)}
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

export default Pelanggan;
