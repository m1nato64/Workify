import React, { useEffect, useState } from "react";
import styles from "./AdminLogs.module.css";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs");
      if (!res.ok) throw new Error("Ошибка при загрузке логов");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Не удалось загрузить логи:", err);
      alert("Ошибка при загрузке логов");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <div>Загрузка логов...</div>;

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
         <h1>Журнал действий администраторов</h1>
        {logs.length === 0 ? (
          <p>Нет доступных логов.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>ID админа</th>
                <th>Действие</th>
                <th>IP-адрес</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.admin_id}</td>
                  <td>{log.action}</td>
                  <td>{log.ip_address || "—"}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminLogs;