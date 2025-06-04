import React, { useState, useEffect } from "react";
import { useUser } from "../../../services/context/userContext";
import Toast from "../Toast";
import styles from "./GeneralSettings.module.css";

const GeneralSettings = () => {
  const { user, updateUser } = useUser();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleNameChange = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/profile/${user.id}/update-name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        updateUser({ ...user, name });
        setSuccessMessage("Имя пользователя успешно обновлено");
        setError("");
      } else {
        const data = await response.json();
        setError(data.error || "Ошибка при обновлении имени");
        setSuccessMessage("");
      }
    } catch {
      setError("Произошла ошибка при обновлении имени");
      setSuccessMessage("");
    }
  };

  const handleAvatarChange = async (e) => {
    e.preventDefault();

    if (!avatar) {
      setError("Выберите файл для загрузки");
      setSuccessMessage("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(avatar.type)) {
      setError("Можно загружать только изображения (JPG, PNG, GIF, WEBP)");
      setSuccessMessage("");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", avatar);

    try {
  const response = await fetch(`/api/profile/${user.id}/update-avatar`, {
    method: "PUT",
    body: formData,
  });

  const contentType = response.headers.get("content-type");

  if (response.ok) {
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      updateUser({ ...user, avatar: data.avatar });
      setSuccessMessage("Аватар успешно обновлен!");
      setError("");
    } else {
      setError("Сервер вернул неожиданный ответ (не JSON)");
    }
  } else {
    let errorMessage = "Ошибка при обновлении аватара";
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      errorMessage = data.error || errorMessage;
    }
    setError(errorMessage);
    setSuccessMessage("");
  }
} catch (err) {
  console.error("Ошибка при отправке:", err);
  setError("Произошла ошибка при обновлении аватара");
  setSuccessMessage("");
}
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Настройки аккаунта</h2>

      {error && <Toast message={error} type="error" onClose={() => setError("")} />}
      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage("")}
        />
      )}

      <form className={styles.form} onSubmit={handleNameChange}>
        <label className={styles.label}>
          Имя:
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button type="submit" className={styles.button}>
          Изменить имя
        </button>
      </form>

      <form className={styles.form} onSubmit={handleAvatarChange}>
        <label className={styles.label}>
          Изменить аватар:
          <input
            type="file"
            className={styles.inputFile}
            onChange={(e) => {
              const file = e.target.files[0];
              const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
                "image/webp",
              ];
              if (file && !allowedTypes.includes(file.type)) {
                setError("Можно загружать только изображения (JPG, PNG, GIF, WEBP)");
                e.target.value = "";
                setAvatar(null);
              } else {
                setError("");
                setAvatar(file);
              }
            }}
          />
        </label>
        <button type="submit" className={styles.button}>
          Обновить аватар
        </button>
      </form>
    </div>
  );
};

export default GeneralSettings;
