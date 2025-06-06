import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider, useUser } from "./services/context/userContext";
import { SocketProvider } from "./services/context/socketContext";
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
import AddOrderCard from "./components/cards/AddOrderCard.jsx";
import FreelancersList from "./pages/Freelancers/FreelancersList.jsx";
import SearchProjects from "./pages/SearchProjects/SearchProjects.jsx";
import UsersPage from "./pages/Admin/UsersPage";
import ProjectsPage from "./pages/Admin/ProjectsPage";
import AdminLogs from "./pages/Admin/AdminLogs";
import StatsPage from "./pages/Admin/StatsPage";
import Landing from "./pages/Welcome/Landing.jsx";
import withAdminProtection from "./pages/Admin/withAdminProtection";

import "./styles/global.css";

const ProtectedUsersPage = withAdminProtection (UsersPage);
const ProtectedProjectsPage = withAdminProtection (ProjectsPage);
const ProtectedAdminLogs = withAdminProtection (AdminLogs);
const ProtectedStatsPage = withAdminProtection (StatsPage);

const AppRoutes = () => {
  const { user } = useUser();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="/responses" element={<Responses />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/add-order" element={<AddOrderCard />} />
      <Route path="/freelancers" element={<FreelancersList />} />
      <Route path="/chat/" element={user ? <Chats currentUserId={user.id} /> : <Login />} />
      <Route path="/chat/:chatId" element={user ? <Chats currentUserId={user.id} /> : <Login />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/jobs" element={<SearchProjects />} />
      <Route path="/admin/users" element={<ProtectedUsersPage />} />
      <Route path="/admin/projects" element={<ProtectedProjectsPage />} />
      <Route path="/admin/logs" element={<ProtectedAdminLogs />} />
      <Route path="/admin/stats" element={<ProtectedStatsPage />} />
    </Routes>
  );
};

const AppWrapper = () => {
  const { user } = useUser();

  return (
    <SocketProvider userId={user?.id}>
      <Router>
        <DocumentTitleUpdater />
        <AppRoutes />
      </Router>
    </SocketProvider>
  );
};

const App = () => (
  <UserProvider>
    <AppWrapper />
  </UserProvider>
);

export default App;
