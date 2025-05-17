import React, { useState } from "react";
import Toast from "../../components/common/Toast";
import styles from "./AddOrderCard.module.css";  

const AddOrderCard = ({ clientId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [media, setMedia] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleFileChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("status", status);
    formData.append("client_id", clientId);
    if (media) {
      formData.append("media", media);
    }

    try {
      const res = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Проект успешно создан!", "success");
        setTitle("");
        setDescription("");
        setStatus("open");
        setMedia(null);
      } else {
        showToast(`Ошибка: ${data.error}`, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Ошибка при отправке запроса", "error");
    }
  };

  return (
    <div className={styles.addOrderCard}>
      <h2 className={styles.title}>Добавить заказ</h2>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <input
          type="text"
          placeholder="Название проекта"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={styles.inputText}
        />
        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={styles.textarea}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <button type="submit" className={styles.submitButton}>
          Создать
        </button>
      </form>

      {toast.message && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default AddOrderCard;
