import React, { useEffect, useState } from "react";
import styles from "./ProjectsPage.module.css";
import { FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import { useUser } from "../../services/context/userContext"; // добавлен импорт

const ProjectsPage = () => {
  const { user } = useUser(); // используем пользователя
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const [editProjectId, setEditProjectId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("open");

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClient, setFilterClient] = useState("");
  const [filterTitle, setFilterTitle] = useState("");

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects");
      if (!response.ok) throw new Error("Ошибка загрузки проектов");
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
      alert("Не удалось загрузить проекты");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  const getClientName = (clientId) => {
    const user = users.find((u) => u.id === clientId);
    return user ? user.name : "—";
  };

  const createAdminLog = async ({ admin_id, action, ip_address = null }) => {
    try {
      console.log("Попытка логирования:", admin_id, action);
      const response = await fetch("/api/admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id, action, ip_address }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка логирования");
      }
    } catch (err) {
      console.error("Не удалось отправить лог:", err);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Удалить проект?")) return;

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Ошибка удаления проекта");
      setProjects((prev) => prev.filter((p) => p.id !== projectId));

      // логирование удаления
      if (user && user.id) {
        await createAdminLog({
          admin_id: user.id,
          action: `Удалён проект с id=${projectId}`,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить проект");
    }
  };

  const startEditing = (project) => {
    setEditProjectId(project.id);
    setEditTitle(project.title || "");
    setEditStatus(project.status || "open");
  };

  const cancelEditing = () => {
    setEditProjectId(null);
    setEditTitle("");
    setEditStatus("open");
  };

  const saveEditing = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${editProjectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          status: editStatus,
        }),
      });
      if (!response.ok) throw new Error("Ошибка обновления проекта");
      const updatedProject = await response.json();
      setProjects((prev) =>
        prev.map((p) => (p.id === editProjectId ? updatedProject : p))
      );
      cancelEditing();

      // логирование обновления
      if (user && user.id) {
        await createAdminLog({
          admin_id: user.id,
          action: `Обновлён проект с id=${editProjectId}`,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить проект");
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filterStatus !== "all" && project.status !== filterStatus) return false;
    if (
      filterClient.trim() !== "" &&
      !getClientName(project.client_id)
        .toLowerCase()
        .includes(filterClient.toLowerCase())
    )
      return false;
    if (
      filterTitle.trim() !== "" &&
      !project.title.toLowerCase().includes(filterTitle.toLowerCase())
    )
      return false;
    return true;
  });

  const resetFilters = () => {
    setFilterStatus("all");
    setFilterClient("");
    setFilterTitle("");
  };

  if (loading) return <div>Загрузка проектов...</div>;

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <h1>Администрирование проектов</h1>

        <div className={styles.filtersContainer}>
          <label>
            Статус:
            <select
              className={styles.select}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Все</option>
              <option value="open">Открытые</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершённые</option>
            </select>
          </label>

          <label>
            Клиент:
            <input
              type="text"
              className={styles.input}
              placeholder="Имя клиента"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            />
          </label>

          <label>
            Название проекта:
            <input
              type="text"
              placeholder="Название"
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              className={styles.input}
            />
          </label>

          <button className={styles.resetButton} onClick={resetFilters}>
            Сбросить фильтры
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Статус</th>
              <th>Клиент</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Проекты не найдены
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    {editProjectId === project.id ? (
                      <input
                        type="text"
                        className={styles.input}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    ) : (
                      project.title
                    )}
                  </td>
                  <td>
                    {editProjectId === project.id ? (
                      <select
                        className={styles.select}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        <option value="open">Открытые</option>
                        <option value="in_progress">В работе</option>
                        <option value="completed">Завершённые</option>
                      </select>
                    ) : (
                      project.status
                    )}
                  </td>
                  <td>{getClientName(project.client_id)}</td>
                  <td>{new Date(project.created_at).toLocaleDateString()}</td>
                  <td className={styles.actionsCell}>
                    {editProjectId === project.id ? (
                      <>
                        <button
                          className={styles.saveButton}
                          onClick={saveEditing}
                          title="Сохранить"
                        >
                          <FaSave />
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={cancelEditing}
                          title="Отмена"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={styles.editButton}
                          onClick={() => startEditing(project)}
                          title="Редактировать"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(project.id)}
                          title="Удалить проект"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
