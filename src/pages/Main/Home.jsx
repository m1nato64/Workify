import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header-Footer/Header';
import Footer from '../../components/common/Header-Footer/Footer';
import WelcomePage from '../../pages/Welcome/WelcomePage';
import JobList from '../../components/cards/JobList';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));

    if (!userData) {
      navigate('/login');
    } else {
      setUser(userData);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="home">
      <Header />

      <main>
        {user.role === 'Client' && (
          <WelcomePage user={user} />
        )}

        {user.role === 'Freelancer' && (
          <JobList />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
