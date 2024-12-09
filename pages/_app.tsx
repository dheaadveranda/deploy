// src/pages/_app.tsx
import React from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../src/context/AuthContext'; // Mengimpor AuthProvider
import '../style/globals.css'; // Mengimpor style global

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    // Membungkus seluruh aplikasi dengan AuthProvider
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
};

export default MyApp;
