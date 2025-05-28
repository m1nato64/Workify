import React, { useEffect, useState } from "react";
import styles from "./UsersPage.module.css";
import { FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import { useUser } from "../../services/context/userContext";

const UsersPage = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Редактирование
  const [editUserId, setEditUserId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("Client");
  const [editSkills, setEditSkills] = useState("");

  // Фильтры
  const [filterRole, setFilterRole] = useState("all");
  const [filterMinRating, setFilterMinRating] = useState("");
  const [filterRegisteredAfter, setFilterRegisteredAfter] = useState("");
  const [filterSkills, setFilterSkills] = useState("");

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
  // Загрузка пользователей
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Ошибка при загрузке пользователей");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert("Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Удаление пользователя
  const handleDelete = async (userId) => {
    if (!window.confirm("Вы уверены, что хотите удалить пользователя?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Ошибка удаления пользователя");
      setUsers((prev) => prev.filter((user) => user.id !== userId));

      // Логирование удаления
      await createAdminLog({
  admin_id: user.id,
  action: `Удалён пользователь с id=${userId}`,
});
    } catch (err) {
      console.error(err);
      alert("Не удалось удалить пользователя");
    }
  };

  // Начало редактирования пользователя
  const startEditing = (user) => {
    setEditUserId(user.id);
    setEditName(user.name || "");
    setEditRole(user.role || "Client");
    setEditSkills(user.skills || "");
  };

  // Отмена редактирования
  const cancelEditing = () => {
    setEditUserId(null);
    setEditName("");
    setEditRole("Client");
    setEditSkills("");
  };

  // Сохранение изменений пользователя
  const saveEditing = async () => {
    try {
      const response = await fetch(`/api/admin/users/${editUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          skills: editSkills,
        }),
      });
      if (!response.ok) throw new Error("Ошибка обновления пользователя");

      const updatedUser = await response.json();

      setUsers((prev) =>
        prev.map((user) => (user.id === editUserId ? updatedUser : user))
      );
      cancelEditing();

      // Логируем действие, если пользователь (админ) есть
      if (user && user.id) {
        await createAdminLog({
          admin_id: user.id,
          action: `Обновлен пользователь с id=${editUserId}`,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить изменения");
    }
  };

  // Применение фильтров
  const filteredUsers = users.filter((user) => {
    if (filterRole !== "all" && user.role !== filterRole) return false;

    if (filterMinRating !== "") {
      const rating = parseFloat(user.rating);
      if (isNaN(rating) || rating < parseFloat(filterMinRating)) return false;
    }

    if (filterRegisteredAfter) {
      const regDate = new Date(user.created_at);
      const filterDate = new Date(filterRegisteredAfter);
      if (regDate < filterDate) return false;
    }

    if (filterSkills.trim() !== "") {
      if (
        !user.skills ||
        !user.skills.toLowerCase().includes(filterSkills.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  });

  if (loading) return <div>Загрузка пользователей...</div>;

  const resetFilters = () => {
    setFilterRole("all");
    setFilterMinRating("");
    setFilterRegisteredAfter("");
    setFilterSkills("");
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <h1>Управление пользователями</h1>

        <div className={styles.filtersContainer}>
          <label>
            Роль:
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Все</option>
              <option value="Client">Клиенты</option>
              <option value="Freelancer">Фрилансеры</option>
            </select>
          </label>

          <label>
            Мин. рейтинг:
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="Например, 4.0"
              value={filterMinRating}
              onChange={(e) => setFilterMinRating(e.target.value)}
            />
          </label>

          <label>
            Зарегистрирован после:
            <input
              type="date"
              value={filterRegisteredAfter}
              onChange={(e) => setFilterRegisteredAfter(e.target.value)}
            />
          </label>

          <label>
            Навыки (поиск):
            <input
              type="text"
              placeholder="Введите навык"
              value={filterSkills}
              onChange={(e) => setFilterSkills(e.target.value)}
            />
          </label>

          <button className={styles.resetButton} onClick={resetFilters}>
            Сбросить фильтры
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Роль</th>
              <th>Навыки</th>
              <th>Рейтинг</th>
              <th>Дата регистрации</th>
              <th>Аватар</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Пользователи не найдены
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    {editUserId === user.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      user.name
                    )}
                  </td>

                  <td>
                    {editUserId === user.id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                      >
                        <option value="Client">Клиент</option>
                        <option value="Freelancer">Фрилансер</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>

                  <td>
                    {editUserId === user.id ? (
                      <input
                        type="text"
                        value={editSkills}
                        onChange={(e) => setEditSkills(e.target.value)}
                      />
                    ) : (
                      user.skills || "-"
                    )}
                  </td>

                  <td>
                    {user.rating != null && !isNaN(+user.rating)
                      ? Number(user.rating).toFixed(1)
                      : "-"}
                  </td>

                  <td>{new Date(user.created_at).toLocaleDateString()}</td>

                  <td>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className={styles.avatar}
                      />
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className={styles.actionsCell}>
                    {editUserId === user.id ? (
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
                          onClick={() => startEditing(user)}
                          title="Редактировать"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(user.id)}
                          title="Удалить пользователя"
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

export default UsersPage;
