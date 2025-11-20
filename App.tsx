
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Student, Instructor, Class, ActiveView, Expense, AttendanceStatus, Service, StudentLabel, Theme, ColorTheme, CurrentUser, UserRole, AdminUser, Enrollment, AppDataBackup } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import Schedule from './components/Schedule';
import InstructorManagement from './components/InstructorManagement';
import Expenses from './components/Expenses';
import Accounting from './components/Accounting';
import Settings from './components/Settings';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import OnboardingGuide from './components/OnboardingGuide';
import { Menu, Loader2 } from 'lucide-react';
import { dataService } from './services/dataService';
import { isCloudEnabled } from './lib/supabaseClient';

// Color Palettes Definition
const colorPalettes: Record<ColorTheme, { primary: string; secondary: string; light: string; accent: string; bg: string }> = {
    nature: { primary: '#4A5C58', secondary: '#8AA39B', light: '#D4E0DC', accent: '#C2958F', bg: '#F7F9F8' },
    ocean: { primary: '#0f766e', secondary: '#2dd4bf', light: '#ccfbf1', accent: '#f59e0b', bg: '#f0fdfa' },
    royal: { primary: '#1e40af', secondary: '#60a5fa', light: '#dbeafe', accent: '#f59e0b', bg: '#eff6ff' },
    sunset: { primary: '#c2410c', secondary: '#fb923c', light: '#ffedd5', accent: '#0ea5e9', bg: '#fff7ed' },
};

// Initial Data (Fallbacks)
const initialStudents: Student[] = [
  { id: 's1', name: 'Alice Johnson', email: 'alice@email.com', joinDate: '2023-01-15', notes: 'Dor lombar, quer melhorar a força do core.', avatarUrl: 'https://picsum.photos/seed/alice/200' },
];
const initialAdmins: AdminUser[] = [
    { id: 'adm1', name: 'Administrador', email: 'admin@pilaris.com', password: 'admin' }
];
const initialInstructors: Instructor[] = [];
const initialExpenses: Expense[] = [];
const initialServices: Service[] = [
    { id: 'serv1', name: 'Pilates', price: 25 },
    { id: 'serv2', name: 'Fisioterapia', price: 50 },
];
const initialStudentLabels: StudentLabel[] = [];


const App: React.FC = () => {
    // Loading State
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [activeView, setActiveView] = useState<ActiveView>(ActiveView.DASHBOARD);
    
    // Data States
    const [students, setStudents] = useState<Student[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [studentLabels, setStudentLabels] = useState<StudentLabel[]>([]);
    
    // UI States
    const [theme, setTheme] = useState<Theme>('light');
    const [colorTheme, setColorTheme] = useState<ColorTheme>('nature');
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [showGuide, setShowGuide] = useState(false);

    // --- LOAD DATA EFFECT ---
    useEffect(() => {
        const loadAll = async () => {
            setIsLoadingData(true);
            
            // Load Theme prefs locally (sync)
            const savedTheme = window.localStorage.getItem('pilates_theme') as Theme || 'light';
            let savedColorRaw = window.localStorage.getItem('pilates_color_theme') || 'nature';
            if (savedColorRaw === 'berry') savedColorRaw = 'royal'; // Legacy support

            setTheme(savedTheme);
            setColorTheme(savedColorRaw as ColorTheme);

            // Load Data (Async DB or Local)
            const [s, a, i, c, e, serv, l] = await Promise.all([
                dataService.getStudents(initialStudents),
                dataService.getAdmins(initialAdmins),
                dataService.getInstructors(initialInstructors),
                dataService.getClasses([]),
                dataService.getExpenses(initialExpenses),
                dataService.getServices(initialServices),
                dataService.getLabels(initialStudentLabels)
            ]);

            setStudents(s);
            setAdmins(a);
            setInstructors(i);
            setClasses(c);
            setExpenses(e);
            setServices(serv);
            setStudentLabels(l);

            setIsLoadingData(false);
        };
        loadAll();
    }, []);

    // --- SAVE DATA EFFECTS ---
    useEffect(() => { if(!isLoadingData) dataService.saveStudents(students); }, [students, isLoadingData]);
    useEffect(() => { if(!isLoadingData) dataService.saveAdmins(admins); }, [admins, isLoadingData]);
    useEffect(() => { if(!isLoadingData) dataService.saveInstructors(instructors); }, [instructors, isLoadingData]);
    useEffect(() => { if(!isLoadingData) dataService.saveClasses(classes); }, [classes, isLoadingData]);
    useEffect(() => { if(!isLoadingData) dataService.saveExpenses(expenses); }, [expenses, isLoadingData]);
    useEffect(() => { if(!isLoadingData) dataService.saveServices(services); }, [services, isLoadingData]);
    useEffect(() => { if(!isLoadingData) dataService.saveLabels(studentLabels); }, [studentLabels, isLoadingData]);
    
    // Theme Effects
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        window.localStorage.setItem('pilates_theme', theme);
    }, [theme]);

    useEffect(() => {
        const colors = colorPalettes[colorTheme];
        const root = document.documentElement;
        root.style.setProperty('--color-brand-primary', colors.primary);
        root.style.setProperty('--color-brand-secondary', colors.secondary);
        root.style.setProperty('--color-brand-light', colors.light);
        root.style.setProperty('--color-brand-accent', colors.accent);
        root.style.setProperty('--color-brand-bg', colors.bg);
        window.localStorage.setItem('pilates_color_theme', colorTheme);
    }, [colorTheme]);


    const handleLogin = (role: UserRole, id?: string) => {
        if (role === UserRole.ADMIN && id) {
            const admin = admins.find(a => a.id === id);
            if (admin) {
                setCurrentUser({ role, name: admin.name });
                setActiveView(ActiveView.DASHBOARD);
            }
        } else if (role === UserRole.STUDENT && id) {
            const student = students.find(s => s.id === id);
            if (student) {
                setCurrentUser({ role, studentId: id, name: student.name });
                setActiveView(ActiveView.DASHBOARD);
            }
        }

        const hasSeenGuide = window.localStorage.getItem('pilaris_guide_seen_v1');
        if (!hasSeenGuide) {
            setShowGuide(true);
        }
    };

    const handleStudentRegister = (name: string, email: string) => {
        const newStudent: Student = {
            id: `s${Date.now()}`,
            name,
            email,
            joinDate: new Date().toISOString().split('T')[0],
            notes: '',
            avatarUrl: `https://picsum.photos/seed/${name.split(' ')[0]}/200`
        };
        setStudents(prev => [...prev, newStudent]);
        setCurrentUser({ role: UserRole.STUDENT, studentId: newStudent.id, name: newStudent.name });
        setActiveView(ActiveView.DASHBOARD);
        setShowGuide(true);
    };

    const handleAdminRegister = (name: string, email: string, password: string) => {
        const newAdmin: AdminUser = {
            id: `adm${Date.now()}`,
            name,
            email,
            password
        };
        setAdmins(prev => [...prev, newAdmin]);
        setCurrentUser({ role: UserRole.ADMIN, name: newAdmin.name });
        setActiveView(ActiveView.DASHBOARD);
        setShowGuide(true);
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleCloseGuide = () => {
        setShowGuide(false);
        window.localStorage.setItem('pilaris_guide_seen_v1', 'true');
    };

    const handleOpenGuide = () => {
        setShowGuide(true);
    }

    const addStudent = useCallback((student: Omit<Student, 'id' | 'avatarUrl'>) => {
        const newStudent: Student = {
            ...student,
            id: `s${Date.now()}`,
            avatarUrl: `https://picsum.photos/seed/${student.name.split(' ')[0]}/200`
        };
        setStudents(prev => [...prev, newStudent]);
    }, []);
    
    const updateStudent = useCallback((updatedStudent: Student) => {
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    }, []);

    const addInstructor = useCallback((instructor: Omit<Instructor, 'id' | 'avatarUrl'>) => {
        const newInstructor: Instructor = {
            ...instructor,
            id: `i${Date.now()}`,
            avatarUrl: `https://picsum.photos/seed/${instructor.name.split(' ')[0]}/200`
        };
        setInstructors(prev => [...prev, newInstructor]);
    }, []);
    
    const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
        const newExpense: Expense = { ...expense, id: `e${Date.now()}` };
        setExpenses(prev => [...prev, newExpense]);
    }, []);

    const updateClassesForDay = useCallback((date: string, updatedClassesForDay: Class[]) => {
        setClasses(prev => {
            const otherDaysClasses = prev.filter(c => c.date !== date);
            return [...otherDaysClasses, ...updatedClassesForDay];
        });
    }, []);

    const handleBatchScheduleUpdate = useCallback((dates: string[], hours: string[], capacity: number, serviceId: string | null) => {
        setClasses(prev => {
            let newClasses = [...prev];
            
            dates.forEach(date => {
                hours.forEach(hour => {
                    const existingIndex = newClasses.findIndex(c => c.date === date && c.id === hour);
                    
                    if (existingIndex >= 0) {
                        const existingClass = newClasses[existingIndex];
                        const currentEnrollments = existingClass.enrollments || [];
                        
                        let newEnrollments = [...currentEnrollments];
                        if (newEnrollments.length < capacity) {
                            const slotsToAdd = capacity - newEnrollments.length;
                            for (let i = 0; i < slotsToAdd; i++) {
                                newEnrollments.push({
                                    studentId: null,
                                    status: AttendanceStatus.PENDING,
                                    price: 0
                                });
                            }
                        }
                        
                        newClasses[existingIndex] = {
                            ...existingClass,
                            capacity: capacity,
                            serviceId: serviceId !== null ? serviceId : existingClass.serviceId,
                            enrollments: newEnrollments
                        };
                    } else {
                        const newEnrollments: Enrollment[] = Array(capacity).fill(null).map(() => ({
                            studentId: null,
                            status: AttendanceStatus.PENDING,
                            price: 0
                        }));

                        newClasses.push({
                            id: hour,
                            date: date,
                            serviceId: serviceId, 
                            capacity: capacity,
                            enrollments: newEnrollments
                        });
                    }
                });
            });

            return newClasses;
        });
    }, []);
    
    const addService = useCallback((service: Omit<Service, 'id'>) => {
        const newService: Service = { ...service, id: `serv${Date.now()}` };
        setServices(prev => [...prev, newService]);
    }, []);
    
    const updateService = useCallback((updatedService: Service) => {
        setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    }, []);

    const removeService = useCallback((serviceId: string) => {
        setServices(prev => prev.filter(s => s.id !== serviceId));
    }, []);
    
    const addStudentLabel = useCallback((label: Omit<StudentLabel, 'id'>) => {
        const newLabel: StudentLabel = { ...label, id: `lab${Date.now()}` };
        setStudentLabels(prev => [...prev, newLabel]);
    }, []);

    const removeStudentLabel = useCallback((labelId: string) => {
        setStudentLabels(prev => prev.filter(l => l.id !== labelId));
    }, []);

    const handleImportData = useCallback((backupData: AppDataBackup) => {
        try {
            setStudents(backupData.data.students);
            setInstructors(backupData.data.instructors);
            setAdmins(backupData.data.admins);
            setExpenses(backupData.data.expenses);
            setServices(backupData.data.services);
            setStudentLabels(backupData.data.studentLabels);
            setClasses(backupData.data.classes);

            alert('Dados restaurados com sucesso!');
            window.location.reload();
        } catch (error) {
            console.error("Failed to import data", error);
            alert("Erro ao importar dados.");
        }
    }, []);

    const getBackupData = useCallback((): AppDataBackup => {
        return {
            version: "1.0",
            timestamp: new Date().toISOString(),
            data: { students, instructors, classes, expenses, services, studentLabels, admins }
        };
    }, [students, instructors, classes, expenses, services, studentLabels, admins]);


    const viewContent = useMemo(() => {
        if (!currentUser) return null;

        const isAdmin = currentUser.role === UserRole.ADMIN;

        switch (activeView) {
            case ActiveView.STUDENTS:
                return isAdmin ? <StudentManagement students={students} addStudent={addStudent} updateStudent={updateStudent} classes={[]} /> : null;
            case ActiveView.SCHEDULE:
                const classesWithDate = classes.map(c => ({ ...c, date: new Date(c.date + 'T00:00:00') }));
                return <Schedule 
                    allDayClasses={classes} 
                    students={students} 
                    services={services} 
                    updateClassesForDay={updateClassesForDay}
                    onBatchUpdate={handleBatchScheduleUpdate}
                    isReadOnly={!isAdmin}
                    currentStudentId={currentUser.studentId}
                />;
            case ActiveView.INSTRUCTORS:
                return isAdmin ? <InstructorManagement instructors={instructors} addInstructor={addInstructor} /> : null;
            case ActiveView.EXPENSES:
                return isAdmin ? <Expenses expenses={expenses} addExpense={addExpense} /> : null;
            case ActiveView.ACCOUNTING:
                const accountingClasses = classes.map(c => ({ ...c, date: new Date(c.date + 'T00:00:00') }));
                return isAdmin ? <Accounting classes={accountingClasses} expenses={expenses} /> : null;
            case ActiveView.SETTINGS:
                return isAdmin ? <Settings 
                    theme={theme} 
                    setTheme={setTheme}
                    colorTheme={colorTheme}
                    setColorTheme={setColorTheme}
                    services={services}
                    addService={addService}
                    updateService={updateService}
                    removeService={removeService}
                    studentLabels={studentLabels}
                    addStudentLabel={addStudentLabel}
                    removeStudentLabel={removeStudentLabel}
                    onImportData={handleImportData}
                    onExportData={getBackupData}
                /> : null;
            case ActiveView.DASHBOARD:
            default:
                 const dashboardClasses = classes.map(c => ({
                    ...c,
                    date: new Date(c.date + 'T00:00:00')
                 })).filter(c => c.serviceId);

                 if (!isAdmin && currentUser.studentId) {
                    const myStudent = students.find(s => s.id === currentUser.studentId);
                    if (!myStudent) return <div>Erro: Perfil não encontrado.</div>
                    return <StudentDashboard student={myStudent} classes={dashboardClasses} />
                 }

                return <Dashboard students={students} classes={dashboardClasses} instructors={instructors} expenses={expenses} services={services} />;
        }
    }, [activeView, students, classes, instructors, expenses, addStudent, addInstructor, addExpense, updateStudent, services, studentLabels, theme, colorTheme, updateClassesForDay, addService, updateService, removeService, addStudentLabel, removeStudentLabel, currentUser, handleBatchScheduleUpdate, handleImportData, getBackupData]);

    if (isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-gray-900">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Carregando seus dados...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Login 
            students={students} 
            admins={admins}
            onLogin={handleLogin} 
            onRegister={handleStudentRegister} 
            onAdminRegister={handleAdminRegister}
        />;
    }

    return (
        <div className="flex h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} dark:bg-gray-800 dark:border-r dark:border-gray-700`}>
               <Sidebar 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    closeSidebar={() => setSidebarOpen(false)} 
                    userRole={currentUser.role}
                    onLogout={handleLogout}
                    onOpenGuide={handleOpenGuide}
                />
            </div>
            
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white border-b lg:hidden dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-brand-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
                            <path d="M20 3v4" />
                            <path d="M22 5h-4" />
                        </svg>
                        <h1 className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-100">PilarisControl</h1>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-300">
                        <Menu size={24} />
                    </button>
                </header>
                
                <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 bg-brand-bg dark:bg-gray-900 transition-colors duration-200">
                    {isCloudEnabled ? (
                        <div className="mb-2 text-xs text-green-600 flex items-center justify-end">
                           <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Nuvem Ativa
                        </div>
                    ) : (
                         <div className="mb-2 text-xs text-orange-500 flex items-center justify-end">
                           <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span> Modo Offline (Local)
                        </div>
                    )}
                    {viewContent}
                </div>
            </main>

            <OnboardingGuide 
                isOpen={showGuide} 
                onClose={handleCloseGuide} 
                role={currentUser.role} 
            />
        </div>
    );
};

export default App;
