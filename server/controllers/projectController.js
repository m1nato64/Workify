//controllers/projectController.js
import { createProject,  
  getAllProjects, 
  getProjectsByUserId, 
  getProjectById, 
  deleteProject, 
  toggleBids, 
  updateProject, 
  getFilteredProjects,
  addProjectView, 
  getProjectViewsCount
   } from '../models/projectModel.js';
import { getBidsForProject } from '../models/bidModel.js';

export const createProjectController = async (req, res) => {
  try {
    
    const { title, description, status, client_id, mediaUrl } = req.body;

    if (!title || !description || !status || !client_id) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const media = req.file ? req.file.path : null;
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

export const updateProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, mediaUrl } = req.body;

    if (!title || !description || !status) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    // Если файл загружен через multer, берем путь из req.file, иначе из mediaUrl, либо null
    const media = req.file ? req.file.path : (mediaUrl || null);

    const updatedProject = await updateProject(projectId, title, description, status, media);
    if (!updatedProject) {
      return res.status(404).json({ error: 'Проект не найден' });
    }

    res.json({ message: 'Проект обновлен', updatedProject });
  } catch (err) {
    console.error('Error updating project:', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getFilteredProjectsController = async (req, res) => {
  const { title, status, sortByBids, page = 1, limit = 10 } = req.query;
  try {
    const projects = await getFilteredProjects({
      title,
      status,
      sortByBids,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    res.json(projects);
  } catch (err) {
    console.error('Ошибка в getFilteredProjectsController:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const viewProjectController = async (req, res) => {
  const { id: projectId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Пользователь не авторизован" });
  }

  try {
    const added = await addProjectView(projectId, userId);
    if (!added) {
      return res.status(200).json({ message: "Просмотр уже учтён за последние 24 часа" });
    }
    res.status(200).json({ message: "Просмотр добавлен" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получить количество просмотров
export const getProjectViewsController = async (req, res) => {
  const { id } = req.params;

  try {
    const count = await getProjectViewsCount(id);
    res.status(200).json({ views: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};