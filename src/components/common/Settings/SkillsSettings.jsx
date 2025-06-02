import React, { useState } from 'react';
import { useUser } from '../../../services/context/userContext'; 
import Toast from '../Toast';
import Modal from 'react-modal';
import styles from './SkillsSettings.module.css';

Modal.setAppElement('#root'); // укажи корневой элемент твоего приложения

const Skills = () => {
  const { user, updateUser } = useUser(); 
  const [skills, setSkills] = useState(user?.skills || ''); 
  const [toast, setToast] = useState(null);

  // Для модального окна редактирования
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState('');
  const [editedSkillValue, setEditedSkillValue] = useState('');

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

  const openEditModal = (oldSkill) => {
    setSkillToEdit(oldSkill);
    setEditedSkillValue(oldSkill);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const saveEditedSkill = () => {
    if (editedSkillValue.trim() === '') {
      setToast({ message: 'Скилл не может быть пустым', type: 'error' });
      return;
    }
    const updatedSkills = skills.split(',').map(skill => skill.trim());
    const skillIndex = updatedSkills.indexOf(skillToEdit);
    if (skillIndex !== -1) {
      updatedSkills[skillIndex] = editedSkillValue.trim();
      setSkills(updatedSkills.join(', '));
      setIsModalOpen(false);
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
            <span>{skill.trim().length > 14 ? skill.trim().slice(0, 14) + '…' : skill.trim()}</span>
            <button onClick={() => handleSkillDelete(skill.trim())}>Удалить</button>
            <button onClick={() => openEditModal(skill.trim())}>Редактировать</button>
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

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Редактировать навык"
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
      >
        <h2>Редактировать навык</h2>
        <input
          type="text"
          value={editedSkillValue}
          onChange={(e) => setEditedSkillValue(e.target.value)}
          className={styles.modalInput}
          autoFocus
        />
        <div className={styles.modalButtons}>
          <button onClick={saveEditedSkill} className={styles.modalSaveBtn}>Сохранить</button>
          <button onClick={closeModal} className={styles.modalCancelBtn}>Отмена</button>
        </div>
      </Modal>
    </div>
  );
};

export default Skills;
