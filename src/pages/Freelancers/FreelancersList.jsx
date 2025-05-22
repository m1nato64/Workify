import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import styles from "./FreelancersList.module.css";
import {
  FaStar,
  FaTh,
  FaBars,
  FaUserCircle,
  FaEnvelope,
  FaHandshake,
} from "react-icons/fa";
import { getUserFromStorage } from "../../services/api/authServiceClient";
import { useNavigate } from "react-router-dom";

const FreelancersList = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [view, setView] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const currentUserId = user?.id;

  // Количество элементов на странице зависит от текущего вида
  const freelancersPerPage = view === "card" ? 6 : 4;

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await fetch("/api/profile/freelancers");
        const data = await response.json();
        setFreelancers(data);
      } catch (error) {
        console.error("Ошибка при получении фрилансеров:", error);
      }
    };

    fetchFreelancers();
  }, []);

  // Сбрасываем страницу при смене режима отображения
  useEffect(() => {
    setCurrentPage(1);
  }, [view]);

  const handleMessage = async (freelancerId) => {
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
          user2_id: freelancerId,
        }),
      });

      if (!response.ok) throw new Error("Ошибка создания чата");

      const chat = await response.json();

      navigate(`/chat/${chat.id}`);
    } catch (error) {
      console.error("Ошибка при создании или переходе в чат:", error);
    }
  };

  const handleOffer = (freelancerId) => {
    console.log("Предложить заказ фрилансеру с ID:", freelancerId);
  };

  // Вычисляем индексы для текущей страницы
  const indexOfLastFreelancer = currentPage * freelancersPerPage;
  const indexOfFirstFreelancer = indexOfLastFreelancer - freelancersPerPage;
  const currentFreelancers = freelancers.slice(
    indexOfFirstFreelancer,
    indexOfLastFreelancer
  );

  // Общее число страниц
  const totalPages = Math.ceil(freelancers.length / freelancersPerPage);

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
    <>
      <Header />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Список фрилансеров</h1>
          <div className={styles.viewToggle}>
            <button
              onClick={() => setView("card")}
              className={view === "card" ? styles.active : ""}
              title="Карточки"
            >
              <FaTh />
            </button>
            <button
              onClick={() => setView("list")}
              className={view === "list" ? styles.active : ""}
              title="Список"
            >
              <FaBars />
            </button>
          </div>
        </div>

        <div className={view === "card" ? styles.cardGrid : styles.listView}>
          {currentFreelancers.map((freelancer) => (
            <div
              key={freelancer.id}
              className={view === "card" ? styles.card : styles.listItem}
            >
              {freelancer.avatar?.trim() ? (
                <img
                  src={freelancer.avatar}
                  alt={freelancer.name}
                  className={styles.avatar}
                />
              ) : (
                <FaUserCircle className={styles.avatarIcon} />
              )}

              <div className={styles.info}>
                <h2>{freelancer.name}</h2>
                <p className={styles.skills}>
                  {freelancer.skills || "Навыки не указаны"}
                </p>

                <div className={styles.ratingActions}>
                  <p className={styles.rating}>
                    <FaStar className={styles.star} />
                    {freelancer.rating && !isNaN(freelancer.rating)
                      ? Number(freelancer.rating).toFixed(1)
                      : "Нет рейтинга"}
                  </p>

                  <div className={styles.actions}>
                    <button
                      className={styles.iconButton}
                      onClick={() => handleMessage(freelancer.id)}
                      title="Написать сообщение"
                    >
                      <FaEnvelope />
                    </button>
                    <button
                      className={styles.iconButton}
                      onClick={() => handleOffer(freelancer.id)}
                      title="Предложить заказ"
                    >
                      <FaHandshake />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Пагинация */}
        {freelancers.length > freelancersPerPage && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={goToPrevPage}
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
                  onClick={() => setPage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              className={styles.pageButton}
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Вперед
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default FreelancersList;
