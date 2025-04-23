import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../services/api/authServiceClient';
import { useUser } from '../../services/context/userContext';
import Header from '../../components/common/Header-Footer/Header';
import Footer from '../../components/common/Header-Footer/Footer';
import './myorders.css';

const statusLabels = {
  open: 'открыт',
  in_progress: 'в разработке',
  completed: 'завершен'
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    status: '',
    media: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const { user, updateUser } = useUser();

  useEffect(() => {
    const token = getToken();
    if (!token || !user) {
      window.location.href = '/login';
      return;
    }

    loadOrders(token, user.id);
  }, [user]);

  const loadOrders = async (token, userId) => {
    try {
      const { data } = await axios.get(`/api/projects/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setOrders(sorted);
    } catch (err) {
      setError('Ошибка при загрузке заказов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateBidStatus = async (bidId, status) => {
    const token = getToken();
    try {
      const { data } = await axios.put(`/api/bids/status/${bidId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedOrders = orders.map(order =>
        order.bids ? {
          ...order,
          bids: order.bids.map(bid =>
            bid.id === bidId ? { ...bid, status: data.updatedBid.status } : bid
          )
        } : order
      );

      setOrders(updatedOrders);
      updateUser(user);
      alert(data.message);
    } catch (err) {
      alert('Ошибка при обновлении статуса отклика');
      console.error(err);
    }
  };

  const toggleBids = async (projectId, accepting) => {
    const token = getToken();
    try {
      await axios.put(`/api/projects/bids-toggle/${projectId}`, { accepting }, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
        headers: { Authorization: `Bearer ${token}` }
      });
      loadOrders(token, user.id);
    } catch (err) {
      alert('Ошибка при удалении проекта');
      console.error(err);
    }
  };

  const openEditModal = (order) => {
    setProjectData({
      title: order.title,
      description: order.description,
      status: order.status,
      media: order.media
    });
    setImagePreview(order.media);
    setSelectedOrder(order);
    setEditMode(true);
  };

  const handleProjectUpdate = async (e) => {
    e.preventDefault();
    const token = getToken();
    const formData = new FormData();

    formData.append('title', projectData.title);
    formData.append('description', projectData.description);
    formData.append('status', projectData.status);
    if (projectData.media) formData.append('media', projectData.media);

    try {
      const { data } = await axios.put(`/api/projects/update-project/${selectedOrder.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, ...projectData, media: data.updatedProject.media }
          : order
      );

      setOrders(updatedOrders);
      alert('Проект обновлен!');
      closeEditModal();
    } catch (err) {
      alert('Ошибка при обновлении проекта');
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProjectData(prev => ({ ...prev, media: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const closeModal = () => setIsModalOpen(false);
  const closeEditModal = () => {
    setEditMode(false);
    setImagePreview(null);
  };

  return (
    <div>
      <Header role={user?.role} />
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

        {!loading && orders.length > 0 && (
          <div className="order-list">
            {orders.map((order) => (
              <div className="order-item" key={order.id}>
                <p>Название проекта: {order.title}</p>
                <p>Описание: {order.description}</p>
                <p>
                  Статус проекта:{' '}
                  <span className={`status-project ${order.status}`}>
                    {statusLabels[order.status]}
                  </span>
                </p>
                <p>
                  Статус откликов:{' '}
                  <span className={`status ${order.accepting_bids ? 'accepting' : 'not-accepting'}`}>
                    {order.accepting_bids ? 'принимаются' : 'не принимаются'}
                  </span>
                </p>
                {order.media && <img src={order.media} alt="Project" width="100" />}
                <div className="action-buttons">
                  <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>Посмотреть отклики</button>
                  <button onClick={() => openEditModal(order)}>Редактировать</button>
                  <button onClick={() => deleteProject(order.id)}>Удалить</button>
                  <button onClick={() => toggleBids(order.id, !order.accepting_bids)}>
                    {order.accepting_bids ? 'Закрыть отклики' : 'Открыть отклики'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно откликов */}
        {isModalOpen && selectedOrder && !editMode && (
        <div className="modal">
          <div className="modal-content">
            <h2>Отклики на проект</h2>
              <div className="bid-list">
              {selectedOrder.bids?.length > 0 ? (
                selectedOrder.bids.map((bid) => (
                <div key={bid.id} className="bid-item">
                  <p>Фрилансер: {bid.freelancer_name || 'Имя не указано'}</p>
                  <p>Статус: <span className={`status ${bid.status === 'accepted' ? 'accepting' : 'not-accepting'}`}>{bid.status}</span></p>
                    <div className="action-buttons">
                      <button onClick={() => updateBidStatus(bid.id, 'accepted')}>Принять</button>
                      <button className='rejectedButton' onClick={() => updateBidStatus(bid.id, 'rejected')}>Отклонить</button>
                    </div>
                </div>
              ))
            ) : (
            <p>Нет откликов на этот проект.</p>
          )}
        </div>
      <button onClick={closeModal}>Закрыть</button>
    </div>
  </div>
)}

        {/* Модальное окно редактирования */}
        {editMode && (
        <div className="modal modal-edit">
          <div className="modal-content">
            <h2>Редактирование проекта</h2>
              <form onSubmit={handleProjectUpdate}>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                  placeholder="Название проекта"
                />
        <textarea
          value={projectData.description}
          onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
          placeholder="Описание проекта"
        />
        <select
          value={projectData.status}
          onChange={(e) => setProjectData({ ...projectData, status: e.target.value })}
        >
          <option value="open">Открыт</option>
          <option value="in_progress">В разработке</option>
          <option value="completed">Завершен</option>
        </select>
        <input type="file" onChange={handleFileChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" width="100" />}
        <button type="submit">Обновить</button>
        <button type="button" onClick={closeEditModal}>Отмена</button>
      </form>
    </div>
  </div>
)}
</main>
<Footer />
</div>
  );
};

export default MyOrders;
