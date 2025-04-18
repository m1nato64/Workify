// controllers/projectController.js
import { createProject, getAllProjects, getProjectsByUserId, getProjectById } from '../models/projectModel.js';

export const createProjectController = async (req, res) => {
  try {
    const body = Object.fromEntries(Object.entries(req.body));
    const { title, description, status, client_id } = body;  
    const media = req.file ? req.file.path : null; 
    
    if (!title || !description || !status || !client_id) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const project = await createProject(title, description, status, media, client_id);
    res.status(201).json({ message: 'Проект создан', project });
  } catch (err) {
    console.error('Error creating project:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getAllProjectsController = async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProjectsByUserIdController = async (req, res) => {
  try {
    const projects = await getProjectsByUserId(req.params.id);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProjectByIdController = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Проект не найден' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
