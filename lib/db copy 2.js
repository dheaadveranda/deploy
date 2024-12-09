import { Pool } from 'pg';

const pool = new Pool({
    host: 'ep-square-violet-a43yicpp-pooler.us-east-1.aws.neon.tech', // Host database Anda
    user: 'default',       // Username Anda
    password: 'i0UYx7XLtDTg', // Password Anda
    database: 'verceldb',  // Nama database Anda
    port: 5432,            // Port PostgreSQL default
    ssl: { rejectUnauthorized: false }, // Untuk Neon.tech yang memerlukan SSL
});

export default pool;
