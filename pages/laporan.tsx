import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import "jspdf-autotable";
import html2canvas from 'html2canvas';
import styles from '../style/laporan.module.css';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { Icon } from '@iconify/react';

interface Report {
    IDTransaksi: string;
    TglTransaksi: string;
    IDMenu: string;
    NamaMenu: string;
    JumlahPesan: number;
    SubTotal: number;
    NamaPelanggan: string;
    NamaPegawai: string;
}

interface GroupedReport {
    IDTransaksi: string;
    TglTransaksi: string;
    Pelanggan: string;
    Pegawai: string;
    NamaMenu: string;
    totalSubTotal: number;
    items: Report[];
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const Laporan: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedReport, setSelectedReport] = useState<GroupedReport | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [reportsPerPage] = useState<number>(10);  // Misalnya, 5 laporan per halaman

    useEffect(() => {
        const fetchReports = async () => {
            const response = await fetch('/api/laporan/getReport');
            if (!response.ok) {
                console.error('Failed to fetch reports');
                return;
            }
            const data = await response.json();
            console.log('Fetched Reports:', data); // Tambahkan ini untuk memeriksa data
            setReports(data);
        };
    
        fetchReports();
    }, []);    

    const filteredReports = reports.filter(report => {
    const reportDate = new Date(report.TglTransaksi);
    
    // Atur waktu ke 00:00:00 pada tanggal yang dipilih
    const start = startDate ? new Date(startDate + 'T00:00:00') : null;  // Mengatur waktu mulai
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;  // Mengatur waktu akhir
    
    return (!start || reportDate >= start) && (!end || reportDate <= end);
    });

    const groupedReports: GroupedReport[] = Object.values(
        filteredReports.reduce((acc, report) => {
            if (!acc[report.IDTransaksi]) {
                acc[report.IDTransaksi] = {
                    IDTransaksi: report.IDTransaksi,
                    TglTransaksi: report.TglTransaksi,
                    Pelanggan: report.NamaPelanggan,
                    Pegawai: report.NamaPegawai,
                    NamaMenu: report.NamaMenu,
                    totalSubTotal: 0,
                    items: []
                };
            }
            acc[report.IDTransaksi].totalSubTotal += Number(report.SubTotal);
            acc[report.IDTransaksi].items.push(report);
            return acc;
        }, {} as Record<string, GroupedReport>)
    );
    
    // Mengurutkan groupedReports berdasarkan IDTransaksi (ekstrak angka dari ID)
    groupedReports.sort((a, b) => {
        const trxA = a.IDTransaksi.match(/\d+/)?.[0]; // Ambil angka dari IDTransaksi
        const trxB = b.IDTransaksi.match(/\d+/)?.[0];
        return trxA && trxB ? parseInt(trxA) - parseInt(trxB) : 0;
    });

    // Menentukan data yang akan ditampilkan di halaman yang aktif
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    const currentReports = groupedReports.slice(indexOfFirstReport, indexOfLastReport);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


    const openModal = (report: GroupedReport) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedReport(null);
        setIsModalOpen(false);
    };

    const printPDF = () => {
        if (!selectedReport) return;
    
        const input = document.getElementById('report-detail');

        
        if (input) {
            html2canvas(input, {
                scale: 2, // Atur skala untuk meningkatkan resolusi (default: 1)
                useCORS: true // Mengatasi masalah CORS jika ada
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 190; // Sesuaikan dengan lebar konten
                const pageHeight = pdf.internal.pageSize.height;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let position = 10;
    
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                pdf.save(`Laporan_${selectedReport.IDTransaksi}.pdf`);
            });
        }
    };

    const printFrontEnd = () => {
        if (filteredReports.length === 0) return;
    
        const pdf = new jsPDF('p', 'mm', 'a4'); // Membuat PDF dengan ukuran A4
        const pageWidth = pdf.internal.pageSize.width; // Lebar halaman
        const pageHeight = pdf.internal.pageSize.height; // Tinggi halaman
        const date = new Date();
        const formattedDate = date.toLocaleDateString('id-ID');
        let position = 20; // Posisi vertikal untuk konten
    
        // Menambahkan Header (Judul)
        const title = 'Laporan Transaksi';
        const titleFontSize = 18; // Ukuran font yang digunakan untuk judul
        pdf.setFont('courier');
        pdf.setFontSize(titleFontSize); // Mengatur ukuran font judul
        const titleWidth = pdf.getTextWidth(title); // Mengukur panjang teks judul
        const titleX = (pageWidth - titleWidth) / 2; // Menghitung posisi X agar teks berada di tengah
        pdf.setTextColor(0); // Warna teks hitam
        pdf.text(title, titleX, position); // Menempatkan teks di posisi tengah
        position += titleFontSize + 0; // Pindah posisi vertikal setelah judul
    
        // Menambahkan informasi tambahan (misal: tanggal laporan)
        pdf.setFont('courier');
        pdf.setFontSize(12);
        pdf.setTextColor(0);
        pdf.text(`Tanggal Cetak: ${formattedDate}`, 10, position);
        position += 10;
    
        // Menambahkan garis pemisah yang lebih halus
        pdf.setDrawColor(0); // Warna garis pemisah hitam
        pdf.line(10, position, pageWidth - 10, position); // Garis horizontal pemisah, menyesuaikan dengan lebar halaman
        position += 5;
    
        // Tabel Daftar Transaksi
        const tableData = groupedReports.map(group => [
            group.IDTransaksi,
            formatDate(group.TglTransaksi),
            `Rp ${group.totalSubTotal.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`
        ]);
    
        // Menambahkan Tabel Daftar Transaksi
        (pdf as any).autoTable({
            startY: position,
            head: [['ID Transaksi', 'Tanggal', 'Total Harga']],
            body: tableData,
            theme: 'grid', // Tema grid untuk tabel
            margin: { top: 10, left: 20, right: 10 }, // Menambahkan margin kiri dan kanan
            styles: {
                fontSize: 9,  // Ukuran font untuk tabel
                cellPadding: 4, // Padding antar sel
                halign: 'center', // Menyusun teks di tengah
                valign: 'middle', // Menyusun teks secara vertikal di tengah
                textColor: [50, 50, 50], // Menggunakan warna abu-abu gelap untuk teks agar lebih lembut
                lineWidth: 0, // Tanpa border antar sel
            },
            headStyles: {
                fillColor: [180, 198, 220], // Warna header lebih lembut (terang biru-pasir)
                textColor: [0, 0, 0], // Menggunakan teks berwarna hitam di header
                fontSize: 10, // Ukuran font header lebih kecil untuk tampilan lebih elegan
                fontStyle: 'bold', // Menebalkan teks header untuk kontras
                lineColor: [100, 100, 100], // Tanpa garis border antar sel
                lineWidth: 0.01, // Menjaga border agar tidak ada
            },
            bodyStyles: {
                lineColor: [100, 100, 100], // Tanpa garis border antar sel
                lineWidth: 0.01, // Menjaga border agar tidak ada
            },
            columnStyles: {
                0: { cellWidth: 40 }, // Lebar kolom pertama
                1: { cellWidth: 85 }, // Lebar kolom kedua
                2: { cellWidth: 45 }, // Lebar kolom ketiga
            }
        });
    
        position = (pdf as any).lastAutoTable.finalY + 10; // Update posisi setelah tabel
    
        // Menjumlahkan total pendapatan dari semua laporan terfilter
        const totalPendapatan = groupedReports.reduce((sum, group) => sum + group.totalSubTotal, 0);
    
        // Menambahkan informasi Total Pendapatan
        pdf.setFont('helvetica');
        pdf.setFontSize(10); // Ukuran font untuk total pendapatan
        pdf.setTextColor(0); // Menggunakan teks hitam
        const totalText = `Total Pendapatan: Rp ${totalPendapatan.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
        const totalWidth = pdf.getTextWidth(totalText);
        // Menghitung posisi X untuk teks berada di kanan halaman dengan sedikit margin (misalnya 10mm dari sisi kanan)
        const totalX = pageWidth - totalWidth - 20; // Margin 10mm dari sisi kanan
        pdf.text(totalText, totalX, position); // Menempatkan total pendapatan di kanan halaman
    
        // Menyimpan PDF
        pdf.save('Laporan_Seluruh_Transaksi.pdf');
    };    
    
    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Laporan" onMenuClick={() => { }}/>
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Laporan</h1>
                <hr className={styles.separator} />
                <div className={styles.inputContainer}>
                    <label><strong>Tanggal Mulai</strong></label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={styles.dateInput}
                    />
                    <label><strong>Tanggal Akhir</strong></label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={styles.dateInput}
                    />
                    <button 
                        onClick={printFrontEnd} 
                        className={`${styles.printAllButton} ${filteredReports.length === 0 ? styles.disabledButton : ''}`} 
                        disabled={filteredReports.length === 0}>
                        {/* Ikon print outline untuk default */}
                        <Icon 
                            icon={filteredReports.length === 0 ? "material-symbols-light:print-disabled-outline-rounded" : "prime:print"} 
                            width="35" 
                            height="35" 
                            className={filteredReports.length === 0 ? styles.disabledIcon : styles.icon} 
                        />
                    </button>
                </div>
                <table className={styles.reportTable}>
                    <thead>
                        <tr>
                            <th>ID Transaksi</th>
                            <th>Tanggal Transaksi</th>
                            <th>Total</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                    {currentReports.length === 0 ? (
                        <tr>
                            <td colSpan={4} className={styles.noData}>Tidak ada laporan!</td>
                        </tr>
                    ) : (
                        currentReports.map((group, index) => (
                            <tr key={index}>
                                <td>{group.IDTransaksi}</td>
                                <td>{formatDate(group.TglTransaksi)}</td>
                                <td>Rp {group.totalSubTotal.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</td>
                                <td>
                                <button
                                        className={styles.actionButton}
                                        onClick={() => openModal(group)}
                                    >
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
                </table>

                <div className={styles.pagination}>
                    {/* Tombol Previous */}
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Sebelumnya
                    </button>

                    {/* Tombol Halaman */}
                    {Array.from({ length: Math.ceil(groupedReports.length / reportsPerPage) }, (_, index) => (
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
                        disabled={currentPage === Math.ceil(groupedReports.length / reportsPerPage)}
                    >
                        Berikutnya
                    </button>
                </div>

                {selectedReport && (
                    <Modal show={isModalOpen} onClose={closeModal} title={`Detail Transaksi [${selectedReport.IDTransaksi}]`}>
                        <div id="report-detail">
                            {/* Container untuk informasi transaksi */}
                            <div className={styles.infoContainer}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>ID Transaksi:</span>
                                    <span className={styles.infoValue}>{selectedReport.IDTransaksi}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Tanggal Transaksi:</span>
                                    <span className={styles.infoValue}>{formatDate(selectedReport.TglTransaksi)}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Pelanggan:</span>
                                    <span className={styles.infoValue}>{selectedReport.Pelanggan}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Pegawai:</span>
                                    <span className={styles.infoValue}>{selectedReport.Pegawai}</span>
                                </div>
                            </div>

                            <hr className={styles.separator} />

                            {/* Tabel Detail Transaksi */}
                            <table className={styles.modalReportTable}>
                                <thead>
                                    <tr>
                                        <th>ID Menu</th>
                                        <th>Nama Menu</th>
                                        <th>Jumlah Pesan</th>
                                        <th>Harga per Menu</th>
                                        <th>Sub Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedReport.items.map((item, itemIndex) => (
                                        <tr key={itemIndex}>
                                            <td>{item.IDMenu}</td>
                                            <td>{item.NamaMenu}</td>
                                            <td>{item.JumlahPesan}</td>
                                            <td>Rp {(item.SubTotal / item.JumlahPesan).toLocaleString('id-ID', { minimumFractionDigits: 2 })}</td>
                                            <td>Rp {item.SubTotal.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className={styles.totalContainer}>
                                <span className={styles.infoLabel}>Total Harga:</span>
                                <span className={styles.infoValue}>Rp {selectedReport.totalSubTotal.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</span>
                            </div>
                            
                            <button onClick={printPDF} className={styles.printButton}>
                                Cetak PDF
                            </button>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default Laporan;