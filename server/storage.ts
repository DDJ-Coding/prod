import { 
  users, aircraft, bookings, flightLogs, milestones, messages,
  type User, type InsertUser,
  type Aircraft, type InsertAircraft,
  type Booking, type InsertBooking,
  type FlightLog, type InsertFlightLog,
  type Milestone, type InsertMilestone,
  type Message, type InsertMessage
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getInstructors(): Promise<User[]>;
  getStudents(): Promise<User[]>;
  getStudentsByInstructor(instructorId: number): Promise<User[]>;

  // Aircraft operations
  getAircraft(id: number): Promise<Aircraft | undefined>;
  getAllAircraft(): Promise<Aircraft[]>;
  createAircraft(aircraft: InsertAircraft): Promise<Aircraft>;

  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByStudent(studentId: number): Promise<Booking[]>;
  getBookingsByInstructor(instructorId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;

  // Flight log operations
  getFlightLog(id: number): Promise<FlightLog | undefined>;
  getFlightLogsByStudent(studentId: number): Promise<FlightLog[]>;
  getRecentFlightLogsByStudent(studentId: number, limit: number): Promise<FlightLog[]>;
  createFlightLog(flightLog: InsertFlightLog): Promise<FlightLog>;
  updateFlightLogStatus(id: number, status: string, instructorId?: number): Promise<FlightLog | undefined>;

  // Milestone operations
  getMilestone(id: number): Promise<Milestone | undefined>;
  getMilestonesByStudent(studentId: number): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestoneProgress(id: number, progress: number, status?: string): Promise<Milestone | undefined>;
  completeMilestone(id: number, instructorId: number): Promise<Milestone | undefined>;

  // Dashboard data
  getStudentDashboardData(studentId: number): Promise<{
    totalHours: number;
    soloHours: number;
    crossCountryHours: number;
    upcomingBookings: Booking[];
    milestones: Milestone[];
    recentLogs: FlightLog[];
  }>;
  
  getInstructorDashboardData(instructorId: number): Promise<{
    totalStudents: number;
    pendingBookings: Booking[];
    todayBookings: Booking[];
    pendingLogs: FlightLog[];
  }>;

  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  getMessagesForUser(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(senderId: number, receiverId: number): Promise<void>;
  getMessageContacts(userId: number): Promise<{
    id: number;
    name: string;
    role: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    profileImage?: string;
  }[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private aircraft: Map<number, Aircraft>;
  private bookings: Map<number, Booking>;
  private flightLogs: Map<number, FlightLog>;
  private milestones: Map<number, Milestone>;
  private messages: Map<number, Message>;
  
  private userIdCounter: number;
  private aircraftIdCounter: number;
  private bookingIdCounter: number;
  private flightLogIdCounter: number;
  private milestoneIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.aircraft = new Map();
    this.bookings = new Map();
    this.flightLogs = new Map();
    this.milestones = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.aircraftIdCounter = 1;
    this.bookingIdCounter = 1;
    this.flightLogIdCounter = 1;
    this.milestoneIdCounter = 1;
    this.messageIdCounter = 1;
    
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo users (instructors and students)
    const instructor1 = this.createUser({
      username: "sarahmiller",
      password: "password123",
      email: "sarah.miller@example.com",
      firstName: "Sarah",
      lastName: "Miller",
      role: "instructor"
    });
    
    const instructor2 = this.createUser({
      username: "michaelchen",
      password: "password123",
      email: "michael.chen@example.com",
      firstName: "Michael",
      lastName: "Chen",
      role: "instructor"
    });
    
    const student1 = this.createUser({
      username: "alexjohnson",
      password: "password123",
      email: "alex.j@example.com",
      firstName: "Alex",
      lastName: "Johnson",
      role: "student"
    });
    
    // Create demo aircraft
    const aircraft1 = this.createAircraft({
      tailNumber: "N5434G",
      type: "Cessna 172",
      model: "Skyhawk"
    });
    
    const aircraft2 = this.createAircraft({
      tailNumber: "N7711L",
      type: "Cessna 152",
      model: "Aerobat"
    });
    
    const aircraft3 = this.createAircraft({
      tailNumber: "N2234A",
      type: "Piper PA-28",
      model: "Archer"
    });
    
    // Create milestones for student1
    this.createMilestone({
      studentId: student1.id,
      title: "First Solo Flight",
      description: "Complete first solo flight",
      requiredHours: 20,
      status: "completed",
      completionDate: new Date("2023-03-15"),
      approvedBy: instructor1.id,
      progress: 100
    });
    
    this.createMilestone({
      studentId: student1.id,
      title: "Night Flying Proficiency",
      description: "Complete night flying training",
      requiredHours: 10,
      status: "completed",
      completionDate: new Date("2023-04-02"),
      approvedBy: instructor2.id,
      progress: 100
    });
    
    this.createMilestone({
      studentId: student1.id,
      title: "First Cross-Country Solo",
      description: "Complete first cross-country solo flight",
      requiredHours: 20,
      status: "in_progress",
      progress: 61
    });
    
    this.createMilestone({
      studentId: student1.id,
      title: "Instrument Rating",
      description: "Complete instrument rating training",
      requiredHours: 40,
      status: "not_started",
      progress: 0
    });
    
    // Create flight logs for student1
    this.createFlightLog({
      studentId: student1.id,
      instructorId: instructor1.id,
      aircraftId: aircraft1.id,
      date: new Date("2023-05-10"),
      duration: 2.3,
      departureAirport: "KBOS",
      destinationAirport: "KPVD",
      returnAirport: "KBOS",
      flightType: "dual",
      status: "approved"
    });
    
    this.createFlightLog({
      studentId: student1.id,
      aircraftId: aircraft1.id,
      date: new Date("2023-05-05"),
      duration: 1.5,
      departureAirport: "KBOS",
      destinationAirport: "Local",
      flightType: "solo",
      status: "approved"
    });
    
    this.createFlightLog({
      studentId: student1.id,
      instructorId: instructor2.id,
      aircraftId: aircraft2.id,
      date: new Date("2023-05-02"),
      duration: 3.0,
      departureAirport: "KBOS",
      destinationAirport: "KASH",
      returnAirport: "KBOS",
      flightType: "dual",
      status: "approved"
    });
    
    // Additional flight logs for student1 with various types and durations
    this.createFlightLog({
      studentId: student1.id,
      instructorId: instructor1.id,
      aircraftId: aircraft3.id,
      date: new Date("2023-04-28"),
      duration: 4.5,
      departureAirport: "KBOS",
      destinationAirport: "KBDL",
      returnAirport: "KBOS",
      flightType: "cross-country",
      status: "approved"
    });
    
    this.createFlightLog({
      studentId: student1.id,
      instructorId: instructor1.id,
      aircraftId: aircraft1.id,
      date: new Date("2023-04-20"),
      duration: 2.0,
      departureAirport: "KBOS",
      destinationAirport: "Local",
      flightType: "dual",
      notes: "Night flying practice",
      status: "approved"
    });
    
    this.createFlightLog({
      studentId: student1.id,
      aircraftId: aircraft1.id,
      date: new Date("2023-04-15"),
      duration: 2.2,
      departureAirport: "KBOS",
      destinationAirport: "KBED",
      returnAirport: "KBOS",
      flightType: "solo",
      status: "approved"
    });
    
    this.createFlightLog({
      studentId: student1.id,
      instructorId: instructor2.id,
      aircraftId: aircraft2.id,
      date: new Date("2023-04-10"),
      duration: 3.5,
      departureAirport: "KBOS",
      destinationAirport: "KMHT",
      returnAirport: "KBOS",
      flightType: "cross-country",
      status: "approved"
    });
    
    this.createFlightLog({
      studentId: student1.id,
      instructorId: instructor1.id,
      aircraftId: aircraft1.id,
      date: new Date("2023-04-05"),
      duration: 1.8,
      departureAirport: "KBOS",
      destinationAirport: "Local",
      flightType: "dual",
      notes: "Emergency procedures practice",
      status: "approved"
    });
    
    // Add a pending flight log for review
    this.createFlightLog({
      studentId: student1.id,
      aircraftId: aircraft1.id,
      date: new Date(),
      duration: 1.7,
      departureAirport: "KBOS",
      destinationAirport: "KBED",
      returnAirport: "KBOS",
      flightType: "solo",
      notes: "Pattern work and landings",
      status: "pending"
    });
    
    // Create bookings for student1
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.createBooking({
      studentId: student1.id,
      instructorId: instructor1.id,
      startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
      trainingType: "pattern",
      aircraftId: aircraft1.id,
      status: "confirmed",
      notes: "Traffic Pattern Practice"
    });
    
    // Reset tomorrow for next booking
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    this.createBooking({
      studentId: student1.id,
      instructorId: instructor2.id,
      startTime: new Date(dayAfterTomorrow.setHours(10, 0, 0, 0)),
      endTime: new Date(dayAfterTomorrow.setHours(12, 0, 0, 0)),
      trainingType: "maneuvers",
      aircraftId: aircraft2.id,
      status: "confirmed",
      notes: "Slow Flight and Stall Practice"
    });
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    this.createBooking({
      studentId: student1.id,
      instructorId: instructor1.id,
      startTime: new Date(nextWeek.setHours(9, 0, 0, 0)),
      endTime: new Date(nextWeek.setHours(12, 0, 0, 0)),
      trainingType: "navigation",
      aircraftId: aircraft1.id,
      status: "confirmed",
      notes: "VOR Navigation Practice"
    });
    
    const may25 = new Date();
    may25.setMonth(4); // May (0-indexed)
    may25.setDate(25);
    
    this.createBooking({
      studentId: student1.id,
      instructorId: instructor2.id,
      startTime: new Date(may25.setHours(9, 0, 0, 0)),
      endTime: new Date(may25.setHours(13, 0, 0, 0)),
      trainingType: "cross-country",
      aircraftId: aircraft1.id,
      status: "confirmed",
      notes: "Cross-Country Flight"
    });
    
    const may28 = new Date();
    may28.setMonth(4); // May (0-indexed)
    may28.setDate(28);
    
    this.createBooking({
      studentId: student1.id,
      instructorId: instructor1.id,
      startTime: new Date(may28.setHours(15, 30, 0, 0)),
      endTime: new Date(may28.setHours(17, 30, 0, 0)),
      trainingType: "instrument",
      aircraftId: aircraft1.id,
      status: "confirmed",
      notes: "Instrument Training"
    });
    
    // Add a pending booking request
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(15);
    
    this.createBooking({
      studentId: student1.id,
      instructorId: instructor1.id,
      startTime: new Date(nextMonth.setHours(13, 0, 0, 0)),
      endTime: new Date(nextMonth.setHours(15, 0, 0, 0)),
      trainingType: "checkride-prep",
      aircraftId: aircraft1.id,
      status: "pending",
      notes: "Checkride Preparation"
    });

    // Create demo messages
    this.createMessage({
      senderId: instructor1.id,
      receiverId: student1.id,
      content: "Hi Alex, just confirming our flight tomorrow at 2PM. Please arrive 30 minutes early for preflight.",
      timestamp: new Date(new Date().setHours(new Date().getHours() - 25)),
      isRead: true
    });

    this.createMessage({
      senderId: student1.id,
      receiverId: instructor1.id,
      content: "Thanks for the reminder, Sarah! I'll be there at 1:30PM.",
      timestamp: new Date(new Date().setHours(new Date().getHours() - 24)),
      isRead: true
    });

    this.createMessage({
      senderId: instructor1.id,
      receiverId: student1.id,
      content: "Great! Don't forget to bring your logbook and flight plan. We'll be focusing on pattern work.",
      timestamp: new Date(new Date().setHours(new Date().getHours() - 23)),
      isRead: true
    });

    this.createMessage({
      senderId: instructor2.id,
      receiverId: student1.id,
      content: "Hello Alex, I've reviewed your latest flight log. Good job on the cross-country navigation!",
      timestamp: new Date(new Date().setHours(new Date().getHours() - 10)),
      isRead: false
    });
  }

  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getInstructors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "instructor"
    );
  }

  async getStudents(): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "student"
    );
  }

  async getStudentsByInstructor(instructorId: number): Promise<User[]> {
    // Get unique student IDs from flight logs and bookings with this instructor
    const studentIds = new Set<number>();
    
    Array.from(this.flightLogs.values())
      .filter(log => log.instructorId === instructorId)
      .forEach(log => studentIds.add(log.studentId));
      
    Array.from(this.bookings.values())
      .filter(booking => booking.instructorId === instructorId)
      .forEach(booking => studentIds.add(booking.studentId));
      
    return Array.from(studentIds).map(id => this.users.get(id)!).filter(Boolean);
  }

  // Aircraft Operations
  async getAircraft(id: number): Promise<Aircraft | undefined> {
    return this.aircraft.get(id);
  }

  async getAllAircraft(): Promise<Aircraft[]> {
    return Array.from(this.aircraft.values());
  }

  async createAircraft(insertAircraft: InsertAircraft): Promise<Aircraft> {
    const id = this.aircraftIdCounter++;
    const aircraft: Aircraft = { ...insertAircraft, id };
    this.aircraft.set(id, aircraft);
    return aircraft;
  }

  // Booking Operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByStudent(studentId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.studentId === studentId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async getBookingsByInstructor(instructorId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.instructorId === instructorId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const booking: Booking = { ...insertBooking, id };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Flight Log Operations
  async getFlightLog(id: number): Promise<FlightLog | undefined> {
    return this.flightLogs.get(id);
  }

  async getFlightLogsByStudent(studentId: number): Promise<FlightLog[]> {
    return Array.from(this.flightLogs.values())
      .filter(log => log.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getRecentFlightLogsByStudent(studentId: number, limit: number): Promise<FlightLog[]> {
    return Array.from(this.flightLogs.values())
      .filter(log => log.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createFlightLog(insertFlightLog: InsertFlightLog): Promise<FlightLog> {
    const id = this.flightLogIdCounter++;
    const flightLog: FlightLog = { ...insertFlightLog, id };
    this.flightLogs.set(id, flightLog);
    return flightLog;
  }

  async updateFlightLogStatus(id: number, status: string, instructorId?: number): Promise<FlightLog | undefined> {
    const flightLog = this.flightLogs.get(id);
    if (!flightLog) return undefined;
    
    const updatedFlightLog: FlightLog = { 
      ...flightLog, 
      status,
      instructorId: instructorId || flightLog.instructorId
    };
    
    this.flightLogs.set(id, updatedFlightLog);
    return updatedFlightLog;
  }

  // Milestone Operations
  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }

  async getMilestonesByStudent(studentId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values())
      .filter(milestone => milestone.studentId === studentId);
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const id = this.milestoneIdCounter++;
    const milestone: Milestone = { ...insertMilestone, id };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestoneProgress(id: number, progress: number, status?: string): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    if (!milestone) return undefined;
    
    let currentStatus = milestone.status;
    if (status) {
      currentStatus = status;
    } else if (progress >= 100) {
      currentStatus = 'completed';
    } else if (progress > 0) {
      currentStatus = 'in_progress';
    }
    
    const updatedMilestone: Milestone = { 
      ...milestone, 
      progress,
      status: currentStatus,
      completionDate: currentStatus === 'completed' && !milestone.completionDate ? new Date() : milestone.completionDate
    };
    
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async completeMilestone(id: number, instructorId: number): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    if (!milestone) return undefined;
    
    const updatedMilestone: Milestone = { 
      ...milestone, 
      status: 'completed',
      progress: 100,
      approvedBy: instructorId,
      completionDate: new Date()
    };
    
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  // Dashboard Data Operations
  async getStudentDashboardData(studentId: number): Promise<{
    totalHours: number;
    soloHours: number;
    crossCountryHours: number;
    upcomingBookings: Booking[];
    milestones: Milestone[];
    recentLogs: FlightLog[];
  }> {
    const flightLogs = await this.getFlightLogsByStudent(studentId);
    const totalHours = flightLogs.reduce((sum, log) => sum + log.duration, 0);
    const soloHours = flightLogs
      .filter(log => log.flightType === 'solo')
      .reduce((sum, log) => sum + log.duration, 0);
    const crossCountryHours = flightLogs
      .filter(log => log.flightType === 'cross-country')
      .reduce((sum, log) => sum + log.duration, 0);
    
    const allBookings = await this.getBookingsByStudent(studentId);
    const now = new Date();
    const upcomingBookings = allBookings
      .filter(booking => new Date(booking.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);
    
    const milestones = await this.getMilestonesByStudent(studentId);
    const recentLogs = await this.getRecentFlightLogsByStudent(studentId, 3);
    
    return {
      totalHours,
      soloHours,
      crossCountryHours,
      upcomingBookings,
      milestones,
      recentLogs
    };
  }

  async getInstructorDashboardData(instructorId: number): Promise<{
    totalStudents: number;
    pendingBookings: Booking[];
    todayBookings: Booking[];
    pendingLogs: FlightLog[];
  }> {
    const students = await this.getStudentsByInstructor(instructorId);
    const totalStudents = students.length;
    
    const allBookings = await this.getBookingsByInstructor(instructorId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const pendingBookings = allBookings
      .filter(booking => booking.status === 'pending')
      .slice(0, 5);
    
    const todayBookings = allBookings
      .filter(booking => {
        const bookingDate = new Date(booking.startTime);
        return bookingDate >= today && bookingDate < tomorrow;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    const pendingLogs = Array.from(this.flightLogs.values())
      .filter(log => log.instructorId === instructorId && log.status === 'pending')
      .slice(0, 5);
    
    return {
      totalStudents,
      pendingBookings,
      todayBookings,
      pendingLogs
    };
  }

  // Message Operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === userId1 && message.receiverId === userId2) || 
        (message.senderId === userId2 && message.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getMessagesForUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = { ...insertMessage, id };
    this.messages.set(id, message);
    return message;
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    Array.from(this.messages.values())
      .filter(message => message.senderId === senderId && message.receiverId === receiverId && !message.isRead)
      .forEach(message => {
        const updatedMessage = { ...message, isRead: true };
        this.messages.set(message.id, updatedMessage);
      });
  }

  async getMessageContacts(userId: number): Promise<{
    id: number;
    name: string;
    role: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    profileImage?: string;
  }[]> {
    // Get all unique users that the current user has exchanged messages with
    const contactIds = new Set<number>();
    
    Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId)
      .forEach(message => {
        const contactId = message.senderId === userId ? message.receiverId : message.senderId;
        contactIds.add(contactId);
      });
    
    // Create contact objects with last message and unread count
    const contacts = await Promise.all(
      Array.from(contactIds).map(async (contactId) => {
        const contact = await this.getUser(contactId);
        if (!contact) return null;
        
        const messagesWithContact = await this.getMessagesBetweenUsers(userId, contactId);
        const lastMessage = messagesWithContact.length > 0 
          ? messagesWithContact[messagesWithContact.length - 1] 
          : null;
          
        const unreadCount = messagesWithContact
          .filter(message => message.senderId === contactId && !message.isRead)
          .length;
          
        return {
          id: contactId,
          name: `${contact.firstName} ${contact.lastName}`,
          role: contact.role,
          lastMessage: lastMessage?.content,
          lastMessageTime: lastMessage?.timestamp,
          unreadCount,
          profileImage: contact.profileImage
        };
      })
    );
    
    // Sort contacts by last message time (most recent first)
    return contacts
      .filter(Boolean)
      .sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
  }
}

export const storage = new MemStorage();
