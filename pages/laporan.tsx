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
    const [reportsPerPage] = useState<number>(8);

    useEffect(() => {
        const fetchReports = async () => {
            const response = await fetch('/api/laporan/getReport');
            if (!response.ok) {
                console.error('Failed to fetch reports');
                return;
            }
            const data = await response.json();
            console.log('Fetched Reports:', data);
            setReports(data);
        };

        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => {
        const reportDate = new Date(report.TglTransaksi);
        const start = startDate ? new Date(startDate + 'T00:00:00') : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;
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
                    items: [],
                };
            }
            acc[report.IDTransaksi].totalSubTotal += Number(report.SubTotal);
            acc[report.IDTransaksi].items.push(report);
            return acc;
        }, {} as Record<string, GroupedReport>)
    );

    groupedReports.sort((a, b) => {
        const trxA = a.IDTransaksi.match(/\d+/)?.[0];
        const trxB = b.IDTransaksi.match(/\d+/)?.[0];
        return trxA && trxB ? parseInt(trxA) - parseInt(trxB) : 0;
    });

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

        const input = document.getElementById('report-detail') as HTMLElement;
        if (input) {
            html2canvas(input, {
                scale: 2,
                useCORS: true
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4') as jsPDF & { autoTable: Function };
                const imgWidth = 190;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const position = 10;

                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                pdf.save(`Laporan_${selectedReport.IDTransaksi}.pdf`);
            });
        }
    };

    const printFrontEnd = () => {
        if (filteredReports.length === 0) return;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.width;
        const date = new Date();
        const formattedDate = date.toLocaleDateString('id-ID');
        let position = 20;

        const title = 'Laporan Transaksi';
        const titleFontSize = 18;
        pdf.setFont('courier');
        pdf.setFontSize(titleFontSize);
        const titleWidth = pdf.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2;
        pdf.setTextColor(0);
        pdf.text(title, titleX, position);
        position += titleFontSize + 10;

        pdf.setFont('courier');
        pdf.setFontSize(12);
        pdf.setTextColor(0);
        pdf.text(`Tanggal Cetak: ${formattedDate}`, 10, position);
        position += 10;

        pdf.setDrawColor(0);
        pdf.line(10, position, pageWidth - 10, position);
        position += 5;

        const tableData = groupedReports.map(group => [
            group.IDTransaksi,
            formatDate(group.TglTransaksi),
            `Rp ${group.totalSubTotal.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`
        ]);

        pdf.autoTable({
            startY: position,
            head: [['ID Transaksi', 'Tanggal', 'Total Harga']],
            body: tableData,
            theme: 'grid',
            margin: { top: 10, left: 20, right: 10 },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle',
                textColor: [50, 50, 50],
                lineWidth: 0,
            },
            headStyles: {
                fillColor: [180, 198, 220],
                textColor: [0, 0, 0],
                fontSize: 10,
                fontStyle: 'bold',
                lineColor: [100, 100, 100],
                lineWidth: 0.01,
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 85 },
                2: { cellWidth: 45 },
            }
        });

        position = (pdf as jsPDF & { autoTable: Function }).lastAutoTable.finalY + 10;

        const totalPendapatan = groupedReports.reduce((sum, group) => sum + group.totalSubTotal, 0);

        pdf.setFont('helvetica');
        pdf.setFontSize(10);
        pdf.setTextColor(0);
        const totalText = `Total Pendapatan: Rp ${totalPendapatan.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
        const totalWidth = pdf.getTextWidth(totalText);
        const totalX = pageWidth - totalWidth - 20;
        pdf.text(totalText, totalX, position);

        pdf.save('Laporan_Seluruh_Transaksi.pdf');
    };

    return (
        <div className={styles.container}>
            <Sidebar activeMenu="Laporan" onMenuClick={() => { }} />
            <div className={styles.main}>
                <h1 className={styles.pageTitle}>Laporan</h1>
                <hr className={styles.separator} />
                <div className={styles.inputContainer}>
                    <label><strong>Tanggal Mulai</strong></label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <label><strong>Tanggal Selesai</strong></label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <button className={styles.printButton} onClick={printFrontEnd}>
                        <Icon icon="mdi:printer" width={24} /> Cetak Laporan
                    </button>
                </div>

                <div className={styles.reportTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>ID Transaksi</th>
                                <th>Tanggal Transaksi</th>
                                <th>Total Harga</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentReports.map((report) => (
                                <tr key={report.IDTransaksi}>
                                    <td>{report.IDTransaksi}</td>
                                    <td>{formatDate(report.TglTransaksi)}</td>
                                    <td>Rp {report.totalSubTotal.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</td>
                                    <td>
                                        <button onClick={() => openModal(report)}>
                                            <Icon icon="mdi:eye" width={24} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                        Prev
                    </button>
                    <span>{currentPage}</span>
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(groupedReports.length / reportsPerPage)}>
                        Next
                    </button>
                </div>

                <Modal show={isModalOpen} onClose={closeModal}>
                    {selectedReport && (
                        <>
                            <div id="report-detail">
                                <h3>Detail Transaksi {selectedReport.IDTransaksi}</h3>
                                <p>Tanggal: {formatDate(selectedReport.TglTransaksi)}</p>
                                <p>Pelanggan: {selectedReport.Pelanggan}</p>
                                <p>Pegawai: {selectedReport.Pegawai}</p>
                                <table className={styles.modalTable}>
                                    <thead>
                                        <tr>
                                            <th>Menu</th>
                                            <th>Jumlah</th>
                                            <th>SubTotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedReport.items.map((item) => (
                                            <tr key={item.IDMenu}>
                                                <td>{item.NamaMenu}</td>
                                                <td>{item.JumlahPesan}</td>
                                                <td>Rp {item.SubTotal.toLocaleString('id-ID', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className={styles.modalFooter}>
                                    <button onClick={printPDF}>Cetak PDF</button>
                                </div>
                            </div>
                        </>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default Laporan;
