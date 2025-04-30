import React from 'react';
import styles from './Hero.module.css';

interface HeroProps {
    backgroundImage: string;
    title?: string;
    subtitle?: string;
}

export const Hero: React.FC<HeroProps> = ({ backgroundImage, title, subtitle }) => {
    return (
        <div
            className={styles.hero}
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
        </div>
    );
};