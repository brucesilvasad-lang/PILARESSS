// =====================================================
// MODELOS PRINCIPAIS
// =====================================================

export interface Student {
  id: string;
  name: string;
  email: string;
  joinDate: string;    // YYYY-MM-DD (vem string do Supabase)
  notes: string;
  avatarUrl: string;
}

export interface Instructor {
  id: string;
  name: string;
  specialty: string;
  avatarUrl: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

// =====================================================
// ENUMS
// =====================================================

export enum AttendanceStatus {
  PRESENT = 'Presente',
  ABSENT = 'Faltou',
  RESCHEDULED = 'Remarcado',
  PENDING = 'Vago',
  BOOKED = 'Agendado',
}

// =====================================================
// MATRÍCULA (VAGA NA AULA)
// =====================================================

export interface Enrollment {
  studentId: string | null;
  status: AttendanceStatus;
  price: number;
}

// =====================================================
// AULA (CLASSE DA AGENDA)
// =====================================================
// OBS IMPORTANTE:
// Aqui o date fica string, porque vem do Supabase
// Depois no carregamento transformamos em Date no código
// =====================================================

export interface Class {
  id: string;              // Hora: "07:00"
  date: string;            // YYYY-MM-DD (string)
  serviceId: string | null;
  capacity: number;
  enrollments: Enrollment[];
}

// =====================================================
// FINANCEIRO
// =====================================================

export interface Expense {
  id: string;
  date: string;        // YYYY-MM-DD
  description: string;
  amount: number;
}

// =====================================================
// SERVIÇOS (Tipos de aula)
// =====================================================

export interface Service {
  id: string;
  name: string;
  price: number;
}

// =====================================================
// ETIQUETAS DE ALUNOS
// =====================================================

export interface StudentLabel {
  id: string;
  name: string;
}

// =====================================================
// TEMA / ESTILO
// =====================================================

export type Theme = 'light' | 'dark';

export type ColorTheme =
  | 'nature'
  | 'ocean'
  | 'royal'
  | 'sunset';

// =====================================================
// PAINEL / TELAS
// =====================================================

export enum ActiveView {
  DASHBOARD = 'DASHBOARD',
  STUDENTS = 'STUDENTS',
  SCHEDULE = 'SCHEDULE',
  INSTRUCTORS = 'INSTRUCTORS',
  EXPENSES = 'EXPENSES',
  ACCOUNTING = 'ACCOUNTING',
  SETTINGS = 'SETTINGS',
}

// =====================================================
// USUÁRIO LOGADO
// =====================================================

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

export interface CurrentUser {
  role: UserRole;
  studentId?: string;
  name: string;
}

// =====================================================
// BACKUP COMPLETO DO APP
// =====================================================

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
  };
}
