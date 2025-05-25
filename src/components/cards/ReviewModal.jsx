// components/cards/ReviewModal.jsx
import React, { useState } from "react";
import styles from "./ReviewModal.module.css";

const ReviewModal = ({ isOpen, onClose, onSubmit, projectTitle }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Проверка валидности рейтинга
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      setError("Оценка должна быть числом от 1.00 до 5.00");
      return;
    }

    setError("");
    onSubmit({ rating: parsedRating, content });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Оставить отзыв</h2>
        <p>Проект: {projectTitle}</p>
        <form onSubmit={handleSubmit}>
          <label>
            Оценка (1.00–5.00):
            <input
              type="number"
              min="1"
              max="5"
              step="0.01"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <label>
            Комментарий:
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </label>
          <div className={styles.buttons}>
            <button type="submit">Отправить</button>
            <button type="button" onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;