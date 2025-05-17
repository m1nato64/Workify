import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.mainFooter}>
      <div className={styles.footerContent}>
        <p>&copy; 2025 Workify. Все права защищены.</p>
        <div className={styles.footerLinks}>
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Условия использования</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
