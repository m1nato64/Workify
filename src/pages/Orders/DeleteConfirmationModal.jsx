// src/components/Modals/DeleteConfirmationModal.jsx
import React from "react";
import styles from "./MyOrders.module.css";

const DeleteConfirmationModal = ({ selectedOrder, deleteProject, closeDeleteModal }) => {
  return (
    <div className={styles.modal}>
      <div className={`${styles.modalContent} ${styles.modalConfirmationContent}`}>
        <h2>Подтверждение удаления</h2>
        <p>Вы уверены, что хотите удалить этот проект?</p>
        <div className={styles.modalActions}>
          <button
            className={styles.confirmBtn}
            onClick={() => deleteProject(selectedOrder.id)}
          >
            Да, удалить
          </button>
          <button className={styles.cancelBtn} onClick={closeDeleteModal}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
