//server/controllers/reviewController.js
import {
  addReview,
  getReviewsForProject,
  getReviewsForUser,
} from "../models/reviewModel.js";

// Создать отзыв
export const createReviewController = async (req, res) => {
  try {
    const { project_id, author_id, target_user_id, rating, content } = req.body;
    const newReview = await addReview(
      project_id,
      author_id,
      target_user_id,
      rating,
      content
    );
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получить отзывы по проекту
export const getProjectReviewsController = async (req, res) => {
  try {
    const reviews = await getReviewsForProject(req.params.project_id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получить отзывы пользователя
export const getUserReviewsController = async (req, res) => {
  try {
    const reviews = await getReviewsForUser(req.params.user_id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
