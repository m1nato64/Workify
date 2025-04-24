import React, { useEffect, useState } from 'react';
import Toast from '../common/Toast';
import './JobList.css';

const JobList = () => {
  const [projects, setProjects] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const userId = JSON.parse(localStorage.getItem('user'))?.id;

  useEffect(() => {
    // Получение всех проектов
    console.log('Запрос на получение проектов...');
    fetch('http://localhost:3000/api/projects')
      .then(res => res.json())
      .then(async (data) => {
        console.log('Получены проекты:', data);
        setProjects(data);
      })
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
      console.log(`Проверка, оставлял ли пользователь отклик на проект ${projectId}...`);
      const responseCheck = await fetch(`http://localhost:3000/api/bids/check?freelance_id=${userId}&project_id=${projectId}`);
  
      if (!responseCheck.ok) {
        throw new Error(`Ошибка при проверке отклика: ${responseCheck.statusText}`);
      }
  
      const checkText = await responseCheck.text(); // Логируем текст ответа
      console.log('Ответ на проверку отклика:', checkText); // Логируем текст
  
      let exists;
      try {
        const checkData = JSON.parse(checkText);
        exists = checkData.exists;
      } catch (err) {
        console.error('Ошибка парсинга ответа при проверке отклика:', err);
        throw new Error('Ответ от сервера при проверке отклика не в формате JSON');
      }
  
      if (exists) {
        setToastType('error');
        setToastMessage('Вы уже оставили отклик на этот проект.');
        return;
      }
  
      const projectResponse = await fetch(`http://localhost:3000/api/projects/${projectId}`);
      if (!projectResponse.ok) {
        throw new Error(`Ошибка при получении данных проекта: ${projectResponse.statusText}`);
      }
  
      const project = await projectResponse.json();
  
      if (!project.accepting_bids) {
        setToastType('error');
        setToastMessage('На данный проект не принимаются отклики.');
        return;
      }
  
      console.log('Отправка отклика:', { freelance_id: userId, project_id: projectId });
  
      const response = await fetch('http://localhost:3000/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelance_id: userId, project_id: projectId }),
      });
  
      const text = await response.text(); // Получаем текстовый ответ
      console.log('Текст ответа от сервера на отклик:', text); // Логируем текст
  
      if (!response.ok) {
        let errorMessage = 'Ошибка при отправке отклика.';
        if (text) {
          try {
            const data = JSON.parse(text); // Пытаемся распарсить текст
            errorMessage = data.message || errorMessage;
          } catch (e) {
            console.error('Ответ не в формате JSON:', text); // Логируем, если ответ не JSON
          }
        }
  
        throw new Error(errorMessage);
      }
  
      const responseData = JSON.parse(text); // Парсим текст, если это JSON
      console.log('Ответ от сервера после отправки отклика:', responseData);
  
      setToastType('success');
      setToastMessage('Отклик успешно отправлен!');
  
      // Обновление состояния проекта с новым количеством откликов
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId ? { ...p, bids_count: p.bids_count + 1 } : p
        )
      );
    } catch (err) {
      console.error('Ошибка сервера:', err);
      setToastType('error');
      setToastMessage(err.message || 'Ошибка сервера. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <div className="job-page">
      <div className="job-wrapper">
        <h2 className="job-title">Доступные проекты</h2>

        {toastMessage && (
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
        )}

        <div className="job-list">
          {projects.length === 0 ? (
            <div className="no-projects">
              <p>На данный момент проектов нету.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="job-card">
                <div className="info">
                  <h3 className="job-title">{project.title}</h3>
                  <p className="job-description">{project.description}</p>
                  <div className="details">
                    <span className="status">{project.status}</span>
                    <span className="date">{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="stats">
                    <div className="stat-icon">
                      <svg viewBox="0 0 24 24"><path d="M12 5c-7.633 0-11 6.686-11 7s3.367 7 11 7 11-6.686 11-7-3.367-7-11-7zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zm0-8c-1.656 0-3 1.344-3 3s1.344 3 3 3 3-1.344 3-3-1.344-3-3-3z" /></svg>
                      {/* Убираем отображение просмотров */}
                    </div>
                    <div className="stat-icon">
                      <svg viewBox="0 0 24 24"><path d="M21 6h-18c-1.104 0-2 .896-2 2v10l4-4h16c1.104 0 2-.896 2-2v-4c0-1.104-.896-2-2-2zm0-2c2.206 0 4 1.794 4 4v4c0 2.206-1.794 4-4 4h-14l-6 6v-18c0-2.206 1.794-4 4-4h16z" /></svg>
                      {project.bids_count || 0}
                    </div>
                  </div>

                  <button
                    className="apply-button"
                    onClick={() => handleApply(project.id)}
                    disabled={!project.accepting_bids}
                  >
                    {project.accepting_bids ? "Откликнуться" : "Отклики не принимаются"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;
