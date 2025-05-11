import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Seeding database...");

    // Create sample users
    const adminPasswordHash = await hashPassword("admin123");
    const userPasswordHash = await hashPassword("user123");
    const workerPasswordHash = await hashPassword("worker123");

    // Check if users already exist
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin")
    });

    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "user1")
    });

    const existingWorker = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "worker1")
    });

    // Create admin user if not exists
    let adminUser;
    if (!existingAdmin) {
      const [newAdmin] = await db.insert(schema.users).values({
        username: "admin",
        email: "admin@steadyclick.com",
        password: adminPasswordHash,
        country: "Bangladesh",
        isAdmin: true,
        balance: "100.00",
        pendingBalance: "0",
        totalTasks: 0,
        isTopWorker: false,
        createdAt: new Date()
      }).returning();
      adminUser = newAdmin;
      console.log("Admin user created");
    } else {
      adminUser = existingAdmin;
      console.log("Admin user already exists");
    }

    // Create regular user if not exists
    let regularUser;
    if (!existingUser) {
      const [newUser] = await db.insert(schema.users).values({
        username: "user1",
        email: "user1@example.com",
        password: userPasswordHash,
        country: "United States",
        isAdmin: false,
        balance: "50.00",
        pendingBalance: "0",
        totalTasks: 0,
        isTopWorker: false,
        createdAt: new Date()
      }).returning();
      regularUser = newUser;
      console.log("Regular user created");
    } else {
      regularUser = existingUser;
      console.log("Regular user already exists");
    }

    // Create worker user if not exists
    let workerUser;
    if (!existingWorker) {
      const [newWorker] = await db.insert(schema.users).values({
        username: "worker1",
        email: "worker1@example.com",
        password: workerPasswordHash,
        country: "India",
        isAdmin: false,
        balance: "25.00",
        pendingBalance: "5.00",
        totalTasks: 15,
        rank: 12,
        isTopWorker: true,
        createdAt: new Date()
      }).returning();
      workerUser = newWorker;
      console.log("Worker user created");
    } else {
      workerUser = existingWorker;
      console.log("Worker user already exists");
    }

    // Check if tasks already exist
    const existingTasks = await db.query.tasks.findMany({
      limit: 1
    });

    // Create sample tasks if none exist
    if (existingTasks.length === 0) {
      // Subscribe tasks
      await db.insert(schema.tasks).values([
        {
          creatorId: adminUser.id,
          title: "Tech Insights",
          description: "Subscribe to my technology channel for latest tech news and reviews",
          type: schema.TaskType.SUBSCRIBE,
          url: "https://youtube.com/channel/tech-insights",
          quantity: 100,
          completedCount: 24,
          pricePerTask: "0.02",
          totalPrice: "5.00",
          status: "active",
          platform: "youtube",
          imageUrl: "https://i.pravatar.cc/100?img=1",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        {
          creatorId: regularUser.id,
          title: "Music World",
          description: "Subscribe to my music channel for latest tracks and remixes",
          type: schema.TaskType.SUBSCRIBE,
          url: "https://youtube.com/channel/music-world",
          quantity: 100,
          completedCount: 65,
          pricePerTask: "0.02",
          totalPrice: "5.00",
          status: "active",
          platform: "youtube",
          imageUrl: "https://i.pravatar.cc/100?img=2",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
          creatorId: regularUser.id,
          title: "Cooking Masters",
          description: "Subscribe to learn amazing cooking recipes and techniques",
          type: schema.TaskType.SUBSCRIBE,
          url: "https://youtube.com/channel/cooking-masters",
          quantity: 100,
          completedCount: 87,
          pricePerTask: "0.02",
          totalPrice: "5.00",
          status: "active",
          platform: "youtube",
          imageUrl: "https://i.pravatar.cc/100?img=3",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        }
      ]);
      console.log("Created subscribe tasks");

      // Like tasks
      await db.insert(schema.tasks).values([
        {
          creatorId: adminUser.id,
          title: "Fashion Trends",
          description: "Like my Facebook page for latest fashion trends and style tips",
          type: schema.TaskType.LIKE,
          url: "https://facebook.com/fashion-trends",
          quantity: 100,
          completedCount: 45,
          pricePerTask: "0.02",
          totalPrice: "5.00",
          status: "active",
          platform: "facebook",
          imageUrl: "https://i.pravatar.cc/100?img=4",
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
        },
        {
          creatorId: regularUser.id,
          title: "Travel Adventures",
          description: "Like and comment on my Instagram travel posts",
          type: schema.TaskType.LIKE,
          url: "https://instagram.com/travel-adventures",
          quantity: 100,
          completedCount: 68,
          pricePerTask: "0.02",
          totalPrice: "5.00",
          status: "active",
          platform: "instagram",
          imageUrl: "https://i.pravatar.cc/100?img=5",
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
        }
      ]);
      console.log("Created like tasks");

      // Watch tasks
      await db.insert(schema.tasks).values([
        {
          creatorId: adminUser.id,
          title: "Tech Review",
          description: "Watch my detailed review of the latest smartphone",
          type: schema.TaskType.WATCH,
          url: "https://youtube.com/watch?v=tech-review",
          quantity: 100,
          completedCount: 32,
          pricePerTask: "0.15",
          totalPrice: "15.00",
          status: "active",
          platform: "youtube",
          imageUrl: "https://i.pravatar.cc/100?img=6",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          creatorId: regularUser.id,
          title: "Cooking Tutorial",
          description: "Watch my cooking tutorial to learn how to make pasta from scratch",
          type: schema.TaskType.WATCH,
          url: "https://youtube.com/watch?v=cooking-tutorial",
          quantity: 100,
          completedCount: 54,
          pricePerTask: "0.15",
          totalPrice: "15.00",
          status: "active",
          platform: "youtube",
          imageUrl: "https://i.pravatar.cc/100?img=7",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      ]);
      console.log("Created watch tasks");

      // Sample transactions for the worker
      await db.insert(schema.transactions).values([
        {
          userId: workerUser.id,
          type: "earning",
          amount: "0.02",
          description: "Earnings from task #1: Tech Insights",
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
        },
        {
          userId: workerUser.id,
          type: "earning",
          amount: "0.02",
          description: "Earnings from task #4: Fashion Trends",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
          userId: workerUser.id,
          type: "earning",
          amount: "0.15",
          description: "Earnings from task #6: Tech Review",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          userId: workerUser.id,
          type: "earning",
          amount: "0.02",
          description: "Earnings from task #2: Music World",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      ]);
      console.log("Created sample transactions");

      // Sample withdrawal request
      await db.insert(schema.withdrawalRequests).values({
        userId: workerUser.id,
        amount: "10.00",
        paymentMethod: schema.PaymentMethod.PAYONEER,
        paymentDetails: { email: "worker1@payoneer.com" },
        status: "pending",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      });
      console.log("Created sample withdrawal request");
    } else {
      console.log("Tasks already exist, skipping task seed");
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
