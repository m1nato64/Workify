// src/components/Modals/EditProjectModal.jsx
import React from "react";
import styles from "./MyOrders.module.css";

const EditProjectModal = ({
  projectData,
  setProjectData,
  imagePreview,
  handleFileChange,
  handleProjectUpdate,
  closeEditModal,
}) => {
  return (
    <div className={styles.modal}>
      <div className={`${styles.modalContent} ${styles.modalEditContent}`}>
        <h2>Редактирование проекта</h2>
        <form onSubmit={handleProjectUpdate}>
          <input
            type="text"
            value={projectData.title}
            onChange={(e) =>
              setProjectData({ ...projectData, title: e.target.value })
            }
            placeholder="Название проекта"
            className={styles.input}
          />
          <textarea
            value={projectData.description}
            onChange={(e) =>
              setProjectData({ ...projectData, description: e.target.value })
            }
            placeholder="Описание проекта"
            className={styles.textarea}
          ></textarea>
          <select
            value={projectData.status}
            onChange={(e) =>
              setProjectData({ ...projectData, status: e.target.value })
            }
            className={styles.select}
          >
            <option value="open">Открыт</option>
            <option value="in_progress">В разработке</option>
            <option value="completed">Завершен</option>
          </select>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className={styles.input}
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className={styles.previewImage}
            />
          )}
          <div className={styles.modalActions}>
            <button type="submit" className={styles.button}>
              Обновить проект
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={closeEditModal}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
