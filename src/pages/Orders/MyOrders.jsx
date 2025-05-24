//src/pages/Orders/MyOrders.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../services/api/authServiceClient";
import { useUser } from "../../services/context/userContext";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import Toast from "../../components/common/Toast";
import BidModal from "../../pages/Orders/BidModal";
import EditProjectModal from "../../pages/Orders/EditProjectModal";
import DeleteConfirmationModal from "../../pages/Orders/DeleteConfirmationModal";
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
  const [toasts, setToasts] = useState([]);
  const { user, updateUser } = useUser();

  const projectsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

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

      // Обновляем selectedOrder, если он содержит этот bid
      if (selectedOrder) {
        const updatedBids = selectedOrder.bids.map((bid) =>
          bid.id === bidId ? { ...bid, status: data.updatedBid.status } : bid
        );
        setSelectedOrder({ ...selectedOrder, bids: updatedBids });
      }

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
    const id = Date.now(); // простой id по времени
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const openDeleteModal = (order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  // Вычисляем индекс начала и конца среза проектов для текущей страницы
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = orders.slice(indexOfFirstProject, indexOfLastProject);

  // Общее количество страниц
  const totalPages = Math.ceil(orders.length / projectsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const setPage = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <div>
      <Header role={user?.role} />
      <main className={styles.mainContent}>
        <h1 className={styles.ordersHeader}>Мои заказы</h1>

        {loading && <p>Загрузка...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className={styles.noProjects}>
            <p>Вы пока не создавали проекты.</p>
            <p>Создайте проект, чтобы фрилансеры смогли выполнить его!</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <>
            <div className={styles.orderList}>
              {currentProjects.map((order) => (
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
                    <img
                      src={order.media}
                      alt="Project"
                      className={styles.projectImage}
                    />
                  )}
                  <div className={styles.actionButtons}>
                    {order.status === "completed" ? (
                      <button
                        className={styles.button}
                        onClick={() => {
                          alert(
                            "Оставить отзыв — функциональность в разработке"
                          );
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
                        order.status === "completed"
                          ? styles.disabledButton
                          : ""
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

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Назад
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      className={`${styles.pageButton} ${
                        currentPage === page ? styles.activePage : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  className={styles.pageButton}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}

        {/* Модальные окна */}
        {isDeleteModalOpen && selectedOrder && (
          <DeleteConfirmationModal
            selectedOrder={selectedOrder}
            deleteProject={deleteProject}
            closeDeleteModal={closeDeleteModal}
          />
        )}

        {isModalOpen && selectedOrder && !editMode && (
          <BidModal
            selectedOrder={selectedOrder}
            updateBidStatus={updateBidStatus}
            closeModal={() => setIsModalOpen(false)}
          />
        )}

        {editMode && (
          <EditProjectModal
            projectData={projectData}
            setProjectData={setProjectData}
            imagePreview={imagePreview}
            handleFileChange={handleFileChange}
            handleProjectUpdate={handleProjectUpdate}
            closeEditModal={closeEditModal}
          />
        )}
      </main>
      <Footer />
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
