import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer id="main-footer">
      <div className="footer-content">
        <p>&copy; 2025 Workify. Все права защищены.</p>
        <div className="footer-links">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Условия использования</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
