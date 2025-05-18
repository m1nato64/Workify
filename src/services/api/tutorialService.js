// src/services/api/tutorialService.js
import axios from 'axios';

const baseURL = 'http://localhost:3000/api/profile';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getShowTutorialSetting(userId) {
  const response = await axios.get(`${baseURL}/${userId}/tutorial-setting`);
  return response.data.showTutorial;
}

export async function updateShowTutorialSetting(userId, showTutorial) {
  const response = await axios.put(`${baseURL}/${userId}/tutorial-setting`, { showTutorial });
  return response.data.showTutorial;
}
