import React, { useState } from "react";
import styles from "./ProjectModal.module.css";
import Toast from "../../components/common/Toast"; // путь подкорректируйте по структуре проекта

const getStatusInfo = (status) => {
  switch (status) {
    case "open":
      return { text: "Открыт", className: styles.open };
    case "in_progress":
      return { text: "В разработке", className: styles.in_progress };
    case "completed":
      return { text: "Завершен", className: styles.completed };
    default:
      return { text: status, className: "" };
  }
};

const ProjectModal = ({ project, onClose, onApply }) => {
  if (!project) return null;

  const { text: statusText, className: statusClass } = getStatusInfo(
    project.status
  );

  const createdDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString("ru-RU")
    : "Дата не указана";

  const handleClickOutside = (e) => {
    if (e.target.classList.contains(styles.modalOverlay)) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <h2>{project.title}</h2>
        <p>
          <strong>ID:</strong> {project.id}
        </p>
        <p>
          <strong>Описание:</strong> {project.description}
        </p>
        <p>
          <strong>Статус:</strong>{" "}
          <span className={statusClass}>{statusText}</span>
        </p>
        <p>
          <strong>Дата создания:</strong> {createdDate}
        </p>

        <button
          className={styles.respondButton}
          onClick={() => onApply(project.id)}
        >
          Откликнуться
        </button>
      </div>
    </div>
  );
};

export default ProjectModal;
