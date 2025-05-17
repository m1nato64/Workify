import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import styles from "./Сhats.module.css";
import { FaArrowCircleRight } from "react-icons/fa";

const Chats = ({ currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!currentUserId) return;

    socketRef.current = io("http://localhost:3000", {
      withCredentials: true,
    });

    socketRef.current.emit("register", currentUserId);

    socketRef.current.on("receive_message", (message) => {
      if (
        selectedUser &&
        ((message.sender_id === selectedUser.id &&
          message.receiver_id === currentUserId) ||
          (message.sender_id === currentUserId &&
            message.receiver_id === selectedUser.id))
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUserId, selectedUser]);

  useEffect(() => {
    if (!currentUserId) return;

    axios
      .get("http://localhost:3000/api/profile/all", { withCredentials: true })
      .then((res) => {
        const otherUsers = res.data.filter((u) => u.id !== currentUserId);
        setUsers(otherUsers);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке пользователей:", err);
      });
  }, [currentUserId]);

  const fetchMessages = async (user) => {
    try {
      setSelectedUser(user);
      const res = await axios.get(
        `http://localhost:3000/api/message/${currentUserId}/${user.id}`,
        { withCredentials: true }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке сообщений:", err);
      setMessages([]);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      sender_id: currentUserId,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
    };

    socketRef.current.emit("send_message", messageData);

    setMessages((prev) => [...prev, { ...messageData, id: Date.now() }]);
    setNewMessage("");
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.chatWrapper}>
        {/* Список пользователей */}
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Пользователи</h2>
          {users.length === 0 && <div>Пользователи не найдены</div>}
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => fetchMessages(user)}
              className={`${styles.userItem} ${
                selectedUser?.id === user.id ? styles.userItemActive : ""
              }`}
            >
              {user.name}
            </div>
          ))}
        </div>

        {/* Чат */}
        <div className={styles.chatArea}>
          {selectedUser ? (
            <>
              <div className={styles.chatHeader}>
                <h2 className={styles.chatTitle}>Чат с {selectedUser.name}</h2>
              </div>

              <div className={styles.messageList}>
                {messages.length === 0 && (
                  <div className="text-gray-500">Нет сообщений</div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id || msg.timestamp || Math.random()}
                    className={`${styles.message} ${
                      msg.sender_id === currentUserId ? styles.myMessage : ""
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className={styles.input}
                  placeholder="Введите сообщение..."
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend} className={styles.sendIconBtn}>
                  <FaArrowCircleRight />
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center mt-20">
              Выберите пользователя для начала чата
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Chats;
