// import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// import { useAuth } from './AuthContext'; // Mengimpor AuthContext untuk mengambil idPegawai

// interface UserContextType {
//   user: { nama: string; id: string } | null;
//   setUser: (user: { nama: string; id: string }) => void;
//   clearUser: () => void;
//   loading: boolean;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const { idPegawai } = useAuth(); // Mengambil idPegawai dari AuthContext
//   const [user, setUser] = useState<{ nama: string; id: string } | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     if (idPegawai) {
//       const fetchUserData = async () => {
//         setLoading(true);
//         try {
//           const response = await fetch(`/api/pegawai/getEmployee?id=${idPegawai}`);
//           if (!response.ok) {
//             throw new Error('Employee not found');
//           }
//           const data = await response.json();
//           setUser({ nama: data.NamaPegawai, id: data.IDPegawai });
  
//           // Cek apakah user berhasil diset
//           console.log('Data user yang berhasil diset:', data);
//         } catch (error) {
//           console.error('Error fetching user data:', error);
//         } finally {
//           setLoading(false);
//         }
//       };
  
//       fetchUserData();
//     }
//   }, [idPegawai]);
  

//   return (
//     <UserContext.Provider value={{ user, setUser, clearUser: () => setUser(null), loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };
