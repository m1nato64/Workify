//src/components/Toast.jsx
import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose }) => {
 useEffect(() => {
  if (typeof onClose === 'function') {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <span className="icon">
        {type === 'success' ? '✅' : '❌'}
      </span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;

