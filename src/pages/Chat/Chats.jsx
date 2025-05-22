import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useParams } from "react-router-dom"; // === импорт useParams
import Header from "../../components/common/Header-Footer/Header";
import Footer from "../../components/common/Header-Footer/Footer";
import styles from "./Сhats.module.css";
import { FaArrowCircleRight } from "react-icons/fa";
import { getUserFromStorage } from "../../services/api/authServiceClient";

const Chats = () => {
  const { chatId } = useParams(); // === получаем chatId из URL
  const user = getUserFromStorage();
  const currentUserId = user?.id;

  const [users, setUsers] = useState([]); // Пользователи с перепиской
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!currentUserId) {
      window.location.href = "/login";
      return;
    }

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

      // Если пришло сообщение от нового пользователя, обновим список
      if (
        message.sender_id !== currentUserId &&
        !users.find((u) => u.id === message.sender_id)
      ) {
        fetchChatUsers();
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUserId, selectedUser, users]);

  const fetchChatUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/chats/chatusers/${currentUserId}`,
        { withCredentials: true }
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке собеседников:", err);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchChatUsers();
    }
  }, [currentUserId]);

  // === Новый хук для загрузки чата по chatId из URL
  useEffect(() => {
    if (chatId && currentUserId) {
      axios
        .get(
          `http://localhost:3000/api/chats/${chatId}?currentUserId=${currentUserId}`,
          { withCredentials: true }
        )
        .then(({ data }) => {
          setSelectedUser(data.otherUser);
          setMessages(data.messages);
        })
        .catch((err) => {
          console.error("Ошибка при загрузке чата по chatId:", err);
          setSelectedUser(null);
          setMessages([]);
        });
    }
  }, [chatId, currentUserId]);

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

    fetchChatUsers(); 
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.chatWrapper}>
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Чаты</h2>
          {users.length === 0 && (
            <div>Чатов не найдено. Начните переписку с пользователем.</div>
          )}
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
              Выберите чат для начала переписки
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Chats;
