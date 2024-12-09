// pages/login.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext'; // Import AuthContext
import styles from '../style/login.module.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setAuthData } = useAuth(); // Mengambil fungsi setAuthData dari context
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
    
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
      console.log('Role yang diterima:', data.role);
  
      if (response.ok) {
        // Panggil setAuthData dengan objek { username, role }
        setAuthData({ username: data.username, role: data.role });
  
        // Simpan data ke sessionStorage
        sessionStorage.setItem('userRole', data.role);  // Menyimpan role pengguna ke sessionStorage
        sessionStorage.setItem('username', data.username);  // Menyimpan username pengguna ke sessionStorage
  
        // Mengarahkan ke halaman dashboard setelah login berhasil
        router.push('/dashboard');
      } else {
        alert(data.error || 'Login failed');
      }
  };  

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h1>Login</h1>
                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputWrapper}>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Username"
                            required 
                        />
                    </div>
                    <div className={styles.inputWrapper}>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Password"
                            required 
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
