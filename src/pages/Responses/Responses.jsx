import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSocket } from "../../services/context/socketContext";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import {
  getToken,
  getUserFromStorage,
} from "../../services/api/authServiceClient";
import { useNavigate } from "react-router-dom";
import ReviewModal from "../../components/cards/ReviewModal";
import Toast from "../../components/common/Toast";
import styles from "./Responses.module.css";
import { useUser } from "../../services/context/userContext";

const Responses = () => {
  const { socket } = useSocket();

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(() => getUserFromStorage());
  const [token, setToken] = useState(() => getToken());
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const { updateUser } = useUser();

  // --- Новые состояния для пагинации ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(bids.length / itemsPerPage);

  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    projectId: null,
    targetUserId: null,
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    content: "",
  });

  const navigate = useNavigate();
  const currentUserId = user?.id;

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    setRole(user.role);
    loadBids(token, currentUserId);

    if (!socket || !user) return;

    function onConnect() {
      socket.emit("register", user.id);
    }

    if (socket.connected) {
      onConnect();
    } else {
      socket.once("connect", onConnect);
    }

    function handleReceiveReview(data) {
      console.log("Новый отзыв получен через сокет:", data);
      loadBids(token, currentUserId);
    }

    socket.on("receive_review", handleReceiveReview);
    socket.on("review_created", handleReviewCreated);

    return () => {
      socket.off("receive_review", handleReceiveReview);
      socket.off("review_created", handleReviewCreated);
    };
  }, [token, user, navigate, socket, currentUserId, updateUser]);

  const handleReviewCreated = async (data) => {
    console.log("Отзыв создан:", data);
    setReviewModal({ isOpen: false, projectId: null, targetUserId: null });
    await loadBids(token, currentUserId);

    try {
      const userResponse = await axios.get(`/api/profile/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.data) {
        updateUser(userResponse.data);
      }
    } catch (error) {
      console.error("Ошибка при обновлении данных пользователя:", error);
    }
  };

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

  const getStatusInfo = (status) => {
    switch (status) {
      case "open":
        return { text: "открыт", className: styles.open };
      case "in_progress":
        return { text: "в разработке", className: styles.in_progress };
      case "completed":
        return { text: "завершен", className: styles.completed };
      default:
        return { text: status, className: "" };
    }
  };

  const loadBids = async (token, freelancerId) => {
    try {
      setLoading(true);
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

            const reviewCheck = await axios.get(
              `/api/reviews/project/${bid.project_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const hasReview = reviewCheck.data.some(
              (review) => review.author_id === freelancerId
            );

            return {
              ...bid,
              project: projectResponse.data,
              hasReview,
            };
          })
        );

        setBids(bidsWithProjects);
        setLoading(false);
        setCurrentPage(1); // сбрасываем на первую страницу после загрузки
      }
    } catch (err) {
      setError("Ошибка при загрузке откликов");
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

  const openReviewForm = (projectId, targetUserId) => {
    setReviewModal({ isOpen: true, projectId, targetUserId });
    setReviewData({ rating: 5, content: "" });
  };

  const submitReview = ({ rating, content }) => {
    if (!content.trim()) {
      setToast({ show: true, message: "Введите текст отзыва", type: "error" });
      return;
    }

    socket.emit("leave_review", {
      project_id: reviewModal.projectId,
      author_id: currentUserId,
      target_user_id: reviewModal.targetUserId,
      rating,
      content,
    });

    setToast({ show: true, message: "Отзыв отправлен", type: "success" });
  };

  // --- Вычисляем отображаемые отклики для текущей страницы ---
  const indexOfLastBid = currentPage * itemsPerPage;
  const indexOfFirstBid = indexOfLastBid - itemsPerPage;
  const currentBids = bids.slice(indexOfFirstBid, indexOfLastBid);

  // --- Обработчики переключения страниц ---
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
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
          <>
            <div className={styles.bidList}>
              {currentBids.map((bid) => {
                const projectStatusInfo = getStatusInfo(bid.project.status);
                return (
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
                      <strong>Статус отклика:</strong>{" "}
                      <span className={`${styles.status} ${styles[bid.status]}`}>
                        {getStatusText(bid.status)}
                      </span>
                    </p>
                    <p>
                      <strong>Статус проекта:</strong>{" "}
                      <span
                        className={`${styles.projectStatus} ${projectStatusInfo.className}`}
                      >
                        {projectStatusInfo.text}
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
                          if (bid.status === "rejected") return;
                          const clientId = bid.project.client_id;
                          if (clientId) {
                            handleMessage(clientId);
                          } else {
                            alert("Информация о владельце проекта отсутствует");
                          }
                        }}
                        disabled={bid.status === "rejected"}
                        title={
                          bid.status === "rejected"
                            ? "Связаться невозможно: отклик отклонён"
                            : ""
                        }
                      >
                        Связаться в чате
                      </button>

                      <button
                        className={styles.reviewButton}
                        disabled={
                          bid.project.status !== "completed" || bid.hasReview
                        }
                        title={
                          bid.project.status !== "completed"
                            ? "Отзыв можно оставить только после завершения проекта"
                            : bid.hasReview
                            ? "Вы уже оставили отзыв по этому клиенту"
                            : ""
                        }
                        onClick={() =>
                          openReviewForm(bid.project_id, bid.project.client_id)
                        }
                      >
                        Оставить отзыв клиенту
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                  Назад
                </button>
                <span>
                  Страница {currentPage} из {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />

      {/* Модальное окно для отзыва */}
      {reviewModal.isOpen && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() =>
            setReviewModal({
              isOpen: false,
              projectId: null,
              targetUserId: null,
            })
          }
          onSubmit={submitReview}
          projectTitle={
            bids.find((bid) => bid.project_id === reviewModal.projectId)
              ?.project?.title || ""
          }
        />
      )}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default Responses;
