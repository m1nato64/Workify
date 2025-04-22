import React, { useState } from 'react';
import './register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Freelancer');
  const [skills, setSkills] = useState([]);
  const [skillsInput, setSkillsInput] = useState('');
  const [showPassword, setShowPassword] = useState(false); 

  const handleRegister = async (event) => {
    event.preventDefault();

    const skillsString = role === 'Client' ? '' : skills.join(', ');

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password, role, skills: skillsString })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Регистрация успешна!');
        window.location.href = '/login'; 
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      alert('Ошибка сервера');
    }
  };

  const handleAddSkill = () => {
    if (skillsInput && !skills.includes(skillsInput)) {
      setSkills([...skills, skillsInput]);
      setSkillsInput('');
    }
  };

  const handleRemoveSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword); 
  };

  return (
    <div className="container">
      <h2>Регистрация</h2>
      <form className='register-form' onSubmit={handleRegister}>
        <label htmlFor="name">Логин:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="password">Пароль:</label>
        <div className="password-container">
          <input
            type={showPassword ? 'text' : 'password'} 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            id="togglePassword"
            aria-label="Показать пароль"
            onClick={togglePassword}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <label htmlFor="role">Роль:</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="Freelancer">Фрилансер</option>
          <option value="Client">Клиент</option>
        </select>

        {role === 'Freelancer' && (
          <div className="skills-container visible">
            <label htmlFor="skills">Навыки:</label>
            <input
              type="text"
              id="skills"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Введите навык"
            />
            <button type="button" onClick={handleAddSkill}>Добавить навык</button>
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index}>
                  {skill} <span className="remove-skill" onClick={() => handleRemoveSkill(index)}>×</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="btn">Зарегистрироваться</button>
      </form>
      <p className="had-acc">
        Уже есть аккаунт? <a href="/login">Войти</a>
      </p>
    </div>
  );
};

export default Register;
