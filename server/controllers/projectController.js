//controllers/projectController.js
import { createProject,  getAllProjects, getProjectsByUserId, getProjectById, deleteProject, toggleBids } from '../models/projectModel.js';
import { getBidsForProject } from '../models/bidModel.js';

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

    // Добавляем отклики к каждому проекту
    const projectsWithBids = await Promise.all(
      projects.map(async (project) => {
        const bids = await getBidsForProject(project.id);
        return { ...project, bids };
      })
    );

    res.json(projectsWithBids);
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

export const toggleProjectBidsController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { accepting } = req.body; 
    const updatedProject = await toggleBids(projectId, accepting);
    res.json({ message: 'Прием заявок обновлен', updatedProject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const deletedProject = await deleteProject(projectId);
    if (!deletedProject) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    res.json({ message: 'Проект удален', deletedProject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};