// controllers/bidController.js
import { createBid, getBidsForProject, getBidsForFreelancer, updateBidStatus } from '../models/bidModel.js';

export const createBidController = async (req, res) => {
  try {
    const { freelance_id, project_id } = req.body;
    const bid = await createBid(freelance_id, project_id);
    res.status(201).json({ message: 'Отклик отправлен', bid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBidsForProjectController = async (req, res) => {
  try {
    const bids = await getBidsForProject(req.params.project_id); // Здесь мы получаем отклики для проекта
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBidsForFreelancerController = async (req, res) => {
  try {
    const bids = await getBidsForFreelancer(req.params.freelance_id);
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBidStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedBid = await updateBidStatus(req.params.bid_id, status);
    res.json({ message: 'Статус отклика обновлен', updatedBid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
