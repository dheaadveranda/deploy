// pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page immediately
    router.push('/login');
  }, [router]);

  return null; // Return null or a loading indicator during redirection
};

export default Home;
