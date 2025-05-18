import React, { useState, useEffect } from "react";
import logo from "../../../assets/images/logo.png";
import styles from "../../pages/Welcome/WelcomePage.module.css";

const LogoWithDrop = () => {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.logoDropContainer}>
      <div className={styles.drop} />
      {showLogo && (
        <img
          src={logo}
          alt="Workify Logo"
          className={styles.logoAnimated}
        />
      )}
    </div>
  );
};

export default LogoWithDrop;
