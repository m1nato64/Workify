import React, { useState } from 'react';
import { useUser } from '../../../services/context/userContext'; 
import Toast from '../Toast';
import styles from './SkillsSettings.module.css';

const Skills = () => {
  const { user, updateUser } = useUser(); 
  const [skills, setSkills] = useState(user?.skills || ''); 
  const [toast, setToast] = useState(null);

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
    if (!user) return;

    const error = validateSkills(skills);
    if (error) {
      setToast({ message: error, type: 'error' }); 
      return;
    }

    try {
      const response = await fetch(`/api/profile/${user.id}/update-skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, skills };
        updateUser(updatedUser); 
        setSkills(updatedUser.skills); 
        setToast({ message: 'Навыки успешно обновлены', type: 'success' });
      } else {
        setToast({ message: data.error || 'Ошибка при сохранении навыков', type: 'error' });
      }
    } catch {
      setToast({ message: 'Ошибка подключения к серверу', type: 'error' });
    }
  };

  const handleSkillEdit = (oldSkill) => {
    const newSkill = prompt('Измените скилл:', oldSkill);
    if (newSkill) {
      const updatedSkills = skills.split(',').map(skill => skill.trim());
      const skillIndex = updatedSkills.indexOf(oldSkill);
      if (skillIndex !== -1) {
        updatedSkills[skillIndex] = newSkill.trim();
        setSkills(updatedSkills.join(', '));
      }
    }
  };

  const handleSkillDelete = (skillToDelete) => {
    const updatedSkills = skills.split(',').map(skill => skill.trim());
    const filteredSkills = updatedSkills.filter(skill => skill !== skillToDelete);
    setSkills(filteredSkills.join(', '));
  };

  return (
    <div className={styles.skillsSettingsContainer}>
      <h2 className={styles.skillsSettingsTitle}>Навыки</h2>
      <textarea
        className={styles.skillsTextarea}
        value={skills}
        onChange={handleSkillsChange}
        placeholder="Введите ваши навыки через запятую"
        rows="5"
      />
      
      <div className={styles.skillsList}>
        {skills.split(',').map((skill, index) => (
          <div className={styles.skillItem} key={index}>
            <span>{skill.trim()}</span>
            <button onClick={() => handleSkillDelete(skill.trim())}>Удалить</button>
            <button onClick={() => handleSkillEdit(skill.trim())}>Редактировать</button>
          </div>
        ))}
      </div>

      <button className={styles.skillsSaveBtn} onClick={handleSave}>
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
