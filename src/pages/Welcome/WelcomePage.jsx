import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import styles from "./WelcomePage.module.css";
import { useNavigate } from "react-router-dom";
import Tutorial from "../../components/common/Tutorial/Tutorial";
import logo from "../../assets/images/logo.png";

import {
  getShowTutorialSetting,
  updateShowTutorialSetting,
} from "../../services/api/tutorialService";

const WelcomePage = ({ user }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      getShowTutorialSetting(user.id)
        .then((show) => {
          setShowTutorial(show);
          if (show) setCurrentStep(0);
        })
        .catch((err) => {
          console.error("Ошибка при получении настройки обучения:", err);
          setShowTutorial(true);
          setCurrentStep(0);
        });
    }
  }, [user]);

  const handleToggleTutorial = async () => {
    try {
      const newShow = !showTutorial;
      setShowTutorial(newShow);
      if (newShow) {
        setCurrentStep(0);
      } else {
        setCurrentStep(null);
      }
      if (user?.id) {
        await updateShowTutorialSetting(user.id, newShow);
      }
    } catch (err) {
      console.error("Ошибка при обновлении настройки обучения:", err);
    }
  };

  const handleCloseTutorial = async () => {
    setShowTutorial(false);
    setCurrentStep(null);
    try {
      if (user?.id) {
        await updateShowTutorialSetting(user.id, false);
      }
    } catch (err) {
      console.error("Ошибка при обновлении настройки обучения:", err);
    }
  };

  return (
    <>
      <Header />

      <main className={styles.main}>
        {!showTutorial && user && (
          <>
            <div className={styles["logo-wrapper"]}>
              <img
                src={logo}
                alt="Workify Logo"
                className={`${styles.logo} ${styles["logo-inner"]}`}
              />
            </div>

            <h1 className={styles.title}>
              Добро пожаловать,{" "}
              <span className={styles.highlight}>{user.name}</span>!<br />
              Вы можете начать работу на нашей бирже или найти исполнителя
              вашего заказа.
            </h1>
            <div className={styles.buttonsWrapper}>
              <button
                id="addOrderBtn"
                className={styles.actionButton}
                onClick={() => navigate("/add-order")}
              >
                Добавить заказ
              </button>

              <button
                className={styles.tutorialButton}
                onClick={handleToggleTutorial}
              >
                {showTutorial ? "Выключить обучение" : "Запустить обучение"}
              </button>
            </div>
          </>
        )}

        {showTutorial && (
          <Tutorial
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onClose={handleCloseTutorial}
          />
        )}
      </main>

      <Footer />
    </>
  );
};

export default WelcomePage;
