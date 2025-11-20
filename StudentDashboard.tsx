import React, { useMemo } from 'react';
import { Student, Class, AttendanceStatus } from '../types';
import { Calendar, Clock, Award, FileText, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StudentDashboardProps {
    student: Student;
    classes: Class[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, classes }) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // --- Corrigir datas vindas como string ---
    const parsedClasses = useMemo(() => {
        return classes.map(c => ({
            ...c,
            dateObj: new Date(c.date + "T00:00:00")
        }));
    }, [classes]);

    // --- Encontrar próxima aula ---
    const nextClassInfo = useMemo(() => {
        return parsedClasses
            .filter(c => c.dateObj.getTime() >= today.getTime())
            .flatMap(c => c.enrollments.map(e => ({ ...c, enrollment: e })))
            .filter(item => item.enrollment.studentId === student.id)
            .filter(item => item.enrollment.status !== AttendanceStatus.ABSENT)
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];
    }, [parsedClasses, student.id]);

    // --- Histórico ---
    const history = useMemo(() => {
        return parsedClasses
            .filter(c => c.dateObj.getTime() < today.getTime())
            .flatMap(c => c.enrollments.map(e => ({ ...c, enrollment: e })))
            .filter(item => item.enrollment.studentId === student.id);
    }, [parsedClasses, student.id]);

    const totalClasses = history.filter(h => h.enrollment.status === AttendanceStatus.PRESENT).length;

    return (
        <div className="space-y-8">
            
            {/* Header com avatar */}
            <div className="flex items-center space-x-4 mb-6">
                <img 
                    src={student.avatarUrl} 
                    alt={student.name} 
                    className="w-20 h-20 rounded-full border-4 border-white shadow-md" 
                />
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary dark:text-white">
                        Olá, {student.name.split(' ')[0]}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Bem-vindo ao seu espaço de evolução.
                    </p>
                </div>
            </div>

            {/* Próxima Aula */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-brand-light text-sm font-medium mb-1 uppercase tracking-wider">
                            Próxima Aula
                        </p>

                        {nextClassInfo ? (
                            <>
                                <h2 className="text-3xl font-bold mb-2">
                                    {nextClassInfo.dateObj.toLocaleDateString('pt-BR', { 
                                        weekday: 'long', 
                                        day: 'numeric', 
                                        month: 'long' 
                                    })}
                                </h2>

                                <div className="flex items-center space-x-4 text-lg">
                                    <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                                        <Clock size={20} className="mr-2" />
                                        {nextClassInfo.id}
