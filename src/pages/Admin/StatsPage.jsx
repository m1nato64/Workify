import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import styles from "./StatsPage.module.css";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        const formatted = {
          usersCount: data.users.total,
          usersByDate: data.users.perDay.map(({ date, count }) => ({
            date: formatDate(date),
            count: Number(count),
          })),
          projectsCount: data.projects.total,
          projectsByDate: data.projects.perDay.map(({ date, count }) => ({
            date: formatDate(date),
            projects: Number(count),
          })),
          bidsCount: data.bids.total,
          bidsByDate: data.bids.perDay.map(({ date, count }) => ({
            date: formatDate(date),
            bids: Number(count),
          })),
          messagesCount: data.messages.total,
          messagesByDate: data.messages.perDay.map(({ date, count }) => ({
            date: formatDate(date),
            count: Number(count),
          })),
        };

        const allDates = Array.from(
          new Set([
            ...formatted.projectsByDate.map((d) => d.date),
            ...formatted.bidsByDate.map((d) => d.date),
          ])
        ).sort((a, b) => new Date(a) - new Date(b));

        const projectsBidsByDate = allDates.map((date) => {
          const proj = formatted.projectsByDate.find((p) => p.date === date);
          const bid = formatted.bidsByDate.find((b) => b.date === date);
          return {
            date,
            projects: proj ? proj.projects : 0,
            bids: bid ? bid.bids : 0,
          };
        });

        setStats({ ...formatted, projectsBidsByDate });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load stats", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className={styles.container}>Загрузка статистики...</p>;
  if (!stats) return <p className={styles.container}>Ошибка загрузки данных</p>;

  return (
    <>
      <Header />
      <main className={styles.container}>
        <h1>Статистика сайта</h1>

        <section className={styles.section}>
          <h2 className={styles.title}>Пользователи</h2>
          <div className={styles.statsRow}>
            <div className={styles.statsNumbers}>
              <p>
                <b>Всего пользователей:</b>
              </p>
              <p className={styles.totalNumber}>{stats.usersCount}</p>
            </div>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer>
                <LineChart data={stats.usersByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Новые пользователи"
                    stroke="#8884d8"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.title}>Проекты и отклики</h2>
          <div className={styles.statsRow}>
            <div className={styles.statsNumbers}>
              <p>
                <b>Всего проектов:</b>
              </p>
              <p className={styles.totalNumber}>{stats.projectsCount}</p>
              <p>
                <b>Всего откликов (bids):</b>
              </p>
              <p className={styles.totalNumber}>{stats.bidsCount}</p>
            </div>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer>
                <BarChart data={stats.projectsBidsByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="projects"
                    name="Создано проектов"
                    fill="#82ca9d"
                  />
                  <Bar dataKey="bids" name="Откликов" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.title}>Сообщения</h2>
          <div className={styles.statsRow}>
            <div className={styles.statsNumbers}>
              <p>
                <b>Всего сообщений:</b>
              </p>
              <p className={styles.totalNumber}>{stats.messagesCount}</p>
            </div>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer>
                <LineChart data={stats.messagesByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Сообщения"
                    stroke="#ff7300"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default StatsPage;
