import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken, getUserFromStorage } from '../../services/api/authServiceClient';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import './myorders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // Состояние для выбранного заказа
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для отображения модального окна

  useEffect(() => {
    const token = getToken();
    const user = getUserFromStorage();

    if (!token || !user) {
      window.location.href = '/login';
      return;
    }

    setRole(user.role);
    loadOrders(token, user.id);
  }, []);

  const loadOrders = async (token, userId) => {
    try {
      const response = await axios.get(`/api/projects/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      setError('Ошибка при загрузке заказов');
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBidStatus = async (bidId, status) => {
    const token = getToken();
    try {
      const response = await axios.put(`/api/bids/status/${bidId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order.bids) {
            return {
              ...order,
              bids: order.bids.map((bid) =>
                bid.id === bidId ? { ...bid, status: response.data.updatedBid.status } : bid
              ),
            };
          }
          return order;
        });
      });

      alert(response.data.message);
    } catch (err) {
      alert('Ошибка при обновлении статуса отклика');
      console.error('Ошибка обновления статуса:', err);
    }
  };

  const toggleBids = async (projectId, accepting) => {
    const token = getToken();
    try {
      await axios.put(
        `/api/projects/bids-toggle/${projectId}`,
        { accepting },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const user = getUserFromStorage();
      loadOrders(token, user.id);
    } catch (err) {
      alert('Ошибка при обновлении статуса приема откликов');
      console.error(err);
    }
  };

  const deleteProject = async (projectId) => {
    const token = getToken();
    if (!window.confirm('Вы уверены, что хотите удалить проект?')) return;
    try {
      await axios.delete(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = getUserFromStorage();
      loadOrders(token, user.id);
    } catch (err) {
      alert('Ошибка при удалении проекта');
      console.error(err);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order); // Устанавливаем выбранный заказ
    setIsModalOpen(true); // Открываем модальное окно
  };

  const closeModal = () => {
    setIsModalOpen(false); // Закрываем модальное окно
  };

  return (
    <div>
      <Header role={role} />
      <main>
        <h1>Мои заказы</h1>

        {loading && <p>Загрузка...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && orders.length === 0 && (
            <div className="no-projects">
                <p>Вы пока не создавали проекты.</p>
                <p>Создайте проект, чтобы фрилансеры смогли выполнить его!</p>
            </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="order-list">
            {orders.map((order) => (
              <div key={order.id} className="order-item">
                <p><strong>Проект:</strong> {order.title}</p>
                <p><strong>Описание:</strong> {order.description}</p>
                <p><strong>Прием откликов:</strong> {order.accepting_bids ? 'включен' : 'отключен'}</p>

                <div className="order-actions">
                  <button onClick={() => toggleBids(order.id, !order.accepting_bids)}>
                    {order.accepting_bids ? 'Отключить отклики' : 'Включить отклики'}
                  </button>
                  <button onClick={() => deleteProject(order.id)}>Удалить проект</button>
                  <button onClick={() => openModal(order)}>Посмотреть отклики</button> {/* Кнопка для открытия модального окна */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно для отображения откликов */}
        {isModalOpen && selectedOrder && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>&times;</span>
              <h2>Отклики на проект: {selectedOrder.title}</h2>

              {selectedOrder.bids && Array.isArray(selectedOrder.bids) && selectedOrder.bids.length > 0 ? (
                selectedOrder.bids.map((bid) => (
                  <div key={bid.id} className="bid-item">
                    <p>
                      <strong>Отклик от:</strong>{' '}
                      {bid.freelancer_name ? bid.freelancer_name : `ID: ${bid.freelancer_id}`}
                    </p>
                    <p><strong>Статус:</strong> {bid.status}</p>

                    {bid.status === 'pending' && (
                        <>
                            <button className="btn-action accept" onClick={() => updateBidStatus(bid.id, 'accepted')}>Принять</button>
                            <button className="btn-action reject" style={{ backgroundColor: '#f44336' }} onClick={() => updateBidStatus(bid.id, 'rejected')}>Отклонить</button>
                        </>
                    )}

                  </div>
                ))
              ) : (
                <p>Нет откликов для этого проекта.</p>
              )}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
