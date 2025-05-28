import React, { useEffect, useState } from "react";
import styles from "./OfferProjectModal.module.css";
import { useUser } from "../../services/context/userContext.jsx";

const OfferProjectModal = ({ freelancer, onClose, onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!user?.id) return;
        const res = await fetch(`/api/projects/user/${user.id}`);
        const data = await res.json();

        // Исключаем проекты со статусом "completed"
        const filteredProjects = data.filter(
          (project) => project.status !== "completed"
        );
        setProjects(filteredProjects);
      } catch (err) {
        console.error("Ошибка загрузки проектов:", err);
      }
    };

    fetchProjects();
  } , [user?.id]);

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
        <h2>Предложить проект {freelancer.name}</h2>

        {projects.length === 0 ? (
          <p>У вас пока нет проектов для предложения.</p>
        ) : (
          <ul className={styles.projectList}>
            {projects.map((project) => (
              <li key={project.id} className={styles.projectItem}>
                <span>{project.title}</span>
                <button
                  onClick={() => onSelectProject(project)}
                  className={styles.offerButton}
                >
                  Предложить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OfferProjectModal;
