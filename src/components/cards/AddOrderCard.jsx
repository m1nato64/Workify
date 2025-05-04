import React, { useState } from "react";
import Toast from "../../components/common/Toast"; 
import "./AddOrderCard.css";

const AddOrderCard = ({ clientId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [media, setMedia] = useState(null); // Состояние для файла
  const [toast, setToast] = useState({ message: "", type: "success" }); // Стейт для Toast

  const handleFileChange = (e) => {
    setMedia(e.target.files[0]); // Сохраняем выбранный файл
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(); // Используем FormData для отправки данных и файлов
    formData.append("title", title);
    formData.append("description", description);
    formData.append("status", status);
    formData.append("client_id", clientId);
    if (media) {
      formData.append("media", media); // Добавляем файл в FormData
    }

    try {
      const res = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        body: formData, // Отправляем FormData с данными и файлом
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Проект успешно создан!", "success"); // Показываем успешный toast
        setTitle("");
        setDescription("");
        setStatus("open");
        setMedia(null); 
      } else {
        showToast(`Ошибка: ${data.error}`, "error"); 
      }
    } catch (err) {
      console.error(err);
      showToast("Ошибка при отправке запроса", "error"); // Показываем ошибочный toast
    }
  };

  return (
    <div className="add-order-card">
      <h2>Добавить заказ</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Название проекта"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange} 
        />
        <button type="submit">Создать</button>
      </form>

      {toast.message && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default AddOrderCard;
