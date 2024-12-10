//transaksi.tsx
// pages/transaksi.tsx
import { useState, useEffect } from 'react';
import styles from '../style/transaksi.module.css';
import Sidebar from '../components/Sidebar';
import { Icon } from '@iconify/react';
import Select from 'react-select';
import { fetchData } from '../utils/fetchHelpers';
import Modal from '../components/Modal';
interface Customer {
    IDPelanggan: string;
    NamaPelanggan: string;
    TglDaftar: string;
    TotalPoin: number;
}

interface Employee {
    IDPegawai: string;
    NamaPegawai: string;
    NoHP: string;
    TglBergabung: string;
    Peran: string;
}

interface Menu {
    IDMenu: string;
    Gambar: string;
    NamaMenu: string;
    HargaMenu: number;
    Deskripsi: string;
    KategoriMenu: string;
}

interface TransactionItem {
    IDTransaksi: string;
    TglTransaksi: string;
    IDPegawai: string;
    IDPelanggan: string;
    JumlahPesan: number;
    SubTotal: number;
    TotalHarga: number;
    Diskon: number;
    KategoriMenu: string;
}

const Transaksi: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState('Transaksi');
    const [nominal, setNominal] = useState('');
    const [kembalian, setKembalian] = useState(0);
    const [today, setToday] = useState('');
    const [selectedPelanggan, setSelectedPelanggan] = useState<Customer | null>(null);
    const [selectedPegawai, setSelectedPegawai] = useState<Employee | null>(null);
    const [pelangganList, setPelangganList] = useState<Customer[]>([]);
    const [pegawaiList, setPegawaiList] = useState<Employee[]>([]);
    const [menuList, setMenuList] = useState<Menu[]>([]);
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [transactionID, setTransactionID] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [referralCode, setReferralCode] = useState(""); // Kode Referral
    const [isDiscountApplied, setIsDiscountApplied] = useState(false);
    const [discount, setdiscount] = useState(0);
    const [metodePembayaran, setMetodePembayaran] = useState<string>('Cash'); // Default: Cash
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [poin, setPoin] = useState("");
    const [currentCustomers, setCurrentCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        const getCurrentDate = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        console.log(getCurrentDate());

        const fetchCustomers = async () => {
            const response = await fetch('/api/pelanggan/getCustomer');
            const data = await response.json();
            setCustomers(data);
        };
        fetchCustomers();

        setToday(getCurrentDate());

        fetchData('/api/menu/getMenu', setMenuList, () => setMenuList([]));
        fetchData('/api/pegawai/getEmployee', setPegawaiList, () => setPegawaiList([]));
        fetchData('/api/pelanggan/getCustomer', setPelangganList, () => setPelangganList([]));

        fetch('/api/transaksi/getLatestTransactionID')
            .then(response => response.json())
            .then((data) => {
                const newID = data.latestID
                    ? `TRX${(parseInt(data.latestID.replace('TRX', ''), 10) + 1).toString().padStart(4, '0')}`
                    : 'TRX0001';
                setTransactionID(newID);
            })
            .catch(() => setTransactionID('TRX0001'));
    }, []);

    const itemsPerPage = 10;
    const currentItems = menuList
        .filter(menu => menu.NamaMenu.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

    const calculateTotalBayar = () => {
        const total = transactions.reduce((total, item) => total + (Number(item.SubTotal) || 0), 0);
        return isDiscountApplied ? total * 0.9 : total; // Jika diskon diterapkan, kurangi total dengan 10%
    };

    const toggleModal = () => setIsModalOpen(prev => !prev);

    const handleAddToTransaction = (menu: Menu) => {
        if (menu.HargaMenu != null) {
            setTransactions((prevTransactions) => {
                const existingItemIndex = prevTransactions.findIndex(
                    (item) => item.IDTransaksi === menu.IDMenu
                );

                if (existingItemIndex !== -1) {
                    const updatedTransactions = [...prevTransactions];
                    const existingItem = updatedTransactions[existingItemIndex];
                    updatedTransactions[existingItemIndex] = {
                        ...existingItem,
                        JumlahPesan: existingItem.JumlahPesan + 1,
                        SubTotal: (existingItem.JumlahPesan + 1) * menu.HargaMenu,
                        TotalHarga: (existingItem.JumlahPesan + 1) * menu.HargaMenu,
                        Diskon: 0
                    };
                    return updatedTransactions;
                } else {
                    const newTransactionItem: TransactionItem = {
                        IDTransaksi: menu.IDMenu,
                        TglTransaksi: today,
                        IDPegawai: selectedPegawai?.IDPegawai || '',
                        IDPelanggan: selectedPelanggan?.IDPelanggan || '',
                        JumlahPesan: 1,
                        SubTotal: menu.HargaMenu,
                        TotalHarga: menu.HargaMenu,
                        KategoriMenu: menu.KategoriMenu,
                        Diskon: 0
                    };
                    return [...prevTransactions, newTransactionItem];
                }
            });
        } else {
            console.error('Invalid menu price');
            alert('This menu item does not have a valid price.');
        }
    };

    const handleDeleteTransaction = (id: string) =>
        setTransactions(transactions.filter(transaction => transaction.IDTransaksi !== id));

    const handleApplyDiscount = () => {
        if (!referralCode) {
            alert('Silakan masukkan kode referral untuk mendapatkan diskon!');
            return;
        }

        if (isDiscountApplied) {
            alert('Diskon sudah diterapkan sebelumnya.');
            return;
        }

        const totalWithDiscount = calculateTotalBayar() * 0.9; // Diskon 10%
        const discountAmount = calculateTotalBayar() - totalWithDiscount;

        setdiscount(discountAmount); // Simpan nilai diskon
        setKembalian(Number(totalWithDiscount) - Number(nominal)); // Update kembalian
        setIsDiscountApplied(true); // Tandai diskon sudah diterapkan
        alert(`Diskon 10% telah diterapkan!`);
    };

    const handleSaveTransaction = () => {
        // 1. Konversi nominal ke number
        const nominalValue = parseFloat(nominal);

        // 2. Validasi transaksi, pelanggan, pegawai, dan nominal pembayaran
        if (!transactions.length) return alert('Tidak ada transaksi untuk disimpan!');
        if (!selectedPelanggan) return alert('Silakan pilih pelanggan sebelum menyimpan transaksi.');
        if (!selectedPegawai) return alert('Silakan pilih pegawai sebelum menyimpan transaksi.');

        // 3. Siapkan objek payload yang akan digunakan untuk semua jenis transaksi
        // let TglTransaksi = new Date().toISOString().replace('T', ' ').split('.')[0];

        const payload: any = {
            Transaksi: transactionID,
            TglTransaksi: new Date().toISOString(),
            // TglTransaksi: TglTransaksi,
            IDPegawai: selectedPegawai.IDPegawai,
            IDPelanggan: selectedPelanggan?.IDPelanggan || 'GUEST0001',
            Items: transactions,
            MetodePembayaran: metodePembayaran,
            ReferralCode: null,
            TotalPoin: selectedPelanggan?.TotalPoin || 0,
            TotalBayar: 0,
            kembalian: 0,
        };
        console.log('Payload Beingg sent:', payload);

        // 4. Jika metode pembayaran adalah "Poin"
        if (metodePembayaran === "Poin") {
            // a. Validasi poin pelanggan
            if (!selectedPelanggan || selectedPelanggan.TotalPoin < 10) {
                alert("Poin tidak mencukupi!");
                return;
            }

            // b. Validasi menu yang eligible (misalnya hanya menu tertentu yang bisa dibayar dengan poin)
            const eligibleMenu = transactions.filter((transaction) =>
                ["Coffee", "MilkBased", "Tea"].includes(transaction.KategoriMenu)
            );

            if (eligibleMenu.length !== 1 || eligibleMenu.some(item => item.JumlahPesan > 1)) {
                alert("Hanya boleh memilih satu menu dari kategori Coffee, MilkBased, atau Tea.");
                return;
            }

            // c. Kurangi poin pelanggan
            // const updatedPelanggan = {
            //     ...selectedPelanggan,
            //     TotalPoin: selectedPelanggan.TotalPoin - 10,  // Misal, setiap transaksi mengurangi 10 poin
            // };
            // setSelectedPelanggan(updatedPelanggan);  // Update pelanggan setelah poin berkurang

            // d. Perbarui payload untuk transaksi menggunakan poin
            // payload.TotalPoin = updatedPelanggan.TotalPoin;
            payload.TotalBayar = 0;  // Tidak ada pembayaran yang harus dibayar jika menggunakan poin
            payload.kembalian = 0;   // Tidak ada kembalian jika menggunakan poin
            payload.ReferralCode = referralCode || null;  // Only set referralCode if it exists
        } else {
            // 5. Jika metode pembayaran adalah uang (nominal)
            if (isNaN(nominalValue) || nominalValue <= 0) return alert('Silakan bayar dengan nominal yang valid.');

            // 6. Hitung total bayar dan kembalian
            const totalBayar = calculateTotalBayar(); // Fungsi untuk menghitung total transaksi
            const calculatedKembalian = nominalValue - totalBayar;

            // 7. Validasi kembalian
            if (calculatedKembalian < 0) {
                alert('Nominal tidak mencukupi total pembayaran!');
                return;
            }

            // 8. Perbarui payload untuk transaksi menggunakan uang
            payload.TotalBayar = totalBayar;
            payload.kembalian = calculatedKembalian;

            // 9. Validasi referral code (hanya untuk GUEST)
            const isGuest = selectedPelanggan?.NamaPelanggan?.startsWith('GUEST');
            if (!isGuest && referralCode) {
                alert("Referral code can only be used by GUEST customers.");
                return;
            }

            payload.ReferralCode = isGuest ? referralCode : null;
        }

        console.log('Payload transaksi:', payload);

        // 10. Simpan transaksi ke server
        saveTransactionToServer(payload);
    };



    // Fungsi untuk menyimpan transaksi ke server
    const saveTransactionToServer = (payload: any) => {
        fetch('/api/transaksi/saveTransaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    // Transaksi berhasil
                    alert('Transaksi berhasil disimpan!');
                    setTransactions([]); // Reset transaksi
                    setNominal(''); // Reset nominal
                    setKembalian(0); // Reset kembalian
                    setTransactionID(`TRX${(parseInt(transactionID.replace('TRX', ''), 10) + 1).toString().padStart(4, '0')}`); // Generate ID baru
                    console.log('data pelanggan yang diperbaharui:', data);

                    // if (data.updatedPelanggan) {
                    //     setSelectedPelanggan(data.updatedPelanggan);
                    //     handleNewupdateCustomer(data.updatedPelanggan);
                    //     console.log('data pelanggan yang diperbaharui:', data.updatedPelanggan);
                    // }

                    // Tangani kode referral baru (jika ada)
                    if (data.KodeReferralBaru) {
                        alert(`Kode referral sudah mencapai batas. Gunakan kode referral baru: ${data.KodeReferralBaru}`);
                        handleNewReferralCode(data.KodeReferralBaru); // Update referral di frontend
                    }
                } else {
                    // Tampilkan pesan error dari server
                    alert(data.message || 'Gagal menyimpan transaksi.');
                }
            })
            .catch((error) => {
                console.error('Kesalahan saat menyimpan transaksi:', error.message);
                alert(`Terjadi kesalahan saat menyimpan transaksi: ${error.message}`);
            });
            let test = fetch('/api/transaksi/saveTransaction');
        console.log(test);
    };

    const handleCancelTransaction = () => {
        setTransactions([]);
        setNominal('');
        setKembalian(0);
        setSelectedPelanggan(null);
        setSelectedPegawai(null);
        fetch('/api/transaksi/getLatestTransactionID')
            .then(response => response.json())
            .then((data) => {
                const newID = data.latestID
                    ? `TRX${(parseInt(data.latestID.replace('TRX', ''), 10) + 1).toString().padStart(4, '0')}`
                    : 'TRX0001';
                setTransactionID(newID);
            })
            .catch(() => setTransactionID('TRX0001'));
    };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Transaksi</h1>
                <hr className={styles.separator} />

                <div className={styles.inputContainer}>
                    <div className={styles.inputField}>
                        <label>ID Transaksi</label>
                        <input type="text" value={transactionID} readOnly className={styles.inputText} />
                    </div>
                    <div className={styles.inputField}>
                        <label>Tanggal</label>
                        <input type="date" value={today} readOnly className={styles.inputDate} />
                    </div>
                    <div className={styles.inputField}>
                        <label>Referral</label>
                        <input type="text" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className={styles.inputText} />
                    </div>
                    <div className={styles.inputField}>
                        <label>Pelanggan</label>
                        <Select
                            value={selectedPelanggan}
                            onChange={(selectedOption) => setSelectedPelanggan(selectedOption || null)}
                            options={pelangganList}
                            getOptionLabel={(option) => option.NamaPelanggan}
                            getOptionValue={(option) => option.IDPelanggan}
                            className={styles.selectText}
                            placeholder="Pilih atau cari pelanggan"
                            isSearchable
                        />
                    </div>
                    <div className={styles.inputField}>
                        <label>Pegawai</label>
                        <Select
                            value={selectedPegawai}
                            onChange={(selectedOption) => setSelectedPegawai(selectedOption || null)}
                            options={pegawaiList}
                            getOptionLabel={(option) => option.NamaPegawai}
                            getOptionValue={(option) => option.IDPegawai}
                            className={styles.selectText}
                            placeholder="Pilih atau cari pegawai"
                            isSearchable
                        />
                    </div>
                </div>

                <button className={styles.addButton} onClick={toggleModal}>Add Menu</button>

                <Modal show={isModalOpen} onClose={toggleModal} title="Daftar Menu">
                    <input
                        type="text"
                        placeholder="Cari menu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.search}
                    />
                    <table className={styles.menuTable}>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Gambar</th>
                                <th>Nama Menu</th>
                                <th>Harga</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((menu, index) => (
                                <tr key={menu.IDMenu}>
                                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td>
                                        <img
                                            src={menu.Gambar}
                                            alt={menu.NamaMenu}
                                            className={styles.menuImage}
                                        />
                                    </td>
                                    <td>{menu.NamaMenu}</td>
                                    <td>Rp {menu.HargaMenu?.toLocaleString('id-ID') || 'N/A'}</td>
                                    <td>
                                        <button onClick={() => handleAddToTransaction(menu)} className={styles.addButton}>
                                            Tambah
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className={styles.pagination}>
                        {Array.from({ length: Math.ceil(menuList.length / itemsPerPage) }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activePage : ''}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </Modal>

                <div className={styles.tableContainer}>
                    <table className={styles.transactionTable}>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Menu</th>
                                <th>Jumlah</th>
                                <th>Sub Total</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr key={transaction.IDTransaksi}>
                                    <td>{index + 1}</td>
                                    <td>{menuList.find(menu => menu.IDMenu === transaction.IDTransaksi)?.NamaMenu || 'N/A'}</td>
                                    <td>
                                        <div className={styles.quantityContainer}>
                                            <input
                                                type="number"
                                                value={transaction.JumlahPesan}
                                                readOnly
                                                className={styles.inputNumber}
                                            />
                                            <div className={styles.quantityButtons}>
                                                <button
                                                    onClick={() =>
                                                        setTransactions((prevTransactions) =>
                                                            prevTransactions.map((item) =>
                                                                item.IDTransaksi === transaction.IDTransaksi
                                                                    ? {
                                                                        ...item,
                                                                        JumlahPesan: item.JumlahPesan + 1,
                                                                        SubTotal: (item.JumlahPesan + 1) * (menuList.find(m => m.IDMenu === item.IDTransaksi)?.HargaMenu || 0),
                                                                        TotalHarga: (item.JumlahPesan + 1) * (menuList.find(m => m.IDMenu === item.IDTransaksi)?.HargaMenu || 0),
                                                                    }
                                                                    : item
                                                            )
                                                        )
                                                    }
                                                    className={styles.quantityButton}
                                                >
                                                    <Icon icon="ei:plus" width="20" height="20" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setTransactions((prevTransactions) =>
                                                            prevTransactions.map((item) =>
                                                                item.IDTransaksi === transaction.IDTransaksi && item.JumlahPesan > 1
                                                                    ? {
                                                                        ...item,
                                                                        JumlahPesan: item.JumlahPesan - 1,
                                                                        SubTotal: (item.JumlahPesan - 1) * (menuList.find(m => m.IDMenu === item.IDTransaksi)?.HargaMenu || 0),
                                                                        TotalHarga: (item.JumlahPesan - 1) * (menuList.find(m => m.IDMenu === item.IDTransaksi)?.HargaMenu || 0),
                                                                    }
                                                                    : item
                                                            )
                                                        )
                                                    }
                                                    className={styles.quantityButton}
                                                >
                                                    <Icon icon="ei:minus" width="20" height="20" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Rp {transaction.SubTotal.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</td>
                                    <td>
                                        <button onClick={() => handleDeleteTransaction(transaction.IDTransaksi)}>
                                            <Icon icon="mdi:delete" width="24" height="24" className={`${styles.actionIcon} ${styles.deleteIcon}`} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={styles.paymentContainer}>
                    {/* Total Bayar */}
                    <div className={styles.totalContainer}>
                        <label>Metode Pembayaran:</label>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    name="metodePembayaran"
                                    value="Cash"
                                    checked={metodePembayaran === "Cash"}
                                    onChange={(e) => setMetodePembayaran(e.target.value)}
                                />
                                Cash
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="metodePembayaran"
                                    value="Poin"
                                    checked={metodePembayaran === "Poin"}
                                    onChange={(e) => setMetodePembayaran(e.target.value)}
                                />
                                Poin
                            </label>
                            {/* <div>
                            {filteredMenu.map((menu) => (
                                    <div key={menu.IDMenu}>
                                        <h4>{menu.NamaMenu}</h4>
                                        <p>Rp {menu.HargaMenu}</p>
                                        <button onClick={() => handleAddToTransaction(menu)}>Tambah</button>
                                    </div>
                                ))}
                            </div> */}
                        </div>
                    </div>
                    <div className={styles.totalContainer}>
                        <label>Total Bayar:</label>
                        <div className={styles.resultContainer}>
                            Rp {calculateTotalBayar().toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Nominal */}
                <div className={styles.totalContainer}>
                    <label>Nominal:</label>
                    <div className={styles.nominalContainer}>
                        <span className={styles.inputPrefix}>Rp</span>
                        <input
                            type="number"
                            value={nominal}
                            onChange={(e) => setNominal(e.target.value)}
                            className={styles.nominalInput}
                        />
                    </div>
                </div>

                {/* Kembalian */}
                <div className={styles.totalContainer}>
                    <label>Kembalian:</label>
                    <div className={styles.resultContainer}>
                        Rp {kembalian.toLocaleString('id-ID')}
                    </div>
                </div>

                {/* Diskon */}
                <div className={styles.totalContainer}>
                    <label>Diskon:</label>
                    <div className={styles.resultContainer}>
                        {referralCode ? `Rp ${discount.toLocaleString('id-ID', { minimumFractionDigits: 2 })}` : '-'}

                        {/* Ikon untuk Menerapkan Diskon */}
                        <Icon
                            icon="uim:process"
                            width="24"
                            height="24"
                            className={styles.discountIcon}
                            onClick={handleApplyDiscount}
                        />
                    </div>
                </div>

                {/* Tombol Simpan dan Batal */}
                <div className={styles.buttonContainer}>
                    <button className={styles.saveButton} onClick={handleSaveTransaction}>
                        Simpan
                    </button>
                    <button className={styles.cancelButton} onClick={handleCancelTransaction}>
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Transaksi;

function handleNewReferralCode(KodeReferralBaru: any) {
    throw new Error('Function not implemented.');
}
function setCustomers(arg0: (prevCustomers: any) => any) {
    throw new Error('Function not implemented.');
}
function handleNewupdateCustomer(updatedPelanggan: any) {
    throw new Error('Function not implemented.');
}