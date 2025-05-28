import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getAdminLogs, 
  createAdminLog,
  getUsersCount,
  getUsersCreatedPerDay,
  getProjectsCount,
  getProjectsCreatedPerDay,
  getBidsCount,
  getBidsPerDay,
  getMessagesCount,
  getMessagesPerDay,
} from '../models/adminModel.js';

// --- USERS ---

export const getUsersController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const users = await getUsers(limit, offset);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserByIdController = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUserController = async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserController = async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    if (!updatedUser) return res.status(404).json({ error: 'Пользователь не найден или нет данных для обновления' });

    // Логируем действие
    const admin_id = req.user?.id || null;
    const ip_address = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (admin_id) {
      await createAdminLog({
        admin_id,
        action: `Обновлен пользователь с id=${req.params.id}`,
        ip_address
      });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    await deleteUser(req.params.id);

    const admin_id = req.user?.id || null;
    const ip_address = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (admin_id) {
      await createAdminLog({
        admin_id,
        action: `Удалён пользователь с id=${req.params.id}`,
        ip_address
      });
    }

    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- PROJECTS ---

export const getProjectsController = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.client_id) filter.client_id = parseInt(req.query.client_id);
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const projects = await getProjects(filter, limit, offset);
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

export const createProjectController = async (req, res) => {
  try {
    const project = await createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProjectController = async (req, res) => {
  try {
    const updatedProject = await updateProject(req.params.id, req.body);
    if (!updatedProject) return res.status(404).json({ error: 'Проект не найден или нет данных для обновления' });

    const admin_id = req.user?.id || null;
    const ip_address = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (admin_id) {
      await createAdminLog({
        admin_id,
        action: `Обновлен проект с id=${req.params.id}`,
        ip_address
      });
    }

    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProjectController = async (req, res) => {
  try {
    await deleteProject(req.params.id);

    const admin_id = req.user?.id || null;
    const ip_address = req.ip || req.headers["x-forwarded-for"] || "unknown";
    if (admin_id) {
      await createAdminLog({
        admin_id,
        action: `Удалён проект с id=${req.params.id}`,
        ip_address
      });
    }

    res.json({ message: 'Проект удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminLogsController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const logs = await getAdminLogs(limit, offset);
    res.json(logs);
  } catch (error) {
    console.error("Ошибка при получении логов админов:", error);
    res.status(500).json({ error: "Не удалось получить логи" });
  }
};

export const createAdminLogController = async (req, res) => {
  try {
    const { admin_id, action } = req.body;
    const ip_address = req.ip || req.headers["x-forwarded-for"] || "unknown";

    if (admin_id == null || !action) {
      return res.status(400).json({ error: "admin_id и action обязательны" });
    }

    // Проверяем, существует ли пользователь и админ ли он
    const user = await getUserById(admin_id);
    if (!user || user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: "Недостаточно прав или пользователь не найден" });
    }

    const newLog = await createAdminLog({ admin_id, action, ip_address });
    res.status(201).json(newLog);
  } catch (error) {
    console.error("Ошибка при создании лога админа:", error);
    res.status(500).json({ error: "Не удалось создать лог" });
  }
};

export const getStatisticsController = async (req, res) => {
  try {
    const [
      usersCount,
      usersPerDay,
      projectsCount,
      projectsPerDay,
      bidsCount,
      bidsPerDay,
      messagesCount,
      messagesPerDay,
    ] = await Promise.all([
      getUsersCount(),
      getUsersCreatedPerDay(),
      getProjectsCount(),
      getProjectsCreatedPerDay(),
      getBidsCount(),
      getBidsPerDay(),
      getMessagesCount(),
      getMessagesPerDay(),
    ]);

    res.json({
      users: {
        total: usersCount,
        perDay: usersPerDay,
      },
      projects: {
        total: projectsCount,
        perDay: projectsPerDay,
      },
      bids: {
        total: bidsCount,
        perDay: bidsPerDay,
      },
      messages: {
        total: messagesCount,
        perDay: messagesPerDay,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};