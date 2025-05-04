// server/controllers/profileController.js

import { 
  getUserData, 
  updateUserData, 
  deleteUserAccount, 
  updateUserAvatar, 
  changePassword,
  updateUserName, 
  updateUserSkills,
 } from '../models/profileModel.js';
 import bcrypt from 'bcrypt';

export const getProfileController = async (req, res) => {
  try {
    const userData = await getUserData(req.params.id);
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const { name, password, skills } = req.body;
    const updatedUser = await updateUserData(req.params.id, name, password, skills);
    res.json({ message: 'Данные пользователя обновлены', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProfileController = async (req, res) => {
  const { password } = req.body;
  const userId = req.params.id;

  try {
    const user = await getUserData(userId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log("Пользователь найден:", user);

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('Пароль не совпадает');
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const deletedUser = await deleteUserAccount(userId);
    console.log('Аккаунт успешно удален:', deletedUser);
    
    res.json({ message: 'Аккаунт удален', user: deletedUser });
  } catch (err) {
    console.error("Ошибка при удалении аккаунта:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateUserAvatarController = async (req, res) => {
  const userId = req.params.id;
  const avatarUrl = `/uploads/${req.file.filename}`;

  try {
    const updatedUser = await updateUserAvatar(userId, avatarUrl);
    res.json({ message: 'Аватар успешно обновлен', avatar: updatedUser.avatar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const changePasswordController = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    const updatedUser = await changePassword(userId, oldPassword, newPassword);
    res.json({ message: 'Пароль успешно изменен', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserNameController = async (req, res) => {
  const { name } = req.body;
  const userId = req.params.id;

  try {
    const updatedUser = await updateUserName(userId, name);
    res.json({ message: 'Имя пользователя обновлено', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserSkillsController = async (req, res) => {
  const userId = req.params.id;
  const { skills } = req.body;

  try {
    const updatedUser = await updateUserSkills(userId, skills);
    res.json({ message: 'Навыки успешно обновлены', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};