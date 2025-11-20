
import { supabase, isCloudEnabled } from '../lib/supabaseClient';
import { Student, Instructor, Class, Expense, Service, StudentLabel, AdminUser } from '../types';

// Nomes das chaves para LocalStorage
const KEYS = {
    STUDENTS: 'pilates_students',
    INSTRUCTORS: 'pilates_instructors',
    CLASSES: 'pilates_classes',
    EXPENSES: 'pilates_expenses',
    SERVICES: 'pilates_services',
    LABELS: 'pilates_student_labels',
    ADMINS: 'pilates_admins',
};

// Função genérica para carregar dados (Cloud -> Fallback Local)
async function loadData<T>(tableName: string, localKey: string, initialData: T): Promise<T> {
    if (isCloudEnabled && supabase) {
        try {
            const { data, error } = await supabase.from(tableName).select('*');
            if (error) throw error;
            
            if (data && data.length > 0) {
                return data as unknown as T;
            }
        } catch (err) {
            console.warn(`Erro ao carregar ${tableName} da nuvem, tentando local...`, err);
        }
    }

    // Fallback LocalStorage
    try {
        const item = window.localStorage.getItem(localKey);
        return item ? JSON.parse(item) : initialData;
    } catch (error) {
        console.error(`Erro localStorage ${localKey}:`, error);
        return initialData;
    }
}

// Função genérica para salvar dados (Upsert Cloud + Delete Missing + Local Backup)
async function saveData(tableName: string, localKey: string, data: any[]) {
    // 1. Salvar Local (Backup instantâneo e offline)
    window.localStorage.setItem(localKey, JSON.stringify(data));

    // 2. Salvar Nuvem (Sync)
    if (isCloudEnabled && supabase) {
        try {
            // A. Atualizar ou Inserir dados existentes
            const { error: upsertError } = await supabase.from(tableName).upsert(data);
            if (upsertError) throw upsertError;

            // B. Sincronizar Deletes (Exceto para classes que usam chave composta e raramente são deletadas)
            // Se não fizermos isso, itens deletados no App continuariam existindo no Banco.
            if (tableName !== 'classes') {
                const { data: dbData, error: fetchError } = await supabase.from(tableName).select('id');
                if (fetchError) throw fetchError;

                if (dbData) {
                    // Identificar IDs que estão no Banco mas NÃO estão mais no App (foram deletados)
                    const currentIds = new Set(data.map((item: any) => item.id));
                    const idsToDelete = dbData
                        .filter((row: any) => !currentIds.has(row.id))
                        .map((row: any) => row.id);

                    if (idsToDelete.length > 0) {
                        const { error: deleteError } = await supabase.from(tableName).delete().in('id', idsToDelete);
                        if (deleteError) console.error(`Erro ao deletar obsoletos em ${tableName}:`, deleteError);
                    }
                }
            }

        } catch (err) {
            console.error(`Erro de sincronização em ${tableName}:`, err);
        }
    }
}

// API Exportada
export const dataService = {
    // --- Students ---
    getStudents: (initial: Student[]) => loadData<Student[]>('students', KEYS.STUDENTS, initial),
    saveStudents: (data: Student[]) => saveData('students', KEYS.STUDENTS, data),

    // --- Instructors ---
    getInstructors: (initial: Instructor[]) => loadData<Instructor[]>('instructors', KEYS.INSTRUCTORS, initial),
    saveInstructors: (data: Instructor[]) => saveData('instructors', KEYS.INSTRUCTORS, data),

    // --- Classes ---
    getClasses: async (initial: Class[]) => {
        const data = await loadData<Class[]>('classes', KEYS.CLASSES, initial);
        return data.map(c => ({
             ...c,
             enrollments: c.enrollments || []
        }));
    },
    // Classes usam chave composta (id, date), então evitamos a lógica de delete automático por ID simples
    saveClasses: (data: Class[]) => saveData('classes', KEYS.CLASSES, data),

    // --- Expenses ---
    getExpenses: (initial: Expense[]) => loadData<Expense[]>('expenses', KEYS.EXPENSES, initial),
    saveExpenses: (data: Expense[]) => saveData('expenses', KEYS.EXPENSES, data),

    // --- Services ---
    getServices: (initial: Service[]) => loadData<Service[]>('services', KEYS.SERVICES, initial),
    saveServices: (data: Service[]) => saveData('services', KEYS.SERVICES, data),

    // --- Labels ---
    getLabels: (initial: StudentLabel[]) => loadData<StudentLabel[]>('student_labels', KEYS.LABELS, initial),
    saveLabels: (data: StudentLabel[]) => saveData('student_labels', KEYS.LABELS, data),

    // --- Admins ---
    getAdmins: (initial: AdminUser[]) => loadData<AdminUser[]>('admins', KEYS.ADMINS, initial),
    saveAdmins: (data: AdminUser[]) => saveData('admins', KEYS.ADMINS, data),
};
