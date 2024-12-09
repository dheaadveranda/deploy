// components/card.tsx
import React from 'react';
import styles from './card.module.css';

interface CardProps {
    title: string;
    value: string | number | React.ReactNode; // Mengubah tipe value untuk mendukung JSX
}

const Card: React.FC<CardProps> = ({ title, value }) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <div className={styles.cardValue}>{value}</div>
        </div>
    );
};

export default Card;
