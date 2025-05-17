//src/pages/Orders/MyOrders.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../services/api/authServiceClient";
import { useUser } from "../../services/context/userContext";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import Toast from "../../components/common/Toast";
import styles from "./MyOrders.module.css";

const statusLabels = {
  open: "открыт",
  in_progress: "в разработке",
  completed: "завершен",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    status: "",
    media: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const { user, updateUser } = useUser();

  useEffect(() => {
    const token = getToken();
    if (!token || !user) {
      window.location.href = "/login";
      return;
    }

    loadOrders(token, user.id);
  }, [user]);

  const loadOrders = async (token, userId) => {
    try {
      const { data } = await axios.get(`/api/projects/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sorted);
    } catch (err) {
      setError("Ошибка при загрузке заказов!");
      showToast("Ошибка при загрузке заказов!", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateBidStatus = async (bidId, status) => {
    const token = getToken();
    try {
      const { data } = await axios.put(
        `/api/bids/status/${bidId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedOrders = orders.map((order) =>
        order.bids
          ? {
              ...order,
              bids: order.bids.map((bid) =>
                bid.id === bidId
                  ? { ...bid, status: data.updatedBid.status }
                  : bid
              ),
            }
          : order
      );

      setOrders(updatedOrders);
      updateUser(user);
      showToast(data.message, "success");
    } catch (err) {
      showToast("Ошибка при обновлении статуса отклика!", "error");
      console.error(err);
    }
  };

  const toggleBids = async (projectId, accepting) => {
    const token = getToken();
    try {
      await axios.put(
        `/api/projects/bids-toggle/${projectId}`,
        { accepting },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      loadOrders(token, user.id);
    } catch (err) {
      showToast("Ошибка при обновлении статуса приема откликов", "error");
      console.error(err);
    }
  };

  const deleteProject = async (projectId) => {
    const token = getToken();
    try {
      await axios.delete(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadOrders(token, user.id);
      showToast("Проект успешно удален!", "success");
      closeDeleteModal();
    } catch (err) {
      showToast("Ошибка при удалении проекта!", "error");
      console.error(err);
    }
  };

  const openEditModal = (order) => {
    setProjectData({
      title: order.title,
      description: order.description,
      status: order.status,
      media: order.media,
    });
    setImagePreview(order.media);
    setSelectedOrder(order);
    setEditMode(true);
  };

  const handleProjectUpdate = async (e) => {
    e.preventDefault();
    const token = getToken();
    const formData = new FormData();

    formData.append("title", projectData.title);
    formData.append("description", projectData.description);
    formData.append("status", projectData.status);
    if (projectData.media) formData.append("media", projectData.media);

    try {
      const { data } = await axios.put(
        `/api/projects/update-project/${selectedOrder.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id
          ? { ...order, ...projectData, media: data.updatedProject.media }
          : order
      );

      setOrders(updatedOrders);
      showToast("Проект обновлен!", "success");
      closeEditModal();
    } catch (err) {
      showToast("Ошибка при обновлении проекта", "error");
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProjectData((prev) => ({ ...prev, media: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const closeModal = () => setIsModalOpen(false);
  const closeEditModal = () => {
    setEditMode(false);
    setImagePreview(null);
  };

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const openDeleteModal = (order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  return (
    <div>
      <Header role={user?.role} />
      <main>
        <h1>Мои заказы</h1>

        {loading && <p>Загрузка...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className={styles.noProjects}>
            <p>Вы пока не создавали проекты.</p>
            <p>Создайте проект, чтобы фрилансеры смогли выполнить его!</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className={styles.orderList}>
            {orders.map((order) => (
              <div className={styles.orderItem} key={order.id}>
                <p>Название проекта: {order.title}</p>
                <p>Описание: {order.description}</p>
                <p>
                  Статус проекта:{" "}
                  <span
                    className={`${styles.statusProject} ${
                      styles[order.status]
                    }`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </p>
                <p>
                  Статус откликов:{" "}
                  <span
                    className={`${styles.status} ${
                      order.accepting_bids
                        ? styles.accepting
                        : styles.notAccepting
                    }`}
                  >
                    {order.accepting_bids ? "принимаются" : "не принимаются"}
                  </span>
                </p>
                {order.media && (
                  <img src={order.media} alt="Project" width="100" />
                )}
                <div className={styles.actionButtons}>
                  {order.status === "completed" ? (
                    <button
                      className={styles.button}
                      onClick={() => {
                        // Здесь должна быть логика открытия модалки/страницы с отзывом
                        alert("Оставить отзыв — функциональность в разработке");
                      }}
                    >
                      Оставить комментарий и отзыв фрилансеру
                    </button>
                  ) : (
                    <button
                      className={styles.button}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                    >
                      Посмотреть отклики
                    </button>
                  )}

                  <button
                    className={styles.button}
                    onClick={() => openEditModal(order)}
                  >
                    Редактировать
                  </button>

                  <button
                    className={styles.button}
                    onClick={() => openDeleteModal(order)}
                  >
                    Удалить
                  </button>

                  <button
                    className={`${styles.button} ${
                      order.status === "completed" ? styles.disabledButton : ""
                    }`}
                    onClick={() =>
                      order.status !== "completed" &&
                      toggleBids(order.id, !order.accepting_bids)
                    }
                    disabled={order.status === "completed"}
                  >
                    {order.accepting_bids
                      ? "Закрыть отклики"
                      : "Открыть отклики"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно подтверждения удаления */}
        {isDeleteModalOpen && selectedOrder && (
          <div className={styles.modal}>
            <div
              className={`${styles.modalContent} ${styles.modalConfirmationContent}`}
            >
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
        )}

        {/* Модальное окно откликов */}
        {isModalOpen && selectedOrder && !editMode && (
          <div className={styles.modal}>
            <div className={`${styles.modalContent} ${styles.modalBidContent}`}>
              <h2>Отклики на проект</h2>
              <div className={styles.bidList}>
                {selectedOrder.bids?.length > 0 ? (
                  selectedOrder.bids.map((bid) => (
                    <div key={bid.id} className={styles.bidItem}>
                      <p>
                        Фрилансер: {bid.freelancer_name || "Имя не указано"}
                      </p>
                      <p>
                        Статус:{" "}
                        <span
                          className={`${styles.status} ${
                            bid.status === "accepted"
                              ? styles.accepting
                              : styles.notAccepting
                          }`}
                        >
                          {bid.status}
                        </span>
                      </p>
                      <div className={styles.actionButtonsBids}>
                        <button
                          className={styles.acceptedButton}
                          onClick={() => updateBidStatus(bid.id, "accepted")}
                        >
                          Принять
                        </button>
                        <button
                          className={styles.rejectedButton}
                          onClick={() => updateBidStatus(bid.id, "rejected")}
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Нет откликов на этот проект.</p>
                )}
              </div>
              <button className={styles.button} onClick={closeModal}>
                Закрыть
              </button>
            </div>
          </div>
        )}

        {/* Модальное окно редактирования */}
        {editMode && (
          <div className={styles.modal}>
            <div
              className={`${styles.modalContent} ${styles.modalEditContent}`}
            >
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
                    setProjectData({
                      ...projectData,
                      description: e.target.value,
                    })
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
                {imagePreview && <img src={imagePreview} alt="Preview" />}
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
        )}
      </main>
      <Footer />
      {toast.message && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default MyOrders;
