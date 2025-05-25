import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import ProjectModal from "./ProjectModal";
import Toast from "../../components/common/Toast";
import styles from "./SearchProjects.module.css";
import { FaTh, FaBars, FaSearch } from "react-icons/fa";
import { useSocket } from "../../services/context/socketContext";

const SearchProjects = () => {
  const { socket } = useSocket();

  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");
  const [sortByBids, setSortByBids] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);

  const projectsPerPage = viewMode === "card" ? 6 : 3;

  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Для уведомлений
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState();

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("title", searchTerm);
        if (status) params.append("status", status);
        if (sortByBids) params.append("sortByBids", sortByBids);

        const response = await fetch(
          `/api/projects/search?${params.toString()}`
        );
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        setToastType("error");
        setToastMessage("Ошибка при получении проектов");
        console.error("Ошибка при получении проектов:", error);
      }
    };

    fetchProjects();
  }, [searchTerm, status, sortByBids]);

  useEffect(() => {
    setCurrentPage(1); // сброс страницы при смене вида
  }, [viewMode]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text.trim();

    const trimmed = text.trim().slice(0, maxLength);
    const lastSpace = trimmed.lastIndexOf(" ");
    return trimmed.slice(0, lastSpace > 0 ? lastSpace : maxLength) + "…";
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "open":
        return { text: "Открыт", className: styles.open };
      case "in_progress":
        return { text: "В разработке", className: styles.in_progress };
      case "completed":
        return { text: "Завершен", className: styles.completed };
      default:
        return { text: status, className: "" };
    }
  };

  const getAcceptingBidsInfo = (accepting_bids) => {
    if (accepting_bids === true) {
      return { text: "Принимаются", className: styles.accepting };
    } else if (accepting_bids === false) {
      return { text: "Не принимаются", className: styles.notAccepting };
    } else {
      return {
        text: "Статус откликов неизвестен",
        className: styles.unknownStatus,
      };
    }
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const setPage = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const openModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const handleApply = async (projectId) => {
    if (!userId) {
      setToastType("error");
      setToastMessage("Пожалуйста, войдите в систему, чтобы откликнуться.");
      return;
    }
    try {
      // Проверка, не откликался ли пользователь уже
      const responseCheck = await fetch(
        `/api/bids/check?freelance_id=${userId}&project_id=${projectId}`
      );
      if (!responseCheck.ok) throw new Error("Ошибка при проверке отклика");
      const checkData = await responseCheck.json();

      if (checkData.exists) {
        setToastType("error");
        setToastMessage("Вы уже оставили отклик на этот проект.");
        return;
      }

      // Получение данных проекта
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok)
        throw new Error("Ошибка при получении данных проекта");
      const project = await projectResponse.json();

      if (!project.accepting_bids) {
        setToastType("error");
        setToastMessage("На данный проект не принимаются отклики.");
        return;
      }

      // Создание отклика
      const response = await fetch("/api/bids", {
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
          p.id === projectId ? { ...p, bids_count: (p.bids_count ?? 0) + 1 } : p
        )
      );

      // Отправка события в сокет о новом отклике
      if (socket) {
        socket.emit("create_bid", {
          freelance_id: userId,
          project_id: projectId,
        });
      }

      closeModal();
    } catch (err) {
      setToastType("error");
      setToastMessage(
        err.message || "Ошибка сервера. Пожалуйста, попробуйте позже."
      );
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1>Поиск проектов</h1>

        <div className={styles.controls}>
          <div className={styles.searchWithView}>
            <div className={styles.searchInputWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Введите название проекта..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.viewToggle}>
              <button
                onClick={() => setViewMode("card")}
                className={viewMode === "card" ? styles.active : ""}
                aria-label="Показать карточками"
              >
                <FaTh />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? styles.active : ""}
                aria-label="Показать списком"
              >
                <FaBars />
              </button>
            </div>
          </div>

          <div className={styles.filters}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={styles.select}
            >
              <option value="">Все статусы</option>
              <option value="open">Открыт</option>
              <option value="in_progress">В разработке</option>
              <option value="completed">Завершён</option>
            </select>

            <select
              value={sortByBids}
              onChange={(e) => setSortByBids(e.target.value)}
              className={styles.select}
            >
              <option value="">Сортировка по умолчанию</option>
              <option value="asc">Меньше откликов</option>
              <option value="desc">Больше откликов</option>
            </select>
          </div>
        </div>

        <div
          className={
            viewMode === "card" ? styles.projectsGrid : styles.projectsList
          }
        >
          {currentProjects.length > 0 ? (
            currentProjects.map((project) => {
              const createdDate = project.created_at
                ? new Date(project.created_at).toLocaleDateString("ru-RU")
                : "Дата не указана";

              const { text: statusText, className: statusClass } =
                getStatusInfo(project.status);
              const { text: acceptingBidsText, className: acceptingBidsClass } =
                getAcceptingBidsInfo(project.accepting_bids);

              return (
                <div
                  className={
                    viewMode === "card"
                      ? styles.projectCard
                      : styles.projectListItem
                  }
                  key={project.id}
                  onClick={() => openModal(project)}
                  style={{ cursor: "pointer" }}
                >
                  <h2>
                    {truncateText(project.title, 50)} (ID: {project.id})
                  </h2>
                  <p className={styles.projectDescription}>
                    {truncateText(project.description, 40)}
                  </p>

                  {viewMode === "card" ? (
                    <div className={styles.details}>
                      <p className={styles.createdDate}>
                        Дата создания: {createdDate}
                      </p>
                      <p className={statusClass}>Статус: {statusText}</p>
                      <p>
                        Статус откликов:{" "}
                        <span className={acceptingBidsClass}>
                          {acceptingBidsText}
                        </span>
                      </p>
                      <p className={styles.bidsCount}>
                        <span className={styles.statIcon}>
                          {/* иконка */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            aria-hidden="true"
                            focusable="false"
                            className={styles.bidsIcon}
                          >
                            <path d="M21 6h-18c-1.104 0-2 .896-2 2v10l4-4h16c1.104 0 2-.896 2-2v-4c0-1.104-.896-2-2-2zm0-2c2.206 0 4 1.794 4 4v4c0 2.206-1.794 4-4 4h-14l-6 6v-18c0-2.206 1.794-4 4-4h16z"></path>
                          </svg>
                          {project.bids_count ?? 0}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className={styles.listDetails}>
                      <div className={styles.listDetailsTop}>
                        <div className={styles.statusWrapper}>
                          <span>Статус проекта: </span>
                          <span className={statusClass}>{statusText}</span>
                        </div>
                      </div>

                      <span>
                        Статус откликов:{" "}
                        <span className={acceptingBidsClass}>
                          {acceptingBidsText}
                        </span>
                      </span>

                      <p className={styles.createdDate}>
                        Создан: {createdDate}{" "}
                        <span className={styles.bidsCountInline}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            aria-hidden="true"
                            focusable="false"
                            className={styles.bidsIcon}
                          >
                            <path d="M21 6h-18c-1.104 0-2 .896-2 2v10l4-4h16c1.104 0 2-.896 2-2v-4c0-1.104-.896-2-2-2zm0-2c2.206 0 4 1.794 4 4v4c0 2.206-1.794 4-4 4h-14l-6 6v-18c0-2.206 1.794-4 4-4h16z"></path>
                          </svg>
                          {project.bids_count ?? 0}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>Проекты не найдены.</p>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={goToPrevPage} disabled={currentPage === 1}>
              Назад
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx + 1)}
                className={currentPage === idx + 1 ? styles.activePage : ""}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Вперед
            </button>
          </div>
        )}

        {selectedProject && (
          <ProjectModal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onApply={() => handleApply(selectedProject.id)}
          />
        )}

        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage("")}
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchProjects;
