// withAdminProtection.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../services/context/userContext";

const withAdminProtection = (Component) => {
  return (props) => {
    const { user } = useUser();

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (user.role !== "Admin") {
      return <Navigate to="/login" replace />;
    }

    return <Component {...props} />;
  };
};

export default withAdminProtection;
