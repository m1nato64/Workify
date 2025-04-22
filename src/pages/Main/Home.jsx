import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from '../../components/common/Header'; 
import Footer from '../../components/common/Footer'; 
import AddOrderCard from '../../components/cards/AddOrderCard';
import JobList from '../../components/cards/JobList';

const Home = () => {
  const [role, setRole] = useState(null);
  const [clientId, setClientId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      navigate('/login');
    } else {
      setRole(user.role);
      setClientId(user.id); 
    }
  }, [navigate]);

  return (
    <div className="home">
      <Header role={role} />

      <main>
        {/* Отображение компонентов по ролям */}
        {role === 'Client' && clientId && (
          <AddOrderCard clientId={clientId} />
        )}

        {role === 'Freelancer' && (
          <JobList />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
