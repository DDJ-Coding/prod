import { pgTable, text, serial, integer, boolean, timestamp, real, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (for both students and instructors)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("student"), // 'student' or 'instructor'
  profileImage: text("profile_image"),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    profileImage: true,
  });

// Aircraft table
export const aircraft = pgTable("aircraft", {
  id: serial("id").primaryKey(),
  tailNumber: text("tail_number").notNull().unique(),
  type: text("type").notNull(), // e.g., 'Cessna 172', 'Cessna 152', 'Piper PA-28'
  model: text("model").notNull(),
});

export const insertAircraftSchema = createInsertSchema(aircraft)
  .pick({
    tailNumber: true,
    type: true,
    model: true,
  });

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  instructorId: integer("instructor_id").references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  trainingType: text("training_type").notNull(), // e.g., 'pattern', 'cross-country', 'instrument', etc.
  aircraftId: integer("aircraft_id").references(() => aircraft.id),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'completed', 'cancelled'
  notes: text("notes"),
});

export const insertBookingSchema = createInsertSchema(bookings)
  .pick({
    studentId: true,
    instructorId: true,
    startTime: true,
    endTime: true,
    trainingType: true,
    aircraftId: true,
    status: true,
    notes: true,
  });

// Flight logs table
export const flightLogs = pgTable("flight_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  instructorId: integer("instructor_id").references(() => users.id),
  aircraftId: integer("aircraft_id").notNull().references(() => aircraft.id),
  date: timestamp("date").notNull(),
  duration: real("duration").notNull(), // in hours
  departureAirport: text("departure_airport").notNull(),
  destinationAirport: text("destination_airport").notNull(),
  returnAirport: text("return_airport"),
  flightType: text("flight_type").notNull(), // 'dual', 'solo', 'cross-country'
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
});

export const insertFlightLogSchema = createInsertSchema(flightLogs)
  .pick({
    studentId: true,
    instructorId: true,
    aircraftId: true,
    date: true,
    duration: true,
    departureAirport: true,
    destinationAirport: true,
    returnAirport: true,
    flightType: true,
    notes: true,
    status: true,
  });

// Milestones table
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  requiredHours: real("required_hours"),
  status: text("status").notNull().default("not_started"), // 'not_started', 'in_progress', 'completed'
  completionDate: timestamp("completion_date"),
  approvedBy: integer("approved_by").references(() => users.id),
  progress: real("progress").default(0), // percentage complete
});

export const insertMilestoneSchema = createInsertSchema(milestones)
  .pick({
    studentId: true,
    title: true,
    description: true,
    requiredHours: true,
    status: true,
    completionDate: true,
    approvedBy: true,
    progress: true,
  });

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

export const insertMessageSchema = createInsertSchema(messages)
  .pick({
    senderId: true,
    receiverId: true,
    content: true,
    timestamp: true,
    isRead: true,
  });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Aircraft = typeof aircraft.$inferSelect;
export type InsertAircraft = z.infer<typeof insertAircraftSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type FlightLog = typeof flightLogs.$inferSelect;
export type InsertFlightLog = z.infer<typeof insertFlightLogSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
