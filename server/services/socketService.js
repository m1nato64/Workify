import { Server } from "socket.io";
import { sendMessage } from "../models/messageModel.js";
import { createNotification } from "../models/notificationModel.js";
import { createBid, updateBidStatus } from "../models/bidModel.js";
import { getProjectById } from "../models/projectModel.js";

const connectedUsers = new Map();
let ioInstance;

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    socket.on("register", (userId) => {
      connectedUsers.set(userId, socket.id);
    });

    socket.on("send_message", async ({ sender_id, receiver_id, content }) => {
      try {
        const message = await sendMessage(sender_id, receiver_id, content);

        const notification = await createNotification(
          receiver_id,
          "new_message",
          {
            from: sender_id,
            preview: content.slice(0, 100),
          }
        );

        const receiverSocketId = connectedUsers.get(receiver_id);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
          io.to(receiverSocketId).emit("notification", notification);
        }

        socket.emit("message_sent", message);
      } catch (err) {
        console.error("Ошибка при отправке сообщения:", err);
      }
    });

    socket.on("update_bid_status", async ({ bid_id, status }) => {
      try {
        const updatedBid = await updateBidStatus(bid_id, status);
        const project = await getProjectById(updatedBid.project_id);

        const message =
          status === "accepted"
            ? `Ваш отклик на проект "${project.title}" был принят`
            : `Ваш отклик на проект "${project.title}" был отклонён`;

        const notification = await createNotification(
          updatedBid.freelance_id,
          "bid_status_update",
          {
            bid_id,
            status,
            message,
          }
        );

        const freelancerSocketId = connectedUsers.get(updatedBid.freelance_id);
        if (freelancerSocketId) {
          io.to(freelancerSocketId).emit("notification", notification);
        }

        socket.emit("bid_status_updated", { bid_id: bid_id, status });
      } catch (err) {
        console.error(
          "Ошибка при обновлении статуса отклика через сокет:",
          err
        );
        socket.emit("error", { message: "Не удалось обновить статус отклика" });
      }
    });

    socket.on("create_bid", async ({ freelance_id, project_id }) => {
      try {
        const project = await getProjectById(project_id);
        const ownerId = project.client_id;

        const notification = await createNotification(ownerId, "new_bid", {
          from: freelance_id,
          projectId: project_id,
          projectTitle: project.title,
          message: `Новый отклик на проект "${project.title}"`,
        });

        const ownerSocketId = connectedUsers.get(ownerId);
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("new_bid", {
            freelance_id,
            project_id,
          });
          io.to(ownerSocketId).emit("notification", notification);
        }

        socket.emit("bid_created", { freelance_id, project_id });
      } catch (err) {
        console.error("Ошибка при создании отклика (только уведомление):", err);
        socket.emit("error", {
          message: "Не удалось отправить уведомление об отклике",
        });
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });

  return io;
}

export function sendNotification(userId, notification) {
  if (!ioInstance) {
    console.warn("Socket.io не инициализирован");
    return;
  }
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    ioInstance.to(socketId).emit("notification", notification);
  }
}
