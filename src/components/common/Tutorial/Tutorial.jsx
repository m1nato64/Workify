import React, { useState, useEffect, useRef } from "react";
import styles from "./Tutorial.module.css";

const tutorialSteps = [
  {
    id: 1,
    title: "Навигация на главную",
    content: (
      <>
        Чтобы перейти на главную страницу, нажмите на логотип <b>Workify</b> в
        левом верхнем углу или на название сайта рядом с ним.
      </>
    ),
    highlightId: "logoLink",
  },
  {
    id: 2,
    title: "Пункты меню в шапке",
    content: (
      <>
        В шапке вы увидите основные разделы:
        <ul>
          <li>
            <b>Мои заказы</b> — управление вашими заказами.
          </li>
          <li>
            <b>Чаты</b> — переписка с исполнителями или заказчиками.
          </li>
          <li>
            <b>Фрилансеры</b> — список исполнителей.
          </li>
        </ul>
      </>
    ),
    highlightId: "headerNav",
  },
  {
    id: 3,
    title: "Уведомления и профиль",
    content: (
      <>
        В правом верхнем углу находятся две иконки:
        <ul>
          <li>Иконка колокольчика — здесь отображаются ваши уведомления.</li>
          <li>
            Иконка пользователя — меню профиля, где можно выйти из аккаунта или
            изменить настройки.
          </li>
        </ul>
      </>
    ),
    highlightId: "notificationsAndProfile",
  },
  {
    id: 4,
    title: 'Кнопка "Добавить заказ"',
    content: (
      <>
        Чтобы создать новый заказ, используйте кнопку <b>"Добавить заказ"</b>,
        которая находится под этим текстом. Это поможет быстро разместить ваш
        запрос и начать поиск исполнителя.
      </>
    ),
    highlightId: "addOrderBtn",
  },
];

const Tutorial = ({ currentStep, setCurrentStep, onClose }) => {
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [highlightRect, setHighlightRect] = useState(null);
  const tutorialBoxRef = useRef(null);

  useEffect(() => {
    if (currentStep === null || currentStep >= tutorialSteps.length) {
      setHighlightRect(null);
      return;
    }

    const currentHighlightId = tutorialSteps[currentStep].highlightId;

    if (currentStep === tutorialSteps.length - 1) {
      // Последний шаг - подсветка отсутствует, подсказка по центру
      setHighlightRect(null);
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1200,
        maxWidth: "320px",
      });
      return;
    }

    if (currentHighlightId) {
      const el = document.getElementById(currentHighlightId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const rect = el.getBoundingClientRect();

        const padding = 6;
        let offsetTop = 0;
        let offsetLeft = 0;
        if (currentStep === 1) {
          offsetTop = -4;
          offsetLeft = -6;
        }

        setHighlightRect({
          top: rect.top + window.scrollY + offsetTop - padding,
          left: rect.left + window.scrollX + offsetLeft - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });

        const box = tutorialBoxRef.current?.getBoundingClientRect();

        if (box) {
          let top = rect.top + window.scrollY + offsetTop;
          let left = rect.right + window.scrollX + 15 + offsetLeft;

          if (left + box.width > window.innerWidth + window.scrollX) {
            left = rect.left + window.scrollX - box.width - 15 + offsetLeft;
          }

          if (top + box.height > window.innerHeight + window.scrollY) {
            top = window.innerHeight + window.scrollY - box.height - 15;
          }

          setTooltipStyle({
            position: "absolute",
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 1200,
            maxWidth: "320px",
          });
        } else {
          setTooltipStyle({
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1200,
            maxWidth: "320px",
          });
        }
      } else {
        setHighlightRect(null);
      }
    } else {
      setHighlightRect(null);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (currentStep === null || currentStep >= tutorialSteps.length) return null;

  return (
    <>
      <div className={styles.tutorialOverlay} style={{ zIndex: 1190 }} />

      {highlightRect && currentStep !== tutorialSteps.length - 1 && (
        <div
          className={styles.highlightElement}
          style={{
            position: "fixed",
            top: highlightRect.top - window.scrollY,
            left: highlightRect.left - window.scrollX,
            width: highlightRect.width,
            height: highlightRect.height,
            zIndex: 1195,
            pointerEvents: "none",
            border: "3px solid rgb(251, 251, 252)",
            borderRadius: "8px",
            boxShadow: "0 0 10px 4px rgba(247, 247, 247, 0.7)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s ease",
          }}
        />
      )}

      <div
        className={styles.tutorialBox}
        style={tooltipStyle}
        ref={tutorialBoxRef}
      >
        <h2>{tutorialSteps[currentStep].title}</h2>
        <div className={styles.tutorialContent}>
          {tutorialSteps[currentStep].content}
        </div>

        <div className={styles.tutorialControls}>
          <button className={styles.skipBtn} onClick={handleSkip}>
            Пропустить
          </button>

          {currentStep > 0 && (
            <button className={styles.backBtn} onClick={handleBack}>
              Назад
            </button>
          )}

          {currentStep < tutorialSteps.length - 1 ? (
            <button className={styles.nextBtn} onClick={handleNext}>
              Далее
            </button>
          ) : (
            <button className={styles.finishBtn} onClick={handleSkip}>
              Завершить
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Tutorial;
