import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import {
  getToken,
  getUserFromStorage,
} from "../../services/api/authServiceClient";
import { useNavigate } from "react-router-dom"; // импортируем useNavigate
import styles from "./Responses.module.css";

const Responses = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const user = getUserFromStorage();
  const currentUserId = user?.id;
  const token = getToken();

  const getStatusText = (status) => {
    switch (status) {
      case "rejected":
        return "Отклонён";
      case "accepted":
        return "Одобрен";
      case "pending":
        return "В ожидании";
      default:
        return "Неизвестно";
    }
  };

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    setRole(user.role);
    loadBids(token, user.id);
  }, [token, user, navigate]);

  const loadBids = async (token, freelancerId) => {
    try {
      const response = await axios.get(`/api/bids/freelancer/${freelancerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        const bidsWithProjects = await Promise.all(
          response.data.map(async (bid) => {
            const projectResponse = await axios.get(
              `/api/projects/${bid.project_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...bid, project: projectResponse.data };
          })
        );
        setBids(bidsWithProjects);
      } else {
        setError("Не удалось получить отклики.");
      }
    } catch (err) {
      setError("Ошибка при загрузке откликов.");
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async (clientId) => {
    if (!currentUserId) {
      alert("Пожалуйста, войдите в систему");
      return;
    }

    try {
      const response = await fetch("/api/chats/find-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user1_id: currentUserId,
          user2_id: clientId,
        }),
      });

      if (!response.ok) throw new Error("Ошибка создания чата");

      const chat = await response.json();

      navigate(`/chat/${chat.id}`);
    } catch (error) {
      console.error("Ошибка при создании или переходе в чат:", error);
    }
  };

  return (
    <div>
      <Header role={role} />
      <main className={styles.main}>
        <h1>Мои отклики</h1>

        {loading && <p>Загрузка...</p>}

        {!loading && error && <p>{error}</p>}

        {!loading && !error && bids.length === 0 && (
          <div className={styles.noBids}>
            <p>Вы пока не отправляли отклики на проекты.</p>
            <p>Найдите интересный проект и отправьте отклик, чтобы начать!</p>
          </div>
        )}

        {!loading && !error && bids.length > 0 && (
          <div className={styles.bidList}>
            {bids.map((bid) => (
              <div key={bid.id} className={styles.bidItem}>
                <p>
                  <strong>Номер отклика:</strong> {bid.id}
                </p>
                <p>
                  <strong>Проект:</strong> {bid.project.title || "Не указано"}
                </p>
                <p>
                  <strong>Описание:</strong>{" "}
                  {bid.project.description || "Нет описания"}
                </p>
                <p>
                  <strong>Количество откликов:</strong> {bid.project.bids_count}
                </p>
                <p>
                  <strong>Статус отклика:</strong>{" "}
                  <span className={`${styles.status} ${styles[bid.status]}`}>
                    {getStatusText(bid.status)}
                  </span>
                </p>

                <div className={styles.actionsRow}>
                  <a
                    href={bid.project.media || "#"}
                    download={!!bid.project.media}
                    className={`${styles.fileButton} ${
                      !bid.project.media ? styles.disabledFileButton : ""
                    }`}
                  >
                    {bid.project.media
                      ? "Скачать файл"
                      : "Файл не был загружен"}
                  </a>

                  <button
                    className={styles.chatButton}
                    onClick={() => {
                      if (bid.status === "rejected") return; // запрещаем клик если rejected

                      const clientId = bid.project.client_id;
                      if (clientId) {
                        handleMessage(clientId);
                      } else {
                        alert("Информация о владельце проекта отсутствует");
                      }
                    }}
                    disabled={bid.status === "rejected"} // делаем кнопку недоступной
                    title={
                      bid.status === "rejected"
                        ? "Связаться невозможно: отклик отклонён"
                        : ""
                    }
                  >
                    Связаться в чате
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Responses;
