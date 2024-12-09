// utils/fetchHelpers.ts
export const fetchData = async (url: string, onSuccess: (data: any) => void, onError: (error: any) => void) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (Array.isArray(data)) {
            onSuccess(data);
        } else {
            console.error('Data fetched is not an array:', data);
            onSuccess([]); // Set ke array kosong jika data tidak valid
        }
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        onError(error);
    }
};

export const generateNewTransactionID = (setState: React.Dispatch<React.SetStateAction<any>>) => {
    fetch('/api/transaksi/getLatestTransactionID')
        .then(response => response.json())
        .then((data) => {
            const newID = data.latestID
                ? `TRX${(parseInt(data.latestID.replace('TRX', ''), 10) + 1).toString().padStart(4, '0')}`
                : 'TRX0001';
            setState((prev: any) => ({ ...prev, transactionID: newID }));
        })
        .catch(() => {
            setState((prev: any) => ({ ...prev, transactionID: 'TRX0001' }));
        });
};
