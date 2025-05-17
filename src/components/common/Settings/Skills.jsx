import React, { useState, useEffect } from 'react';
import { useUser } from '../../../services/context/userContext'; 
import Toast from '../Toast';
import './skills.css';

const Skills = () => {
  const { user, updateUser } = useUser(); 
  const [skills, setSkills] = useState(user?.skills || ''); 
  const [toast, setToast] = useState(null);

  // Функция для валидации скиллов
  const validateSkills = (input) => {
    const skillsArray = input.split(',').map(skill => skill.trim());
    if (skillsArray.some(skill => skill === '')) {
      return 'Скиллы не могут быть пустыми.';
    }
    return null; 
  };

  const handleSkillsChange = (event) => {
    setSkills(event.target.value);
    setToast(null); 
  };

  const handleSave = async () => {
    if (!user) {
      return;
    }

    const error = validateSkills(skills);
    if (error) {
      setToast({ message: error, type: 'error' }); 
      return;
    }

    // Логика сохранения навыков, например через API
    try {
      const response = await fetch(`/api/profile/${user.id}/update-skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
      });

      const data = await response.json();

      if (response.ok) {
        // Обновляем скиллы в контексте
        const updatedUser = { ...user, skills };
        updateUser(updatedUser); 
        setSkills(updatedUser.skills); 
        setToast({ message: 'Навыки успешно обновлены', type: 'success' });
      } else {
        setToast({ message: data.error || 'Ошибка при сохранении навыков', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Ошибка подключения к серверу', type: 'error' });
    }
  };

  // Функция для изменения скиллов (редактировать и удалять)
  const handleSkillEdit = (oldSkill) => {
    const newSkill = prompt('Измените скилл:', oldSkill);
    if (newSkill) {
      const updatedSkills = skills.split(',').map(skill => skill.trim());
      const skillIndex = updatedSkills.indexOf(oldSkill);
      updatedSkills[skillIndex] = newSkill;
      setSkills(updatedSkills.join(', '));
    }
  };

  const handleSkillDelete = (skillToDelete) => {
    const updatedSkills = skills.split(',').map(skill => skill.trim());
    const filteredSkills = updatedSkills.filter(skill => skill !== skillToDelete);
    setSkills(filteredSkills.join(', '));
  };

  return (
    <div className="skills-settings-container">
      <h2 className="skills-settings-title">Навыки</h2>
      <textarea
        className="skills-textarea"
        value={skills}
        onChange={handleSkillsChange}
        placeholder="Введите ваши навыки через запятую"
        rows="5"
      />
      
      <div className="skills-list">
        {skills.split(',').map((skill, index) => (
          <div className="skill-item" key={index}>
            <span>{skill.trim()}</span>
            <button onClick={() => handleSkillEdit(skill.trim())}>Редактировать</button>
            <button onClick={() => handleSkillDelete(skill.trim())}>Удалить</button>
          </div>
        ))}
      </div>

      <button className="skills-save-btn" onClick={handleSave}>
        Сохранить
      </button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Skills;
