import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider, useUser } from "./services/context/userContext";
import Login from "./pages/Auth/Login/Login.jsx";
import Register from "./pages/Auth/Register/Register.jsx";
import Home from "./pages/Main/Home";
import Responses from "./pages/Responses/Responses";
import MyOrders from "./pages/Orders/MyOrders";
import Profile from "./pages/Profile/Profile";
import DocumentTitleUpdater from "./utils/DocumentTitleUpdater.jsx";
import Settings from "./pages/Profile/Settings";
import Chats from "./pages/Chat/Chats";
import WelcomePage from "./pages/Welcome/WelcomePage.jsx";
import "./styles/global.css";
import AddOrderCard from "./components/cards/AddOrderCard.jsx";

const AppRoutes = () => {
  const { user } = useUser(); 

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/responses" element={<Responses />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/add-order" element={<AddOrderCard />} />
      <Route
        path="/chat"
        element={user ? <Chats currentUserId={user.id} /> : <Login />}
      />
      <Route path="/welcome" element={<WelcomePage/>} />
    </Routes>
  );
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <DocumentTitleUpdater />
        <AppRoutes />
      </Router>
    </UserProvider>
  );
};

export default App;