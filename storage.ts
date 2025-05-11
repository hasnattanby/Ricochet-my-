import { db } from "@db";
import { 
  users, 
  tasks, 
  taskSubmissions, 
  messages,
  withdrawalRequests,
  notifications,
  transactions,
  referrals,
  payments
} from "@shared/schema";
import { 
  eq, 
  and, 
  desc, 
  sql,
  count,
  sum
} from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User Methods
  getUser: (id: number) => Promise<any>;
  getUserByUsername: (username: string) => Promise<any>;
  getUserByEmail: (email: string) => Promise<any>;
  createUser: (userData: any) => Promise<any>;
  updateUser: (id: number, userData: any) => Promise<any>;
  getUserStats: (userId: number) => Promise<any>;
  
  // Task Methods
  getTasks: (options: { type?: string; page?: number; limit?: number; }) => Promise<any>;
  getTask: (id: number) => Promise<any>;
  createTask: (taskData: any) => Promise<any>;
  updateTask: (id: number, taskData: any) => Promise<any>;
  
  // Task Submission Methods
  createTaskSubmission: (submissionData: any) => Promise<any>;
  getUserSubmissions: (userId: number) => Promise<any>;
  getTaskSubmissions: (taskId: number) => Promise<any>;
  reviewTaskSubmission: (id: number, status: string, feedback?: string) => Promise<any>;
  
  // Message Methods
  sendMessage: (messageData: any) => Promise<any>;
  getConversation: (taskId: number) => Promise<any>;
  markMessageAsRead: (messageId: number) => Promise<any>;
  getUnreadMessageCount: (userId: number) => Promise<any>;
  
  // Withdrawal Methods
  createWithdrawalRequest: (withdrawalData: any) => Promise<any>;
  getUserWithdrawalRequests: (userId: number) => Promise<any>;
  processWithdrawalRequest: (id: number, status: string) => Promise<any>;
  
  // Notification Methods
  createNotification: (notificationData: any) => Promise<any>;
  getUserNotifications: (userId: number) => Promise<any>;
  markNotificationAsRead: (notificationId: number) => Promise<any>;
  getUnreadNotificationCount: (userId: number) => Promise<any>;
  
  // Transaction Methods
  createTransaction: (transactionData: any) => Promise<any>;
  getUserTransactions: (userId: number, type?: string) => Promise<any>;
  
  // Payment Methods
  createPayment: (paymentData: any) => Promise<any>;
  
  // Referral Methods
  createReferral: (referralData: any) => Promise<any>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User Methods
  async getUser(id: number) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }
  
  async getUserByUsername(username: string) {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] || null;
  }
  
  async getUserByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }
  
  async createUser(userData: any) {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: any) {
    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }
  
  async getUserStats(userId: number) {
    const user = await this.getUser(userId);
    
    // Get total earnings
    const earnings = await db.select({
      total: sum(transactions.amount)
    }).from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'earning')
      ));
    
    // Get completed tasks count
    const tasksCompleted = await db.select({
      count: count()
    }).from(taskSubmissions)
      .where(and(
        eq(taskSubmissions.workerId, userId),
        eq(taskSubmissions.status, 'approved')
      ));
    
    // Get pending tasks count
    const pendingTasks = await db.select({
      count: count()
    }).from(taskSubmissions)
      .where(and(
        eq(taskSubmissions.workerId, userId),
        eq(taskSubmissions.status, 'pending')
      ));
    
    return {
      ...user,
      totalEarnings: earnings[0]?.total || 0,
      totalTasksCompleted: tasksCompleted[0]?.count || 0,
      pendingTasks: pendingTasks[0]?.count || 0
    };
  }
  
  // Task Methods
  async getTasks({ type, page = 1, limit = 10 }: { type?: string; page?: number; limit?: number; }) {
    const offset = (page - 1) * limit;
    
    let query = db.select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);
    
    if (type) {
      query = query.where(eq(tasks.type, type));
    }
    
    const tasksData = await query;
    
    // Get total count for pagination
    const countResult = await db.select({
      count: count()
    }).from(tasks).where(type ? eq(tasks.type, type) : sql`TRUE`);
    
    return {
      tasks: tasksData,
      total: countResult[0]?.count || 0
    };
  }
  
  async getTask(id: number) {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0] || null;
  }
  
  async createTask(taskData: any) {
    const result = await db.insert(tasks).values(taskData).returning();
    return result[0];
  }
  
  async updateTask(id: number, taskData: any) {
    const result = await db.update(tasks).set(taskData).where(eq(tasks.id, id)).returning();
    return result[0];
  }
  
  // Task Submission Methods
  async createTaskSubmission(submissionData: any) {
    const result = await db.insert(taskSubmissions).values(submissionData).returning();
    return result[0];
  }
  
  async getUserSubmissions(userId: number) {
    return db.select()
      .from(taskSubmissions)
      .where(eq(taskSubmissions.workerId, userId))
      .orderBy(desc(taskSubmissions.createdAt));
  }
  
  async getTaskSubmissions(taskId: number) {
    return db.select()
      .from(taskSubmissions)
      .where(eq(taskSubmissions.taskId, taskId))
      .orderBy(desc(taskSubmissions.createdAt));
  }
  
  async reviewTaskSubmission(id: number, status: string, feedback?: string) {
    const result = await db.update(taskSubmissions)
      .set({ 
        status, 
        feedback,
        reviewedAt: new Date()
      })
      .where(eq(taskSubmissions.id, id))
      .returning();
    
    return result[0];
  }
  
  // Message Methods
  async sendMessage(messageData: any) {
    const result = await db.insert(messages).values(messageData).returning();
    return result[0];
  }
  
  async getConversation(taskId: number) {
    return db.select()
      .from(messages)
      .where(eq(messages.taskId, taskId))
      .orderBy(messages.createdAt);
  }
  
  async markMessageAsRead(messageId: number) {
    const result = await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId))
      .returning();
    
    return result[0];
  }
  
  async getUnreadMessageCount(userId: number) {
    const result = await db.select({
      count: count()
    }).from(messages)
      .where(and(
        eq(messages.receiverId, userId),
        eq(messages.isRead, false)
      ));
    
    return result[0]?.count || 0;
  }
  
  // Withdrawal Methods
  async createWithdrawalRequest(withdrawalData: any) {
    const result = await db.insert(withdrawalRequests).values(withdrawalData).returning();
    return result[0];
  }
  
  async getUserWithdrawalRequests(userId: number) {
    return db.select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.userId, userId))
      .orderBy(desc(withdrawalRequests.createdAt));
  }
  
  async processWithdrawalRequest(id: number, status: string) {
    const result = await db.update(withdrawalRequests)
      .set({ 
        status,
        processedAt: new Date()
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    
    return result[0];
  }
  
  // Notification Methods
  async createNotification(notificationData: any) {
    const result = await db.insert(notifications).values(notificationData).returning();
    return result[0];
  }
  
  async getUserNotifications(userId: number) {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }
  
  async markNotificationAsRead(notificationId: number) {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))
      .returning();
    
    return result[0];
  }
  
  async getUnreadNotificationCount(userId: number) {
    const result = await db.select({
      count: count()
    }).from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result[0]?.count || 0;
  }
  
  // Transaction Methods
  async createTransaction(transactionData: any) {
    const result = await db.insert(transactions).values(transactionData).returning();
    return result[0];
  }
  
  async getUserTransactions(userId: number, type?: string) {
    let query = db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
    
    if (type) {
      query = query.where(eq(transactions.type, type));
    }
    
    return query;
  }
  
  // Payment Methods
  async createPayment(paymentData: any) {
    const result = await db.insert(payments).values(paymentData).returning();
    return result[0];
  }
  
  // Referral Methods
  async createReferral(referralData: any) {
    const result = await db.insert(referrals).values(referralData).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
