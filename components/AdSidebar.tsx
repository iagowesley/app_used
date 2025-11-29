import React from 'react';
import styles from './AdSidebar.module.css';

interface AdSidebarProps {
    side: 'left' | 'right';
}

const AdSidebar: React.FC<AdSidebarProps> = ({ side }) => {
    return (
        <div className={`${styles.sidebar} ${styles[side]}`}>
            <div className={styles.adContent}>
                <p className={styles.adText}>
                    ANUNCIE AQUI SEU SERVIÇO, SUA LOJA OU PRODUTO!
                </p>
            </div>
        </div>
    );
};

export default AdSidebar;
