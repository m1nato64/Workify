// controllers/profileController.js

import { getUserData, updateUserData, deleteUserAccount } from '../models/profileModel.js';

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
