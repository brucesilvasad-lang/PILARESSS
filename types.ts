
export interface Student {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  notes: string;
  avatarUrl: string;
}

export interface Instructor {
  id: string;
  name:string;
  specialty: string;
  avatarUrl: string;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    password: string;
}

export enum AttendanceStatus {
  PRESENT = 'Presente',
  ABSENT = 'Faltou',
  RESCHEDULED = 'Remarcado',
  PENDING = 'Vago',
  BOOKED = 'Agendado',
}


export interface Enrollment {
  studentId: string | null;
  status: AttendanceStatus;
  price: number;
}

export interface Class {
  id: string; // Will be the hour of the day, e.g., '07:00'
  date: string; // YYYY-MM-DD
  serviceId: string | null;
  capacity: number; // Total slots available
  enrollments: Enrollment[];
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
}

export interface Service {
    id: string;
    name: string;
    price: number;
}

export interface StudentLabel {
    id: string;
    name: string;
}

export type Theme = 'light' | 'dark';

export type ColorTheme = 'nature' | 'ocean' | 'royal' | 'sunset';

export enum ActiveView {
  DASHBOARD = 'DASHBOARD',
  STUDENTS = 'STUDENTS',
  SCHEDULE = 'SCHEDULE',
  INSTRUCTORS = 'INSTRUCTORS',
  EXPENSES = 'EXPENSES',
  ACCOUNTING = 'ACCOUNTING',
  SETTINGS = 'SETTINGS',
}

export enum UserRole {
    ADMIN = 'ADMIN', // Professor/Fisioterapeuta
    STUDENT = 'STUDENT' // Aluno
}

export interface CurrentUser {
    role: UserRole;
    studentId?: string; // Se for aluno, qual é o ID dele
    name: string;
}

export interface AppDataBackup {
    version: string;
    timestamp: string;
    data: {
        students: Student[];
        instructors: Instructor[];
        classes: Class[];
        expenses: Expense[];
        services: Service[];
        studentLabels: StudentLabel[];
        admins: AdminUser[];
    }
}
