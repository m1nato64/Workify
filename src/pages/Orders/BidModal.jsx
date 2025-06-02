import React, { useEffect, useState } from "react";
import styles from "./MyOrders.module.css";
import { useSocket } from "../../services/context/socketContext";
import Toast from "../../components/common/Toast";

const BidModal = ({ selectedOrder, closeModal }) => {
  const { socket } = useSocket();
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [bids, setBids] = useState(selectedOrder.bids || []);

  const updateBidStatus = (bid_id, status) => {
    if (!socket) {
      setToastType("error");
      setToastMessage("Сокет не подключен");
      return;
    }
    socket.emit("update_bid_status", { bid_id, status });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("bid_status_updated", ({ bid_id, status }) => {
      setToastType("success");

      setBids((prevBids) =>
        prevBids.map((bid) => (bid.id === bid_id ? { ...bid, status } : bid))
      );
    });

    socket.on("error", (error) => {
      setToastType("error");
      setToastMessage(error.message || "Ошибка на сервере");
    });

    return () => {
      socket.off("bid_status_updated");
      socket.off("error");
    };
  }, [socket]);

  return (
    <div className={styles.modal}>
      <div className={`${styles.modalContent} ${styles.modalBidContent}`}>
        <h2>Отклики на проект {bids.length > 0 && `(${bids.length})`}</h2>

        <div className={styles.bidList}>
          {bids.length > 0 ? (
            bids.map((bid) => (
              <div key={bid.id} className={styles.bidItem}>
                <p>Фрилансер: {bid.freelancer_name || "Имя не указано"}</p>
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

        {toastMessage && (
          <Toast  
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage("")}
          />
        )}
      </div>
    </div>
  );
};

export default BidModal;
