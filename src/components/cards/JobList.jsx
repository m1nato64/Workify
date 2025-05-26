// src/components/cards/JobList.jsx
import React, { useEffect, useState } from "react";
import Toast from "../common/Toast";
import styles from "./JobList.module.css";
import { Link } from "react-router-dom";
import { useSocket } from "../../services/context/socketContext";

const JobList = () => {
  const { socket } = useSocket();
  const [projects, setProjects] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Завершен";
      case "in_progress":
        return "В разработке";
      case "open":
        return "Открыт";
      default:
        return "Неизвестно";
    }
  };

  useEffect(() => {
    const fetchProjectsWithViews = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/projects");
        const data = await res.json();

        // Сортируем проекты по дате
        const sorted = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        // Получаем просмотры для каждого проекта
        const projectsWithViews = await Promise.all(
          sorted.map(async (project) => {
            try {
              const viewsRes = await fetch(
                `http://localhost:3000/api/projects/${project.id}/get-view`
              );
              if (!viewsRes.ok) throw new Error("Ошибка получения просмотров");
              const viewsData = await viewsRes.json();

              return { ...project, views: viewsData.views || 0 };
            } catch {
              // Если ошибка с просмотрами, ставим 0
              return { ...project, views: 0 };
            }
          })
        );

        setProjects(projectsWithViews);
      } catch {
        setToastType("error");
        setToastMessage("Ошибка загрузки проектов");
      }
    };

    fetchProjectsWithViews();
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/api/projects")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setProjects(sorted);
      })
      .catch(() => {
        setToastType("error");
        setToastMessage("Ошибка загрузки проектов");
      });
  }, []);

  const handleApply = async (projectId) => {
    if (!userId) {
      setToastType("error");
      setToastMessage("Пожалуйста, войдите в систему, чтобы откликнуться.");
      return;
    }
    try {
      // Проверка, не откликался ли пользователь уже
      const responseCheck = await fetch(
        `http://localhost:3000/api/bids/check?freelance_id=${userId}&project_id=${projectId}`
      );
      if (!responseCheck.ok) throw new Error("Ошибка при проверке отклика");
      const checkData = await responseCheck.json();

      if (checkData.exists) {
        setToastType("error");
        setToastMessage("Вы уже оставили отклик на этот проект.");
        return;
      }

      // Получение данных проекта
      const projectResponse = await fetch(
        `http://localhost:3000/api/projects/${projectId}`
      );
      if (!projectResponse.ok)
        throw new Error("Ошибка при получении данных проекта");
      const project = await projectResponse.json();

      if (!project.accepting_bids) {
        setToastType("error");
        setToastMessage("На данный проект не принимаются отклики.");
        return;
      }

      // Создание отклика
      const response = await fetch("http://localhost:3000/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ freelance_id: userId, project_id: projectId }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Ошибка при отправке отклика.");
      }

      setToastType("success");
      setToastMessage("Отклик успешно отправлен!");

      // Обновление счетчика откликов в локальном состоянии
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, bids_count: p.bids_count + 1 } : p
        )
      );

      // Отправка события в сокет о новом отклике
      if (socket) {
        socket.emit("create_bid", {
          freelance_id: userId,
          project_id: projectId,
        });
      }
    } catch (err) {
      setToastType("error");
      setToastMessage(
        err.message || "Ошибка сервера. Пожалуйста, попробуйте позже."
      );
    }
  };

  return (
    <div className={styles.jobPage}>
      <div className={styles.jobWrapper}>
        <h2 className={styles.jobTitle}>Последние добавленные проекты</h2>

        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage("")}
          />
        )}

        <div className={styles.jobList}>
          {projects.length === 0 ? (
            <div className={styles.noProjects}>
              <p>На данный момент проектов нету.</p>
            </div>
          ) : (
            projects.slice(0, 3).map((project) => (
              <div key={project.id} className={styles.jobCard}>
                <div className={styles.info}>
                  <h3 className={styles.jobCardTitle}>{project.title}</h3>
                  <p className={styles.jobDescription}>{project.description}</p>
                  <div className={styles.details}>
                    <span className={styles.status}>
                      {getStatusText(project.status)}
                    </span>
                    <span className={styles.date}>
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles.stats}>
                    {/* Иконка просмотров с числом */}
                    <div className={styles.statIcon} title="Просмотры">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 5c-7.633 0-11 6.686-11 7s3.367 7 11 7 11-6.686 11-7-3.367-7-11-7zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zm0-8c-1.656 0-3 1.344-3 3s1.344 3 3 3 3-1.344 3-3-1.344-3-3-3z" />
                      </svg>
                      <span>{project.views || 0}</span>
                    </div>

                    {/* Иконка откликов с числом */}
                    <div className={styles.statIcon} title="Отклики">
                      <svg viewBox="0 0 24 24">
                        <path d="M21 6h-18c-1.104 0-2 .896-2 2v10l4-4h16c1.104 0 2-.896 2-2v-4c0-1.104-.896-2-2-2zm0-2c2.206 0 4 1.794 4 4v4c0 2.206-1.794 4-4 4h-14l-6 6v-18c0-2.206 1.794-4 4-4h16z" />
                      </svg>
                      {project.bids_count || 0}
                    </div>
                  </div>

                  <button
                    className={styles.applyButton}
                    onClick={() => handleApply(project.id)}
                    disabled={!project.accepting_bids}
                  >
                    {project.accepting_bids
                      ? "Откликнуться"
                      : "Отклики не принимаются"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {projects.length > 0 && (
          <div className={styles.showAll}>
            <Link to="/jobs" className={styles.showAllButton}>
              Смотреть все проекты
              <span className={styles.arrow}>&rarr;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;
