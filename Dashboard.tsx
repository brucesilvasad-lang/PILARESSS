
import React from 'react';
import { Student, Instructor, Class, Expense, AttendanceStatus } from '../types';
import { Users, Clock, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  instructors: Instructor[];
  classes: Class[];
  expenses: Expense[];
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
  <div className={`p-6 bg-white rounded-lg shadow-md flex items-center border-l-4 ${color}`}>
    <div className="mr-4">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-brand-primary">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ students, instructors, classes, expenses }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = new Date().toISOString().split('T')[0];

    const upcomingClasses = classes
        .filter(c => c.date >= today)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);

    const getInstructorName = (id: string) => instructors.find(i => i.id === id)?.name || 'Desconhecido';

    const classesToday = classes.filter(c => c.date.toISOString().split('T')[0] === todayStr);
    const expensesToday = expenses.filter(e => e.date === todayStr);
    
    const revenueToday = classesToday.reduce((total, cls) => {
        const classRevenue = cls.enrollments
            .filter(e => e.status === AttendanceStatus.PRESENT)
            .reduce((sum, e) => sum + e.price, 0);
        return total + classRevenue;
    }, 0);

    const totalExpensesToday = expensesToday.reduce((total, exp) => total + exp.amount, 0);
    const netProfitToday = revenueToday - totalExpensesToday;

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-primary">Painel Principal</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<DollarSign size={32} className="text-green-500" />} title="Receita de Hoje" value={formatCurrency(revenueToday)} color="border-green-500" />
                <StatCard icon={<TrendingDown size={32} className="text-red-500" />} title="Despesas de Hoje" value={formatCurrency(totalExpensesToday)} color="border-red-500" />
                <StatCard icon={<TrendingUp size={32} className="text-blue-500" />} title="Lucro de Hoje" value={formatCurrency(netProfitToday)} color="border-blue-500" />
                <StatCard icon={<Users size={32} className="text-brand-secondary" />} title="Total de Alunos" value={students.length} color="border-brand-secondary" />
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-brand-primary mb-4">Próximas Aulas</h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-brand-light">
                        {upcomingClasses.length > 0 ? upcomingClasses.map(cls => (
                            <li key={cls.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="mb-2 md:mb-0">
                                    <p className="font-semibold text-brand-primary">{cls.name}</p>
                                    <p className="text-sm text-gray-500">com {getInstructorName(cls.instructorId)}</p>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock size={16} className="mr-2" />
                                    <span>{cls.date.toLocaleDateString('pt-BR', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <span className="px-3 py-1 text-xs font-semibold text-white bg-brand-secondary rounded-full">
                                        {cls.enrollments.length} / {cls.capacity} inscritos
                                    </span>
                                </div>
                            </li>
                        )) : (
                            <li className="p-4 text-center text-gray-500">Nenhuma aula agendada.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;