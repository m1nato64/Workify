// server/services/authService.js
import axios from 'axios';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),

  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },

  checkToken: async () => {
    const token = authService.getToken();
    if (!token) throw new Error('Token not found');

    try {
      const response = await axios.get('/api/auth/check-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (err) {
      throw err; 
    }
  },
};

export default authService;
