import React, { useEffect, useState } from 'react';
import Toast from './Toast';
import './JobList.css';

const JobList = () => {
  const [projects, setProjects] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    fetch('http://localhost:3000/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => {
        console.error('Ошибка загрузки проектов:', err);
        setToastType('error');
        setToastMessage('Ошибка загрузки проектов');
      });
  }, []);

  const handleApply = async (projectId) => {
    if (!userId) {
      setToastType('error');
      setToastMessage('Пожалуйста, войдите в систему, чтобы откликнуться.');
      return;
    }

    try {
      // Проверяем, есть ли отклик
      const responseCheck = await fetch(`http://localhost:3000/api/bids/check?freelance_id=${userId}&project_id=${projectId}`);
      const { exists } = await responseCheck.json();

      if (exists) {
        setToastType('error');
        setToastMessage('Вы уже оставили отклик на этот проект.');
        return;
      }

      // Если отклика нет — отправляем
      const response = await fetch('http://localhost:3000/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          freelance_id: userId,
          project_id: projectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Отклик успешно добавлен:', data);
        setToastType('success');
        setToastMessage('Отклик успешно отправлен!');
      } else {
        const data = await response.json();
        console.error('Ошибка при отправке отклика:', data.message);
        setToastType('error');
        setToastMessage('Ошибка при отправке отклика. Попробуйте снова.');
      }
    } catch (err) {
      console.error('Ошибка сервера:', err);
      setToastType('error');
      setToastMessage('Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <div className="job-page">
      <div className="job-wrapper">
        <h2 className="job-title">Доступные проекты</h2>

        {toastMessage && (
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        )}

        <div className="job-list">
          {projects.map((project) => (
            <div key={project.id} className="job-card">
              <div className="info">
                <h3 className="job-title">{project.title}</h3>
                <p className="job-description">{project.description}</p>
                <div className="details">
                  <span className="status">{project.status}</span>
                  <span className="date">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button className="apply-button" onClick={() => handleApply(project.id)}>
                  Откликнуться
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobList;
