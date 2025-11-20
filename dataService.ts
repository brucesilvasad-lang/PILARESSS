// src/services/dataService.ts

import { createClient } from '@supabase/supabase-js';
import { Class, Student, Service, Enrollment } from '../types';

// ======================================================
// 🔗 CONFIG SUPABASE
// ======================================================
const supabaseUrl = "https://wkmigwuhzchbnjquhxgo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWlnd3VoemNoYm5qcXVoeGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODY5OTQsImV4cCI6MjA3OTE2Mjk5NH0.fhQZNKLzdS_YvXNaEC93nKc4CwX416GvctFkkzfCR0E";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ======================================================
// 📌 STUDENTS
// ======================================================
export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from("students").select("*");

  if (error) throw error;
  return data || [];
}

export async function createStudent(student: Omit<Student, "id" | "avatarUrl">) {
  const { data, error } = await supabase
    .from("students")
    .insert({
      name: student.name,
      email: student.email,
      notes: student.notes,
      joinDate: student.joinDate,
      avatarUrl: `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(
        student.name
      )}`
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudentData(student: Student) {
  const { error } = await supabase
    .from("students")
    .update({
      name: student.name,
      email: student.email,
      notes: student.notes
    })
    .eq("id", student.id);

  if (error) throw error;
}

// ======================================================
// 📌 SERVICES (Tipos de Atendimento)
// ======================================================
export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase.from("services").select("*");

  if (error) throw error;
  return data || [];
}

// ======================================================
// 📌 CLASSES (Agenda)
// ======================================================

// Obter todas as aulas de um dia
export async function getClassesByDay(date: string): Promise<Class[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("date", date);

  if (error) throw error;

  // converter date string → Date
  return (data || []).map((c: any) => ({
    ...c,
    date: new Date(c.date + "T00:00:00"),
    enrollments: c.enrollments || []
  }));
}

// Salvar todas as aulas do dia
export async function updateClassesForDay(date: string, classes: Class[]) {
  // Apaga tudo do dia
  const { error: delErr } = await supabase.from("classes").delete().eq("date", date);
  if (delErr) throw delErr;

  // Insere novamente
  const payload = classes.map(c => ({
    id: c.id,
    date: date,
    serviceId: c.serviceId,
    capacity: c.enrollments.length,
    enrollments: c.enrollments as Enrollment[]
  }));

  const { error: insErr } = await supabase.from("classes").insert(payload);

  if (insErr) throw insErr;
}

// ======================================================
// ⚙ CONFIGURAÇÃO EM LOTE
// ======================================================
export async function batchConfigureClasses(
  dates: string[],
  hours: string[],
  capacity: number,
  serviceId: string | null
) {
  // Cria payload
  const allRows: any[] = [];

  for (const date of dates) {
    for (const hour of hours) {
      const enrollments: Enrollment[] = [];

      if (serviceId) {
        for (let i = 0; i < capacity; i++) {
          enrollments.push({
            studentId: null,
            status: "PENDING",
            price: 0
          });
        }
      }

      allRows.push({
        id: hour,
        date,
        serviceId,
        capacity,
        enrollments
      });
    }
  }

  // Apagar tudo do intervalo de datas
  const { error: delErr } = await supabase
    .from("classes")
    .delete()
    .in("date", dates);

  if (delErr) throw delErr;

  // Inserir tudo novamente
  const { error: insErr } = await supabase.from("classes").insert(allRows);

  if (insErr) throw insErr;
}
