import React from 'react';
import { Student, Instructor, Class, Expense, AttendanceStatus, Service } from '../types';
import { Users, Clock, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface DashboardProps {
  students: Student[];
  instructors: Instructor[];
  classes: Class[];
  expenses: Expense[];
  services: Service[];
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

const Dashboard: React.FC<DashboardProps> = ({ students, instructors, classes, expenses, services }) => {

  // Converter datas string → Date
  const parsedClasses = classes.map(c => ({
    ...c,
    dateObj: new Date(c.date + "T00:00:00")
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  // próximas aulas
  const upcomingClasses = parsedClasses
    .filter(c => c.dateObj >= today)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    .slice(0, 5);

  const getServiceName = (id: string | null) =>
    services.find(s => s.id === id)?.name || "Serviço não definido";

  const classesToday = parsedClasses.filter(c => c.date === todayStr);
  const expensesToday = expenses.filter(e => e.date === todayStr);

  const revenueToday = classesToday.reduce((total, cls) => {
    const classRevenue = cls.enrollments
      .filter(e => e.status === AttendanceStatus.PRESENT)
      .reduce((sum, e) => sum + e.price, 0);
    return total + classRevenue;
  }, 0);

  const totalExpensesToday = expensesToday.reduce((total, exp) => total + exp.amount, 0);
  const netProfitToday = revenueToday - totalExpensesToday;

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
              <li key={`${cls.date}-${cls.id}`} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">

                {/* nome da aula */}
                <div className="mb-2 md:mb-0">
                  <p className="font-semibold text-brand-primary">
                    {getServiceName(cls.serviceId)}
                  </p>
                  <p className="text-sm text-gray-500">{cls.id}</p>
                </div>

                {/* data */}
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>{cls.dateObj.toLocaleDateString('pt-BR', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>

                {/* vagas */}
                <div className="mt-2 md:mt-0">
                  <span className="px-3 py-1 text-xs font-semibold text-white bg-brand-secondary rounded-full">
                    {cls.enrollments.filter(e => e.studentId !== null).length} / {cls.capacity} inscritos
                  </span>
