// server/controllers/profileController.js

import { 
  getUserData, 
  updateUserData, 
  deleteUserAccount, 
  updateUserAvatar, 
  changePassword,
  updateUserName, 
 } from '../models/profileModel.js';

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
  try {
    const deletedUser = await deleteUserAccount(req.params.id);
    res.json({ message: 'Аккаунт удален', user: deletedUser });
  } catch (err) {
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