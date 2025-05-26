// components/modals/OfferProjectModal.jsx
import React, { useEffect, useState } from "react";
import styles from "./OfferProjectModal.module.css";
import { useUser } from "../../services/context/userContext.jsx";  // импорт контекста

const OfferProjectModal = ({ freelancer, onClose, onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const { user } = useUser();  // получаем текущего пользователя из контекста

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!user?.id) return; // если пользователя нет — не делать запрос
        const res = await fetch(`/api/projects/user/${user.id}`);
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Ошибка загрузки проектов:", err);
      }
    };

    fetchProjects();
  }, [user?.id]);

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
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

        <button onClick={onClose} className={styles.closeButton}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default OfferProjectModal;
