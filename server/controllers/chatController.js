// controllers/chatsController.js
import { 
  findOrCreateChat,
  getChatUsersForUser,
 } from '../models/chatModel.js';

 import { pool } from '../models/database.js';

export const findOrCreateChatController = async (req, res) => {
  try {
    const { user1_id, user2_id } = req.body;
    if (!user1_id || !user2_id) {
      return res.status(400).json({ error: "user1_id и user2_id обязательны" });
    }

    const chat = await findOrCreateChat(user1_id, user2_id);
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChatUsersForUserController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const users = await getChatUsersForUser(user_id);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChatByIdController = async (req, res) => {
  const { chatId } = req.params;
  try {
    // Получить чат
    const chatRes = await pool.query("SELECT * FROM chats WHERE id = $1", [chatId]);
    if (chatRes.rows.length === 0) {
      return res.status(404).json({ error: "Чат не найден" });
    }
    const chat = chatRes.rows[0];

    const currentUserId = req.user?.id || parseInt(req.query.currentUserId);
    const otherUserId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
    const userRes = await pool.query("SELECT id, name FROM users WHERE id = $1", [otherUserId]);
    const otherUser = userRes.rows[0];
    const messagesRes = await pool.query("SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC", [chatId]);

    res.json({ chat, otherUser, messages: messagesRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
