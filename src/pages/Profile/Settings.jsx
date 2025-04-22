import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import GeneralSettings from '../../components/common/GeneralSettings';
import SecuritySettings from '../../components/common/SecuritySettings';
import DeleteAccount from '../../components/common/DeleteAccount';
import { getUserFromStorage } from '../../services/api/authServiceClient'; // Для получения данных пользователя
import './settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getUserFromStorage();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'delete':
        return user ? <DeleteAccount user={user} /> : <p>Пользователь не найден</p>;
      default:
        return null;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); 
  };

  return (
    <>
      <Header />

      <div className="settings-page">
        <div className="burger" onClick={toggleSidebar}>☰</div>

        <aside className={`settings-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <h2>Настройки</h2>
          <ul>
            <li onClick={() => handleTabClick('general')} className={activeTab === 'general' ? 'active' : ''}>Основные</li>
            <li onClick={() => handleTabClick('security')} className={activeTab === 'security' ? 'active' : ''}>Безопасность</li>
            <li onClick={() => handleTabClick('delete')} className={activeTab === 'delete' ? 'active' : ''}>Удаление аккаунта</li>
          </ul>
        </aside>

        <main className="settings-content">
          {renderTabContent()}
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Settings;
