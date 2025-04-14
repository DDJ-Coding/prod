import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import { insertUserSchema, insertBookingSchema, insertFlightLogSchema, insertMilestoneSchema, insertMessageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Session configuration
declare module "express-session" {
  interface SessionData {
    userId: number;
    role: string;
  }
}

// Authentication middleware
const authenticateUser = (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  next();
};

// Role-based authorization middleware
const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    if (!req.session.userId || !req.session.role || !roles.includes(req.session.role)) {
      return res.status(403).json({ message: "Forbidden. Insufficient permissions." });
    }
    next();
  };
};

// Helper function to validate request body against schema
function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: Function) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(400).json({ message: "Invalid request body" });
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "aviation-training-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // ===================== AUTH ROUTES =====================
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Set user session
    req.session.userId = user.id;
    req.session.role = user.role;

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage
    });
  });

  app.post("/api/auth/register", validateBody(insertUserSchema), async (req, res) => {
    const { username, email } = req.body;

    // Check if username or email already exists
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    try {
      const user = await storage.createUser(req.body);
      
      // Set user session
      req.session.userId = user.id;
      req.session.role = user.role;

      return res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImage: user.profileImage
      });
    } catch (error) {
      return res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", authenticateUser, async (req, res) => {
    const userId = req.session.userId;
    const user = await storage.getUser(userId!);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage
    });
  });

  // ===================== USER ROUTES =====================
  app.get("/api/users/instructors", authenticateUser, async (req, res) => {
    const instructors = await storage.getInstructors();
    return res.status(200).json(instructors.map(instructor => ({
      id: instructor.id,
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      email: instructor.email,
      profileImage: instructor.profileImage
    })));
  });

  // ===================== AIRCRAFT ROUTES =====================
  app.get("/api/aircraft", authenticateUser, async (req, res) => {
    const aircraft = await storage.getAllAircraft();
    return res.status(200).json(aircraft);
  });

  // ===================== BOOKING ROUTES =====================
  app.get("/api/bookings/student", authenticateUser, authorizeRole(["student"]), async (req, res) => {
    const userId = req.session.userId!;
    const bookings = await storage.getBookingsByStudent(userId);
    return res.status(200).json(bookings);
  });

  app.get("/api/bookings/instructor", authenticateUser, authorizeRole(["instructor"]), async (req, res) => {
    const userId = req.session.userId!;
    const bookings = await storage.getBookingsByInstructor(userId);
    return res.status(200).json(bookings);
  });

  app.post("/api/bookings", authenticateUser, validateBody(insertBookingSchema), async (req, res) => {
    try {
      const booking = await storage.createBooking(req.body);
      return res.status(201).json(booking);
    } catch (error) {
      return res.status(500).json({ message: "Error creating booking" });
    }
  });

  app.patch("/api/bookings/:id/status", authenticateUser, authorizeRole(["instructor"]), async (req, res) => {
    const bookingId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updatedBooking = await storage.updateBookingStatus(bookingId, status);
    
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    return res.status(200).json(updatedBooking);
  });

  // ===================== FLIGHT LOG ROUTES =====================
  app.get("/api/flightlogs", authenticateUser, authorizeRole(["student"]), async (req, res) => {
    const userId = req.session.userId!;
    const flightLogs = await storage.getFlightLogsByStudent(userId);
    return res.status(200).json(flightLogs);
  });

  app.post("/api/flightlogs", authenticateUser, validateBody(insertFlightLogSchema), async (req, res) => {
    try {
      const flightLog = await storage.createFlightLog(req.body);
      return res.status(201).json(flightLog);
    } catch (error) {
      return res.status(500).json({ message: "Error creating flight log" });
    }
  });

  app.patch("/api/flightlogs/:id/status", authenticateUser, authorizeRole(["instructor"]), async (req, res) => {
    const flightLogId = parseInt(req.params.id);
    const { status } = req.body;
    const instructorId = req.session.userId!;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updatedFlightLog = await storage.updateFlightLogStatus(flightLogId, status, instructorId);
    
    if (!updatedFlightLog) {
      return res.status(404).json({ message: "Flight log not found" });
    }
    
    return res.status(200).json(updatedFlightLog);
  });

  // ===================== MILESTONE ROUTES =====================
  app.get("/api/milestones", authenticateUser, authorizeRole(["student"]), async (req, res) => {
    const userId = req.session.userId!;
    const milestones = await storage.getMilestonesByStudent(userId);
    return res.status(200).json(milestones);
  });

  app.post("/api/milestones", authenticateUser, authorizeRole(["instructor"]), validateBody(insertMilestoneSchema), async (req, res) => {
    try {
      const milestone = await storage.createMilestone(req.body);
      return res.status(201).json(milestone);
    } catch (error) {
      return res.status(500).json({ message: "Error creating milestone" });
    }
  });

  app.patch("/api/milestones/:id/progress", authenticateUser, async (req, res) => {
    const milestoneId = parseInt(req.params.id);
    const { progress, status } = req.body;
    
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Invalid progress value" });
    }
    
    const updatedMilestone = await storage.updateMilestoneProgress(milestoneId, progress, status);
    
    if (!updatedMilestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }
    
    return res.status(200).json(updatedMilestone);
  });

  app.patch("/api/milestones/:id/complete", authenticateUser, authorizeRole(["instructor"]), async (req, res) => {
    const milestoneId = parseInt(req.params.id);
    const instructorId = req.session.userId!;
    
    const completedMilestone = await storage.completeMilestone(milestoneId, instructorId);
    
    if (!completedMilestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }
    
    return res.status(200).json(completedMilestone);
  });

  // ===================== DASHBOARD ROUTES =====================
  app.get("/api/dashboard/student", authenticateUser, authorizeRole(["student"]), async (req, res) => {
    const userId = req.session.userId!;
    const dashboardData = await storage.getStudentDashboardData(userId);
    return res.status(200).json(dashboardData);
  });

  app.get("/api/dashboard/instructor", authenticateUser, authorizeRole(["instructor"]), async (req, res) => {
    const userId = req.session.userId!;
    const dashboardData = await storage.getInstructorDashboardData(userId);
    return res.status(200).json(dashboardData);
  });

  // ===================== STUDENT MANAGEMENT (INSTRUCTOR) ROUTES =====================
  app.get("/api/instructor/students", authenticateUser, authorizeRole(["instructor"]), async (req, res) => {
    const instructorId = req.session.userId!;
    const students = await storage.getStudentsByInstructor(instructorId);
    return res.status(200).json(students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      profileImage: student.profileImage
    })));
  });

  // ===================== MESSAGING ROUTES =====================
  app.get("/api/messages/contacts", authenticateUser, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const contacts = await storage.getMessageContacts(userId);
      return res.status(200).json(contacts);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching contacts" });
    }
  });

  app.get("/api/messages/:contactId", authenticateUser, async (req, res) => {
    const userId = req.session.userId!;
    const contactId = parseInt(req.params.contactId);
    
    try {
      const messages = await storage.getMessagesBetweenUsers(userId, contactId);
      
      // Mark messages from contact as read
      await storage.markMessagesAsRead(contactId, userId);
      
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.post("/api/messages", authenticateUser, async (req, res) => {
    const senderId = req.session.userId!;
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver ID and content are required" });
    }
    
    try {
      const message = await storage.createMessage({
        senderId,
        receiverId,
        content,
        timestamp: new Date(),
        isRead: false
      });
      
      return res.status(201).json(message);
    } catch (error) {
      return res.status(500).json({ message: "Error sending message" });
    }
  });

  app.patch("/api/messages/read/:senderId", authenticateUser, async (req, res) => {
    const receiverId = req.session.userId!;
    const senderId = parseInt(req.params.senderId);
    
    try {
      await storage.markMessagesAsRead(senderId, receiverId);
      return res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
      return res.status(500).json({ message: "Error marking messages as read" });
    }
  });

  return httpServer;
}
