//src/services/authServiceClient.js
export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  export const getUserFromStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };
  