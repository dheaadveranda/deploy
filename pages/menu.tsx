import styles from '../style/menu/menu.module.css';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Menu {
    IDMenu: string;
    NamaMenu: string;
    HargaMenu: string;
    KategoriMenu: string;
    Gambar?: string;
}

const Menu: React.FC = () => {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchInput, setSearchInput] = useState<string>('');
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Status loading
    const router = useRouter();

    // Fetch data menu saat halaman dimuat
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                setIsLoading(true); // Set loading ke true
                const response = await fetch('/api/menu/getMenu');
                if (!response.ok) {
                    console.error('Failed to fetch menus');
                    setIsLoading(false);
                    return;
                }
                const data: Menu[] = await response.json();
                setMenus(data);

                const uniqueCategories = Array.from(new Set(data.map((menu) => menu.KategoriMenu)));
                setCategories(['All', ...uniqueCategories]);
            } catch (error) {
                console.error('Error fetching menus:', error);
            } finally {
                setIsLoading(false); // Set loading ke false
            }
        };
        fetchMenus();
    }, [router]);

    const filteredMenus = menus.filter((menu) =>
        (selectedCategory === 'All' || menu.KategoriMenu === selectedCategory) &&
        (menu.NamaMenu.toLowerCase().includes(searchInput.toLowerCase()) ||
            menu.IDMenu.toLowerCase().includes(searchInput.toLowerCase()))
    );    

    // Hapus menu berdasarkan ID
    const handleDelete = async (id: string) => {
        const response = confirm("Apakah Anda yakin ingin menghapus menu ini?");
        if (response) {
            const deleteResponse = await fetch(`/api/menu/deleteMenu?id=${id}`, {
                method: 'DELETE',
            });

            if (deleteResponse.ok) {
                alert('Menu berhasil dihapus');
                setMenus((prev) => prev.filter((menu) => menu.IDMenu !== id)); // Menghapus menu dari state
            } else {
                alert('Gagal menghapus menu');
            }
        }
    };          

    // Fungsi untuk toggle dropdown aksi (Edit/Delete)
    const toggleDropdown = (id: string) => {
        setDropdownOpen((prev) => (prev === id ? null : id)); // Toggle dropdown berdasarkan ID
    };

    // Fungsi untuk mendapatkan kelas kategori
    const getCategoryClass = (category: string) => {
        switch (category.toLowerCase()) {
            case 'coffee':
                return styles.categoryCoffee;
            case 'tea':
                return styles.categoryTea;
            case 'food':
                return styles.categoryFood;
            case 'milkbased':
                return styles.categoryMilkbased;
            case 'signature drink':
                return styles.categorySignatureDrink;
            default:
                return ''; // Default jika kategori tidak ditemukan
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="menu" onMenuClick={() => {}}/>
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Kelola Menu</h1>
                {isLoading ? (
                    <div className={styles.loading}>Loading...</div>
                ) : (
                    <>
                        {/* Filter Kategori */}
                        <div className={styles.categoryContainer}>
                            {categories.map((category) => (
                                <button
                                key={category}
                                className={`${styles.categoryButton} ${
                                    selectedCategory === category
                                        ? `${styles.categoryButtonActive} ${styles[`category${category.replace(/\s+/g, '')}`]}`
                                        : styles[`category${category.replace(/\s+/g, '')}`]
                                }`}
                                onClick={() => {
                                    console.log(`Category clicked: ${category}`);
                                    setSelectedCategory(category);
                                }}
                            >
                                {category}
                            </button>                            
                            ))}
                        </div>

                        {/* Pencarian dan Tombol Tambah */}
                        <div className={styles.searchContainer}>
                            <div className={styles.inputContainer}>
                                <Icon icon="mdi:search" width="24" height="24" className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Cari menu..."
                                    className={styles.searchInput}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <Link href="/menu/add" passHref>
                                <button className={styles.addButton}>Tambah</button>
                            </Link>
                        </div>

                        {/* Daftar Menu */}
                        <div className={styles.cardContainer}>
                            {filteredMenus.map((menu) => (
                                <div
                                    className={styles.card}
                                    key={menu.IDMenu}
                                    onClick={() => router.push(`/menu/${menu.IDMenu}`)} // Klik card ke halaman informasi
                                >
                                    {/* Gambar */}
                                    <div className={styles.cardImage}>
                                    {menu.Gambar ? (
                                        <img src={menu.Gambar} alt={menu.NamaMenu} className={styles.menuImage} />
                                    ) : (
                                        <div className={styles.noImage}>Tidak Ada Gambar</div>
                                    )}
                                    </div>


                                    {/* Detail Menu */}
                                    <div className={styles.cardDetails}>
                                        <div className={styles.menuName}>{menu.NamaMenu}</div>
                                        <div className={styles.cardBottom}>
                                            <span
                                                className={`${styles.menuCategory} ${getCategoryClass(
                                                    menu.KategoriMenu
                                                )}`}
                                            >
                                                {menu.KategoriMenu}
                                            </span>
                                            <span className={styles.menuPrice}>Rp {menu.HargaMenu}</span>
                                        </div>
                                    </div>

                                    {/* Dropdown Aksi */}
                                    <div
                                        className={styles.cardActionsDropdown}
                                        onClick={(e) => e.stopPropagation()} // Cegah klik dropdown memicu navigasi card
                                    >
                                        <Icon
                                            icon="mdi:dots-vertical"
                                            className={styles.dropdownButton}
                                            onClick={() => toggleDropdown(menu.IDMenu)}
                                        />
                                        <div
                                            className={`${styles.dropdownMenu} ${
                                                dropdownOpen === menu.IDMenu ? styles.show : ''
                                            }`}
                                        >
                                            <div
                                                className={styles.dropdownItem}
                                                onClick={() => router.push(`/menu/edit/${menu.IDMenu}`)}
                                            >
                                                Edit
                                            </div>
                                            <div
                                                className={styles.dropdownItem}
                                                onClick={() => handleDelete(menu.IDMenu)}
                                            >
                                                Delete
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Menu;
