// pages/pegawai.tsx
import styles from '../style/pegawai/pegawai.module.css'; // Pastikan jalur ini benar
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Employee {
    IDPegawai: string;
    NamaPegawai: string;
    NoHP: string;
    TglBergabung: string;
    Peran: string;
}

const Pegawai: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [employeesPerPage] = useState<number>(6);

    useEffect(() => {
        const storedRole = sessionStorage.getItem('userRole');
        if (storedRole !== 'admin') {
            router.push('/dashboard');
        } else {
            const fetchEmployees = async () => {
                const response = await fetch('/api/pegawai/getEmployee');
                if (!response.ok) {
                    console.log('Failed to fetch employees');
                    return;
                }
                const data = await response.json();
                console.log('Fetched Employees:', data);
                setEmployees(data);
            };
            fetchEmployees()
        }
    }, [router]);

        // Filter pegawai berdasarkan input pencarian
        const filteredEmployees = employees.filter((employee) =>
            employee.NamaPegawai.toLowerCase().includes(searchInput.toLowerCase()) ||
            employee.IDPegawai.toLowerCase().includes(searchInput.toLowerCase())
        );

        // Logic untuk menampilkan pegawai sesuai dengan halaman yang aktif
        const indexOfLastEmployee = currentPage * employeesPerPage;
        const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
        const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

        // Fungsi untuk mengubah halaman aktif
        const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

        // Menghitung total halaman
        const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

        // Fungsi Hapus Pegawai
        const handleDelete = async (id: string) => {
            const response = confirm("Apakah Anda yakin ingin menghapus pegawai ini?");
            if (response) {
                const deleteResponse = await fetch(`/api/pegawai/deleteEmployee?id=${id}`, {
                    method: 'DELETE',
                });

                if (deleteResponse.ok) {
                    alert('Pegawai berhasil dihapus');
                    setEmployees((prev) => prev.filter((employee) => employee.IDPegawai !== id)); // Menghapus pegawai dari state
                } else {
                    alert('Gagal menghapus pegawai');
                }
            }
        };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Pegawai" onMenuClick={() => { }} />
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Pegawai</h1>
                <hr className={styles.separator} />
                <div className={styles.searchContainer}>
                    <div className={styles.inputContainer}>
                        <Icon icon="mdi:search" width="24" height="24" className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Cari pegawai..."
                            className={styles.searchInput}
                            value={searchInput} // Menghubungkan input dengan state
                            onChange={(e) => setSearchInput(e.target.value)} // Memperbarui state saat input berubah
                        />
                    </div>
                    <Link href="/pegawai/add" passHref>
                        <button className={styles.addButton}>Tambah</button>
                    </Link>
                </div>
                <table className={styles.employeeTable}>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>No HP</th>
                            <th>Tanggal Bergabung</th>
                            <th>Posisi</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentEmployees.length > 0 ? (
                            currentEmployees.map((employee, index) => (
                                <tr key={employee.IDPegawai}>
                                    <td>{index + 1 + (currentPage - 1) * employeesPerPage}</td>
                                    <td>{employee.NamaPegawai}</td>
                                    <td>{employee.NoHP}</td>
                                    <td>{employee.TglBergabung}</td>
                                    <td>{employee.Peran}</td>
                                    <td>
                                        <Link href={`/pegawai/${employee.IDPegawai}`}>
                                            <Icon icon="mage:information-circle-fill" width="24" height="24" className={`${styles.actionIcon} ${styles.detailIcon}`} />
                                        </Link>
                                        <Link href={`/pegawai/edit/${employee.IDPegawai}`} passHref>
                                            <Icon icon="mynaui:edit-solid" width="24" height="24" className={`${styles.actionIcon} ${styles.editIcon}`} />
                                        </Link>
                                        <Icon icon="mdi:delete" width="24" height="24" className={`${styles.actionIcon} ${styles.deleteIcon}`}
                                            onClick={() => handleDelete(employee.IDPegawai)}
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

export default Pegawai;
