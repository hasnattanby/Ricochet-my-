import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { Task, TaskSubmission, Message, WithdrawalRequest, Payment } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // API routes
  const apiPrefix = "/api";

  // User routes
  app.get(`${apiPrefix}/users/:userId/stats`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const userStats = await storage.getUserStats(userId);
      res.json(userStats);
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ message: "Failed to get user statistics" });
    }
  });

  app.get(`${apiPrefix}/users/:userId/submissions`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const submissions = await storage.getUserSubmissions(userId);
      res.json(submissions);
    } catch (error) {
      console.error("Error getting user submissions:", error);
      res.status(500).json({ message: "Failed to get user submissions" });
    }
  });

  app.get(`${apiPrefix}/users/:userId/transactions`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const type = req.query.type as string | undefined;
      const transactions = await storage.getUserTransactions(userId, type);
      res.json(transactions);
    } catch (error) {
      console.error("Error getting user transactions:", error);
      res.status(500).json({ message: "Failed to get user transactions" });
    }
  });

  app.get(`${apiPrefix}/users/:userId/withdrawals`, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const withdrawals = await storage.getUserWithdrawalRequests(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error getting user withdrawals:", error);
      res.status(500).json({ message: "Failed to get user withdrawals" });
    }
  });

  // Task routes
  app.get(`${apiPrefix}/tasks`, async (req, res) => {
    try {
      const types = req.query.types as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (types && types.includes(',')) {
        // Handle multiple task types (comma-separated)
        const typeArray = types.split(',');
        const allTasks = [];
        let totalCount = 0;
        
        // Fetch tasks for each type
        for (const type of typeArray) {
          const typeData = await storage.getTasks({ type, page, limit });
          allTasks.push(...typeData.tasks);
          totalCount += typeData.total;
        }
        
        // Sort combined results by creation date (newest first)
        allTasks.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Apply pagination to combined results
        const startIndex = (page - 1) * limit;
        const paginatedTasks = allTasks.slice(startIndex, startIndex + limit);
        
        res.json({
          tasks: paginatedTasks,
          total: totalCount
        });
      } else {
        // Handle single task type
        const tasksData = await storage.getTasks({ type: types, page, limit });
        res.json(tasksData);
      }
    } catch (error) {
      console.error("Error getting tasks:", error);
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  app.get(`${apiPrefix}/tasks/:taskId`, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error getting task:", error);
      res.status(500).json({ message: "Failed to get task" });
    }
  });

  app.post(`${apiPrefix}/tasks`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const taskData: Omit<Task, 'id' | 'createdAt'> = {
        ...req.body,
        creatorId: req.user.id,
        completedCount: 0,
        createdAt: new Date()
      };
      
      const newTask = await storage.createTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Task submission routes
  app.post(`${apiPrefix}/task-submissions`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const submissionData: Omit<TaskSubmission, 'id' | 'createdAt' | 'reviewedAt'> = {
        ...req.body,
        workerId: req.user.id,
        status: "pending",
      };
      
      const newSubmission = await storage.createTaskSubmission(submissionData);
      
      // Create notification for task creator
      const task = await storage.getTask(submissionData.taskId);
      if (task) {
        await storage.createNotification({
          userId: task.creatorId,
          type: "submission",
          content: `New submission for task: ${task.title}`,
          relatedId: newSubmission.id,
          createdAt: new Date(),
          isRead: false
        });
      }
      
      res.status(201).json(newSubmission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.patch(`${apiPrefix}/task-submissions/:submissionId`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const submissionId = parseInt(req.params.submissionId);
      const { status, feedback } = req.body;
      
      // Update submission status
      const updatedSubmission = await storage.reviewTaskSubmission(submissionId, status, feedback);
      
      if (!updatedSubmission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      // If approved, update task completedCount and create transaction for worker
      if (status === "approved") {
        const task = await storage.getTask(updatedSubmission.taskId);
        
        if (task) {
          // Update task completedCount
          await storage.updateTask(task.id, {
            completedCount: task.completedCount + 1
          });
          
          // Create earning transaction for worker
          await storage.createTransaction({
            userId: updatedSubmission.workerId,
            type: "earning",
            amount: task.pricePerTask,
            description: `Earnings from task #${task.id}: ${task.title}`,
            relatedId: updatedSubmission.id,
            createdAt: new Date()
          });
          
          // Update worker balance
          const worker = await storage.getUser(updatedSubmission.workerId);
          if (worker) {
            const newBalance = Number(worker.balance) + Number(task.pricePerTask);
            await storage.updateUser(worker.id, { balance: newBalance });
          }
          
          // Create notification for worker
          await storage.createNotification({
            userId: updatedSubmission.workerId,
            type: "approval",
            content: `Your submission for task #${task.id} has been approved! You earned $${Number(task.pricePerTask).toFixed(2)}`,
            relatedId: updatedSubmission.id,
            createdAt: new Date(),
            isRead: false
          });
        }
      } else if (status === "rejected") {
        // Create notification for worker
        await storage.createNotification({
          userId: updatedSubmission.workerId,
          type: "rejection",
          content: `Your submission for task #${updatedSubmission.taskId} has been rejected. ${feedback || ""}`,
          relatedId: updatedSubmission.id,
          createdAt: new Date(),
          isRead: false
        });
      }
      
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // Message routes
  app.post(`${apiPrefix}/messages`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const messageData: Omit<Message, 'id' | 'createdAt'> = {
        ...req.body,
        senderId: req.user.id,
        isRead: false,
        createdAt: new Date()
      };
      
      const newMessage = await storage.sendMessage(messageData);
      
      // Create notification for recipient
      await storage.createNotification({
        userId: messageData.receiverId,
        type: "message",
        content: `New message regarding task #${messageData.taskId}`,
        relatedId: newMessage.id,
        createdAt: new Date(),
        isRead: false
      });
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get(`${apiPrefix}/messages/conversation/:taskId`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const taskId = parseInt(req.params.taskId);
      const conversation = await storage.getConversation(taskId);
      
      // Mark messages as read if the current user is the recipient
      for (const message of conversation) {
        if (message.receiverId === req.user.id && !message.isRead) {
          await storage.markMessageAsRead(message.id);
        }
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error getting conversation:", error);
      res.status(500).json({ message: "Failed to get conversation" });
    }
  });

  app.patch(`${apiPrefix}/messages/:messageId/read`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const messageId = parseInt(req.params.messageId);
      const updatedMessage = await storage.markMessageAsRead(messageId);
      
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(updatedMessage);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.get(`${apiPrefix}/messages/unread/count`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const count = await storage.getUnreadMessageCount(req.user.id);
      res.json(count);
    } catch (error) {
      console.error("Error getting unread message count:", error);
      res.status(500).json({ message: "Failed to get unread message count" });
    }
  });

  // Withdrawal routes
  app.post(`${apiPrefix}/withdrawals`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      const { amount } = req.body;
      
      // Check if user has enough balance
      if (Number(user.balance) < Number(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      const withdrawalData: Omit<WithdrawalRequest, 'id' | 'createdAt' | 'processedAt'> = {
        ...req.body,
        userId: req.user.id,
        status: "pending",
        createdAt: new Date()
      };
      
      const newWithdrawal = await storage.createWithdrawalRequest(withdrawalData);
      
      // Update user balance
      const newBalance = Number(user.balance) - Number(amount);
      await storage.updateUser(user.id, { balance: newBalance });
      
      res.status(201).json(newWithdrawal);
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      res.status(500).json({ message: "Failed to create withdrawal request" });
    }
  });

  // Payment routes
  app.post(`${apiPrefix}/payments`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const paymentData: Omit<Payment, 'id' | 'createdAt'> = {
        ...req.body,
        userId: req.user.id,
        status: "completed",
        createdAt: new Date()
      };
      
      const newPayment = await storage.createPayment(paymentData);
      
      // Create transaction record
      await storage.createTransaction({
        userId: req.user.id,
        type: "payment",
        amount: paymentData.amount,
        description: `Payment for task #${paymentData.taskId}`,
        relatedId: newPayment.id,
        createdAt: new Date()
      });
      
      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Notification routes
  app.get(`${apiPrefix}/notifications`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const notifications = await storage.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  });

  app.patch(`${apiPrefix}/notifications/:notificationId/read`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const notificationId = parseInt(req.params.notificationId);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.get(`${apiPrefix}/notifications/unread/count`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const count = await storage.getUnreadNotificationCount(req.user.id);
      res.json(count);
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      res.status(500).json({ message: "Failed to get unread notification count" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
