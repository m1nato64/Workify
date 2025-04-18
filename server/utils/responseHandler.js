// utils/responseHandler.js

const handleError = (res, statusCode, message) => {
    return res.status(statusCode).json({ error: message });
  };
  
  const handleSuccess = (res, statusCode, message, data = {}) => {
    return res.status(statusCode).json({ message, data });
  };
  
  export { handleError, handleSuccess };
  