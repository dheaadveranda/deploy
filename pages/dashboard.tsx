import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from '../style/dashboard.module.css';
import Sidebar from '../components/Sidebar';
import Card from '../components/card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the types
interface RevenueData {
    year: number;
    month: number;
    totalRevenue: number;
}

interface TransactionData {
    year: number;
    month: number;
    totalTransactions: number;
}

interface BestSellingMenu {
    NamaMenu: string;
}

interface DashboardData {
    revenueData: RevenueData[];
    totalCustomers: number;
    bestSellingMenu: BestSellingMenu[];
    transactionsData: TransactionData[];
}

const Dashboard: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string>('Dashboard');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null); // Specify DashboardData type
    const [yearFilter, setYearFilter] = useState<string>('2024');
    const [monthFilter, setMonthFilter] = useState<number>(11);
    const [showMonthlyRevenue, setShowMonthlyRevenue] = useState<boolean>(true);
    const [username, setUsername] = useState<string>(''); // Menyimpan username

    // Mengambil username dan role dari sessionStorage
    useEffect(() => {
        const storedUsername = sessionStorage.getItem('username');

        if (storedUsername) {
            setUsername(storedUsername);
        }

        // Ambil data dashboard dari API
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/dashboard/getDashboard');
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }
                const data: DashboardData = await response.json(); // Ensure the data follows DashboardData type
                setDashboardData(data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    // Menyusun data untuk grafik pendapatan per bulan
    const getRevenueChartData = () => {
        if (!dashboardData || !dashboardData.revenueData) return {
            labels: [],
            datasets: [],
        }; 

        const filteredRevenueData = dashboardData.revenueData.filter(
            (data: RevenueData) => data.year === parseInt(yearFilter)
        );

        const labels = showMonthlyRevenue
            ? filteredRevenueData.map((data: RevenueData) => `${data.month}/${data.year}`)
            : [yearFilter];

        const data = showMonthlyRevenue
            ? filteredRevenueData.map((data: RevenueData) => data.totalRevenue)
            : [filteredRevenueData.reduce((total: number, data: RevenueData) => total + data.totalRevenue, 0)];

        return {
            labels: labels.length ? labels : ['No Data'],
            datasets: data.length ? [{
                label: 'Pendapatan',
                data: data,
                borderColor: '#375BB2',
                backgroundColor: 'rgba(55, 91, 178)',
                borderWidth: 1,
            }] : [],
        };
    };

    const getTransactionsByMonth = (year: string, month: number) => {
        if (!dashboardData) return 0;

        const transaction = dashboardData.transactionsData.find(
            (data: TransactionData) => data.year === parseInt(year) && data.month === month
        );
        return transaction ? transaction.totalTransactions : 0;
    };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu={activeMenu} onMenuClick={setActiveMenu} />
            <div className={styles.main}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <p>Welcome, {username}</p> {/* Menampilkan nama pengguna */}
                    </div>
                </div>
                <h1 className={styles.pageTitle}>Dashboard</h1>
                <hr className={styles.separator} />
                <h2 className={styles.salesSummaryTitle}>Sales Summary</h2>

                <div className={styles.filters}>
                    <label>
                        Tahun:
                        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                            {dashboardData?.revenueData?.map((item: RevenueData) => (
                                <option key={item.year} value={item.year}>
                                    {item.year}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Bulan:
                        <select value={monthFilter} onChange={(e) => setMonthFilter(parseInt(e.target.value))}>
                            <option value={1}>Januari</option>
                            <option value={2}>Februari</option>
                            <option value={3}>Maret</option>
                            <option value={4}>April</option>
                            <option value={5}>Mei</option>
                            <option value={6}>Juni</option>
                            <option value={7}>Juli</option>
                            <option value={8}>Agustus</option>
                            <option value={9}>September</option>
                            <option value={10}>Oktober</option>
                            <option value={11}>November</option>
                            <option value={12}>Desember</option>
                        </select>
                    </label>
                    <label>
                        Tampilkan:
                        <select
                            value={showMonthlyRevenue ? 'monthly' : 'yearly'}
                            onChange={(e) => setShowMonthlyRevenue(e.target.value === 'monthly')}
                        >
                            <option value="monthly">Pendapatan Bulanan</option>
                            <option value="yearly">Pendapatan Tahunan</option>
                        </select>
                    </label>
                </div>

                <div className={styles.cardContainer}>
                    <Card title="Jumlah Transaksi Bulan Ini" value={getTransactionsByMonth(yearFilter, monthFilter)} />
                    <Card title="Jumlah Pelanggan" value={dashboardData?.totalCustomers} />
                    <Card title="Menu Terlaris" value={
                        <ul>
                            {dashboardData?.bestSellingMenu?.map((menu: BestSellingMenu) => (
                                <div key={menu.NamaMenu}>
                                    {menu.NamaMenu}
                                </div>
                            ))}
                        </ul>
                    } />
                </div>

                <div className={styles.chartContainer}>
                    <Bar data={getRevenueChartData()} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>

                <div className={styles.footer}>
                    <p>© 2024 Dhea & Dew. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
