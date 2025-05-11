import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneNumber: text("phone_number").unique(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  country: text("country"),
  userCode: text("user_code"), // ইউনিক কোড (যেমন: BD101)
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  pendingBalance: decimal("pending_balance", { precision: 10, scale: 2 }).default("0").notNull(),
  totalTasks: integer("total_tasks").default(0).notNull(),
  rank: integer("rank"),
  isTopWorker: boolean("is_top_worker").default(false).notNull(),
  isOnline: boolean("is_online").default(false).notNull(),
  activeDeviceId: text("active_device_id"), // একটিভ ডিভাইস আইডি
});

// Task types enum
export const TaskType = {
  SUBSCRIBE: "subscribe",
  LIKE: "like",
  WATCH: "watch",
  JOIN: "join",
  SIGNUP: "signup",
} as const;

export const PaymentMethod = {
  PAYONEER: "payoneer",
  WISE: "wise",
  SKRILL: "skrill",
  NETELLER: "neteller",
  WESTERN_UNION: "western_union",
  MONEYGRAM: "moneygram",
  XOOM: "xoom",
  BANK: "bank",
  CRYPTO: "crypto",
} as const;

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  quantity: integer("quantity").notNull(),
  completedCount: integer("completed_count").default(0).notNull(),
  pricePerTask: decimal("price_per_task", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("active").notNull(), // active, completed, cancelled
  platform: text("platform").notNull(), // youtube, facebook, instagram, etc.
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Task submissions table
export const taskSubmissions = pgTable("task_submissions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  workerId: integer("worker_id").references(() => users.id).notNull(),
  proof: text("proof").notNull(), // gmail, screenshot, etc.
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  feedback: text("feedback"),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Withdrawal requests table
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentDetails: json("payment_details").notNull(),
  notes: text("notes"),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // task_completed, payment_received, etc.
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  relatedId: integer("related_id"), // id of the related entity (task, payment, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // earning, withdrawal, refund
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  relatedId: integer("related_id"), // id of the related entity (task, withdrawal, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Referrals table
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredId: integer("referred_id").references(() => users.id).notNull(),
  commissionPaid: boolean("commission_paid").default(false).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

// Payment records table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").default("completed").notNull(), // pending, completed, failed
  transactionId: text("transaction_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ডিভাইস ট্র্যাকিং টেবিল
export const userDevices = pgTable("user_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  deviceId: text("device_id").notNull(),
  deviceName: text("device_name"),
  deviceType: text("device_type"), // mobile, desktop, tablet
  browser: text("browser"),
  operatingSystem: text("operating_system"),
  ipAddress: text("ip_address"),
  lastLogin: timestamp("last_login").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// পাসওয়ার্ড রিসেট টেবিল
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

// ইমেইল ভেরিফিকেশন টেবিল
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

// ফোন ভেরিফিকেশন টেবিল
export const phoneVerificationTokens = pgTable("phone_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  phoneNumber: text("phone_number").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTasks: many(tasks),
  submissions: many(taskSubmissions),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  withdrawalRequests: many(withdrawalRequests),
  notifications: many(notifications),
  transactions: many(transactions),
  referrals: many(referrals, { relationName: "referrer" }),
  referred: many(referrals, { relationName: "referred" }),
  payments: many(payments),
  devices: many(userDevices),
  passwordResetTokens: many(passwordResetTokens),
  emailVerificationTokens: many(emailVerificationTokens),
  phoneVerificationTokens: many(phoneVerificationTokens),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, { fields: [tasks.creatorId], references: [users.id] }),
  submissions: many(taskSubmissions),
  messages: many(messages),
  payments: many(payments),
}));

export const taskSubmissionsRelations = relations(taskSubmissions, ({ one }) => ({
  task: one(tasks, { fields: [taskSubmissions.taskId], references: [tasks.id] }),
  worker: one(users, { fields: [taskSubmissions.workerId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receiver" }),
  task: one(tasks, { fields: [messages.taskId], references: [tasks.id] }),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(users, { fields: [withdrawalRequests.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id], relationName: "referrer" }),
  referred: one(users, { fields: [referrals.referredId], references: [users.id], relationName: "referred" }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  task: one(tasks, { fields: [payments.taskId], references: [tasks.id] }),
}));

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, { fields: [userDevices.userId], references: [users.id] }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, { fields: [emailVerificationTokens.userId], references: [users.id] }),
}));

export const phoneVerificationTokensRelations = relations(phoneVerificationTokens, ({ one }) => ({
  user: one(users, { fields: [phoneVerificationTokens.userId], references: [users.id] }),
}));

// Create Zod schemas for inserts and selects
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email("Please enter a valid email"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
});

export const insertTaskSchema = createInsertSchema(tasks, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  url: (schema) => schema.url("Please enter a valid URL"),
  quantity: (schema) => schema.min(1, "Quantity must be at least 1"),
});

export const insertTaskSubmissionSchema = createInsertSchema(taskSubmissions, {
  proof: (schema) => schema.min(3, "Proof must be at least 3 characters"),
});

export const insertMessageSchema = createInsertSchema(messages, {
  content: (schema) => schema.min(1, "Message cannot be empty"),
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests, {
  amount: (schema) => schema.min(10, "Minimum withdrawal amount is $10"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  deviceId: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const verifyPhoneSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
});

// Device related schemas
export const userDeviceSchema = createInsertSchema(userDevices);

// Define types for front-end use
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskSubmission = typeof taskSubmissions.$inferSelect;
export type InsertTaskSubmission = z.infer<typeof insertTaskSubmissionSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type Notification = typeof notifications.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type UserDevice = typeof userDevices.$inferSelect;
export type InsertUserDevice = z.infer<typeof userDeviceSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type PhoneVerificationToken = typeof phoneVerificationTokens.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailData = z.infer<typeof verifyEmailSchema>;
export type VerifyPhoneData = z.infer<typeof verifyPhoneSchema>;
