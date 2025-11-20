
import React from 'react';
import { Student, Class, AttendanceStatus } from '../types';
import { Calendar, Clock, Award, FileText, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StudentDashboardProps {
    student: Student;
    classes: Class[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, classes }) => {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Find next class
    const nextClassInfo = classes
        .filter(c => c.date >= today)
        .flatMap(c => c.enrollments.map(e => ({ ...c, enrollment: e }))) // Flatten to link class info with enrollment
        .filter(item => item.enrollment.studentId === student.id && item.enrollment.status !== AttendanceStatus.ABSENT)
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    // Calculate stats
    const history = classes
        .filter(c => c.date < today)
        .flatMap(c => c.enrollments.map(e => ({ ...c, enrollment: e })))
        .filter(item => item.enrollment.studentId === student.id);

    const totalClasses = history.filter(h => h.enrollment.status === AttendanceStatus.PRESENT).length;
    
    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-6">
                <img src={student.avatarUrl} alt={student.name} className="w-20 h-20 rounded-full border-4 border-white shadow-md" />
                <div>
                    <h1 className="text-3xl font-bold text-brand-primary dark:text-white">Olá, {student.name.split(' ')[0]}!</h1>
                    <p className="text-gray-600 dark:text-gray-300">Bem-vindo ao seu espaço de evolução.</p>
                </div>
            </div>

            {/* Next Class Card */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-brand-light text-sm font-medium mb-1 uppercase tracking-wider">Próxima Aula</p>
                        {nextClassInfo ? (
                            <>
                                <h2 className="text-3xl font-bold mb-2">{nextClassInfo.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
                                <div className="flex items-center space-x-4 text-lg">
                                    <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                                        <Clock size={20} className="mr-2" />
                                        {nextClassInfo.id}
                                    </div>
                                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{nextClassInfo.enrollment.status}</span>
                                </div>
                            </>
                        ) : (
                            <div className="py-4">
                                <h2 className="text-xl font-semibold">Nenhuma aula agendada.</h2>
                                <p className="text-brand-light mt-1">Entre em contato com o estúdio para marcar.</p>
                            </div>
                        )}
                    </div>
                    <Calendar size={48} className="text-white/30" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200">Total de Aulas</h3>
                        <TrendingUp className="text-green-500" />
                    </div>
                    <p className="text-4xl font-bold text-brand-primary dark:text-white">{totalClasses}</p>
                    <p className="text-xs text-gray-500 mt-2">Aulas concluídas desde {new Date(student.joinDate).toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Notes/Goals */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-4 text-brand-primary dark:text-brand-secondary">
                        <FileText className="mr-2" />
                        <h3 className="font-bold text-lg">Seu Plano & Observações</h3>
                    </div>
                    <div className="prose prose-sm max-w-none dark:prose-invert bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg max-h-48 overflow-y-auto">
                         {student.notes ? (
                             <ReactMarkdown>{student.notes}</ReactMarkdown>
                         ) : (
                             <p className="text-gray-500 italic">Nenhuma observação registrada ainda.</p>
                         )}
                    </div>
                </div>
            </div>

            {/* Recent History */}
            <div>
                <h3 className="text-xl font-bold text-brand-primary dark:text-white mb-4">Histórico Recente</h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                    {history.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Data</th>
                                        <th className="px-6 py-3">Horário</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {history.sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0, 5).map((h, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {h.date.toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{h.id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                    ${h.enrollment.status === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-800' : 
                                                      h.enrollment.status === AttendanceStatus.ABSENT ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {h.enrollment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <Award size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Seu histórico de aulas aparecerá aqui.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
