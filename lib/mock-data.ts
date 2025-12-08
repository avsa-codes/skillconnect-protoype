// Mock data for the InstaTask SkillConnect MVP

export interface Task {
  id: string
  title: string
  description: string
  fullBrief: string
  organizationId: string
  organizationName: string
  skills: string[]
  duration: string
  weeklyHours: number
  startDate: string
  location: "remote" | "onsite"
  city?: string
  salary: string
  positions: number
  positionsFilled: number
  status: "pending" | "active" | "completed" | "cancelled"
  confidential: boolean
  payrollTerms: "weekly" | "bi-weekly" | "end-of-task"
  createdAt: string
}

export interface Offer {
  id: string
  taskId: string
  taskTitle: string
  studentId: string
  studentName: string
  organizationId: string
  organizationName: string
  salary: string
  startDate: string
  status: "sent" | "accepted" | "declined" | "expired"
  sentAt: string
  respondedAt?: string
}

export interface StudentProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  college?: string
  city?: string
  skills: string[]
  availability: "<10" | "10-20" | "20+"
  portfolioUrl?: string
  bio?: string
  skillConnectId: string
  rating: number
  tasksCompleted: number
  walletBalance: number
  profileComplete: boolean
}

export interface OrganizationProfile {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone?: string
  companySize: string
  industry: string
  city?: string
  description?: string
  logoUrl?: string
  tasksPosted: number
  activeStudents: number
}

export interface Invoice {
  id: string
  organizationId: string
  taskId: string
  taskTitle: string
  amount: number
  status: "pending" | "paid" | "overdue"
  dueDate: string
  paidAt?: string
  createdAt: string
}

export interface Transaction {
  id: string
  studentId: string
  type: "earning" | "withdrawal" | "fee"
  amount: number
  description: string
  status: "completed" | "pending" | "failed"
  createdAt: string
}

export interface AuditLog {
  id: string
  actor: string
  actorRole: string
  action: string
  target: string
  notes?: string
  timestamp: string
}

export interface SupportTicket {
  id: string
  userId: string
  userName: string
  userRole: string
  subject: string
  status: "open" | "pending" | "resolved"
  lastActivity: string
  messages: {
    id: string
    sender: "user" | "admin"
    message: string
    timestamp: string
  }[]
}

export interface ReplacementRequest {
  id: string
  taskId: string
  taskTitle: string
  originalStudentId: string
  originalStudentName: string
  reason: string
  status: "pending" | "replacement_sent" | "completed"
  deadline: string
  createdAt: string
}

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Social Media Content Creation",
    description: "Create engaging social media content for our brand.",
    fullBrief:
      "We need a creative student to help us create engaging social media content across Instagram, Twitter, and LinkedIn. Tasks include creating graphics, writing captions, and scheduling posts.",
    organizationId: "org-1",
    organizationName: "TechStart India",
    skills: ["Social Media", "Content Writing", "Canva"],
    duration: "4 weeks",
    weeklyHours: 15,
    startDate: "2025-12-01",
    location: "remote",
    salary: "₹8,000",
    positions: 2,
    positionsFilled: 1,
    status: "active",
    confidential: false,
    payrollTerms: "weekly",
    createdAt: "2025-11-15",
  },
  {
    id: "task-2",
    title: "React Frontend Development",
    description: "Build responsive UI components for our web application.",
    fullBrief:
      "Looking for a React developer to help build and maintain UI components for our customer-facing web application. Experience with TypeScript and Tailwind CSS is a plus.",
    organizationId: "org-2",
    organizationName: "WebSolutions Co",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    duration: "8 weeks",
    weeklyHours: 20,
    startDate: "2025-12-15",
    location: "remote",
    salary: "₹15,000",
    positions: 1,
    positionsFilled: 0,
    status: "pending",
    confidential: false,
    payrollTerms: "bi-weekly",
    createdAt: "2025-11-20",
  },
  {
    id: "task-3",
    title: "Data Entry & Research",
    description: "Help organize and research market data.",
    fullBrief:
      "We need assistance with data entry, organizing spreadsheets, and conducting market research. Attention to detail and proficiency in Excel/Google Sheets required.",
    organizationId: "org-1",
    organizationName: "TechStart India",
    skills: ["Excel", "Research", "Data Entry"],
    duration: "2 weeks",
    weeklyHours: 10,
    startDate: "2025-12-05",
    location: "onsite",
    city: "Mumbai",
    salary: "₹5,000",
    positions: 3,
    positionsFilled: 2,
    status: "active",
    confidential: false,
    payrollTerms: "end-of-task",
    createdAt: "2025-11-18",
  },
]

// Mock Offers
export const mockOffers: Offer[] = [
  {
    id: "offer-1",
    taskId: "task-1",
    taskTitle: "Social Media Content Creation",
    studentId: "student-1",
    studentName: "Alex Student",
    organizationId: "org-1",
    organizationName: "TechStart India",
    salary: "₹8,000",
    startDate: "2025-12-01",
    status: "sent",
    sentAt: "2025-11-25",
  },
  {
    id: "offer-2",
    taskId: "task-2",
    taskTitle: "React Frontend Development",
    studentId: "student-1",
    studentName: "Alex Student",
    organizationId: "org-2",
    organizationName: "WebSolutions Co",
    salary: "₹15,000",
    startDate: "2025-12-15",
    status: "sent",
    sentAt: "2025-11-26",
  },
]

// Mock Student Profiles
export const mockStudents: StudentProfile[] = [
  {
    id: "student-1",
    fullName: "Alex Student",
    email: "student@demo.com",
    phone: "+91 98765 43210",
    college: "IIT Delhi",
    city: "Delhi",
    skills: ["React", "Social Media", "Content Writing"],
    availability: "10-20",
    portfolioUrl: "https://portfolio.example.com",
    bio: "Final year CS student passionate about web development and digital marketing.",
    skillConnectId: "SC-10001",
    rating: 4.8,
    tasksCompleted: 5,
    walletBalance: 12500,
    profileComplete: true,
  },
  {
    id: "student-2",
    fullName: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 98765 43211",
    college: "BITS Pilani",
    city: "Hyderabad",
    skills: ["Python", "Data Analysis", "Excel"],
    availability: "20+",
    bio: "Data science enthusiast with experience in research projects.",
    skillConnectId: "SC-10002",
    rating: 4.5,
    tasksCompleted: 3,
    walletBalance: 8000,
    profileComplete: true,
  },
  {
    id: "student-3",
    fullName: "Rahul Kumar",
    email: "rahul@example.com",
    college: "NIT Trichy",
    city: "Chennai",
    skills: ["JavaScript", "Node.js", "MongoDB"],
    availability: "<10",
    skillConnectId: "SC-10003",
    rating: 4.2,
    tasksCompleted: 2,
    walletBalance: 5000,
    profileComplete: false,
  },
]

// Mock Organizations
export const mockOrganizations: OrganizationProfile[] = [
  {
    id: "org-1",
    companyName: "TechStart India",
    contactPerson: "Jane Organization",
    email: "org@demo.com",
    phone: "+91 98765 43212",
    companySize: "11-50",
    industry: "Technology",
    city: "Bangalore",
    description: "A fast-growing startup focused on innovative tech solutions.",
    tasksPosted: 5,
    activeStudents: 3,
  },
  {
    id: "org-2",
    companyName: "WebSolutions Co",
    contactPerson: "Mark Director",
    email: "mark@websolutions.com",
    phone: "+91 98765 43213",
    companySize: "51-200",
    industry: "IT Services",
    city: "Mumbai",
    description: "Leading provider of web development and digital solutions.",
    tasksPosted: 8,
    activeStudents: 5,
  },
]

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: "inv-1",
    organizationId: "org-1",
    taskId: "task-1",
    taskTitle: "Social Media Content Creation",
    amount: 8000,
    status: "pending",
    dueDate: "2025-12-15",
    createdAt: "2025-11-25",
  },
  {
    id: "inv-2",
    organizationId: "org-1",
    taskId: "task-3",
    taskTitle: "Data Entry & Research",
    amount: 15000,
    status: "paid",
    dueDate: "2025-11-20",
    paidAt: "2025-11-18",
    createdAt: "2025-11-10",
  },
  {
    id: "inv-3",
    organizationId: "org-2",
    taskId: "task-2",
    taskTitle: "React Frontend Development",
    amount: 30000,
    status: "overdue",
    dueDate: "2025-11-25",
    createdAt: "2025-11-05",
  },
]

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: "txn-1",
    studentId: "student-1",
    type: "earning",
    amount: 8000,
    description: "Payment for Social Media Content Creation",
    status: "completed",
    createdAt: "2025-11-20",
  },
  {
    id: "txn-2",
    studentId: "student-1",
    type: "fee",
    amount: -800,
    description: "Platform fee (10%)",
    status: "completed",
    createdAt: "2025-11-20",
  },
  {
    id: "txn-3",
    studentId: "student-1",
    type: "withdrawal",
    amount: -5000,
    description: "Withdrawal to bank account",
    status: "completed",
    createdAt: "2025-11-22",
  },
]

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    actor: "Admin User",
    actorRole: "admin",
    action: "Created task",
    target: "task-1",
    notes: "Social Media Content Creation task created",
    timestamp: "2025-11-15T10:30:00",
  },
  {
    id: "log-2",
    actor: "Admin User",
    actorRole: "admin",
    action: "Sent offer",
    target: "offer-1",
    notes: "Offer sent to Alex Student",
    timestamp: "2025-11-25T14:00:00",
  },
  {
    id: "log-3",
    actor: "TechStart India",
    actorRole: "organization_user",
    action: "Updated profile",
    target: "org-1",
    timestamp: "2025-11-20T09:15:00",
  },
]

// Mock Support Tickets
export const mockSupportTickets: SupportTicket[] = [
  {
    id: "ticket-1",
    userId: "student-1",
    userName: "Alex Student",
    userRole: "student",
    subject: "Payment not received",
    status: "open",
    lastActivity: "2025-11-28T10:00:00",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        message: "Hi, I completed a task 5 days ago but haven't received my payment yet. Can you please help?",
        timestamp: "2025-11-28T10:00:00",
      },
    ],
  },
  {
    id: "ticket-2",
    userId: "org-1",
    userName: "TechStart India",
    userRole: "organization_user",
    subject: "Need to extend task deadline",
    status: "pending",
    lastActivity: "2025-11-27T15:30:00",
    messages: [
      {
        id: "msg-2",
        sender: "user",
        message: "We need to extend the deadline for Task #task-1 by 2 weeks. Is this possible?",
        timestamp: "2025-11-27T14:00:00",
      },
      {
        id: "msg-3",
        sender: "admin",
        message: "Hi! Yes, we can extend the deadline. Let me process this for you.",
        timestamp: "2025-11-27T15:30:00",
      },
    ],
  },
]

// Mock Replacement Requests
export const mockReplacements: ReplacementRequest[] = [
  {
    id: "rep-1",
    taskId: "task-3",
    taskTitle: "Data Entry & Research",
    originalStudentId: "student-3",
    originalStudentName: "Rahul Kumar",
    reason: "Student became unavailable due to exams",
    status: "pending",
    deadline: "2025-12-01T00:00:00",
    createdAt: "2025-11-28T09:00:00",
  },
]
