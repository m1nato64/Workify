import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import {
  getToken,
  getUserFromStorage,
} from "../../services/api/authServiceClient";
import styles from "./Responses.module.css";

const Responses = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);

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
    const token = getToken();
    const user = getUserFromStorage();

    if (!token || !user) {
      history.push("/login");
      return;
    }

    setRole(user.role);
    loadBids(token, user.id);
  }, []);

  const loadBids = async (token, freelancerId) => {
    try {
      const response = await axios.get(`/api/bids/freelancer/${freelancerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        const bidsWithProjects = await Promise.all(
          response.data.map(async (bid) => {
            const projectResponse = await axios.get(
              `/api/projects/${bid.project_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            return { ...bid, project: projectResponse.data };
          })
        );
        setBids(bidsWithProjects);
      } else {
        console.error("Ошибка структуры ответа:", response.data);
        setError("Не удалось получить отклики.");
      }
    } catch (err) {
      console.error("Ошибка при запросе откликов:", err);
      setError("Ошибка при загрузке откликов.");
    } finally {
      setLoading(false);
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
                {bid.project.media && (
                  <div className={styles.projectFile}>
                    <a
                      href={bid.project.media}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Скачать файл
                    </a>
                  </div>
                )}
                <p>
                  <strong>Статус отклика:</strong>{" "}
                  <span className={`${styles.status} ${styles[bid.status]}`}>
                    {getStatusText(bid.status)}
                  </span>
                </p>
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
