import React, { useState, useMemo } from 'react';
import { Class, Expense, AttendanceStatus } from '../types';
import { ChevronLeft, ChevronRight, TrendingUp, ReceiptText, Scale, Calculator, Download } from 'lucide-react';

interface AccountingProps {
  classes: Class[];
  expenses: Expense[];
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; description: string }> = ({ icon, title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
        <div>
            <div className="flex items-center text-gray-500 mb-2">
                {icon}
                <h3 className="ml-2 font-semibold">{title}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <p className="text-sm text-gray-500 mt-3">{description}</p>
    </div>
);

const Accounting: React.FC<AccountingProps> = ({ classes, expenses }) => {

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const changeYear = (offset: number) => {
        setSelectedYear(prev => prev + offset);
    };

    const formatCurrency = (value: number) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // --- Corrigido: garantir que cls.date seja convertido corretamente ---
    const parsedClasses = useMemo(() => {
        return classes.map(c => ({
            ...c,
            dateObj: new Date(c.date + "T00:00:00")
        }));
    }, [classes]);

    // --- Cálculos financeiros corrigidos ---
    const { annualGrossRevenue, annualExpenses, annualNetProfit, estimatedTax } = useMemo(() => {

        const annualGrossRevenue = parsedClasses.reduce((total, cls) => {
            if (cls.dateObj.getFullYear() !== selectedYear) return total;

            const classRevenue = cls.enrollments
                .filter(e => e.status === AttendanceStatus.PRESENT)
                .reduce((sum, e) => sum + e.price, 0);

            return total + classRevenue;
        }, 0);

        const annualExpenses = expenses.reduce((total, exp) => {
            const expDate = new Date(exp.date + "T00:00:00");
            if (expDate.getFullYear() !== selectedYear) return total;
            return total + exp.amount;
        }, 0);

        const annualNetProfit = annualGrossRevenue - annualExpenses;
        const estimatedTax = annualGrossRevenue * 0.06;

        return { annualGrossRevenue, annualExpenses, annualNetProfit, estimatedTax };
    }, [parsedClasses, expenses, selectedYear]);

    return (
        <div className="space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Resumo Anual (Contabilidade)</h1>
                    <p className="text-gray-500 mt-1">Visão geral das finanças do ano selecionado.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-gray-300 rounded-md">
                        <button 
                            onClick={() => changeYear(-1)} 
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <span className="px-4 py-1.5 text-lg font-semibold w-24 text-center">
                            {selectedYear}
                        </span>

                        <button 
                            onClick={() => changeYear(1)} 
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        <Download size={16} className="mr-2" />
                        Baixar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">

                <StatCard 
                    icon={<TrendingUp size={20} className="text-green-500" />} 
                    title="Ganho Bruto Anual" 
                    value={formatCurrency(annualGrossRevenue)}
                    description="Soma de todos os valores recebidos de atendimentos durante o ano."
                />

                <StatCard 
                    icon={<ReceiptText size={20} className="text-red-500" />} 
                    title="Despesas Anuais" 
                    value={formatCurrency(annualExpenses)}
                    description="Soma de todos os gastos e despesas registrados durante o ano."
                />

                <StatCard 
                    icon={<Scale size={20} className="text-blue-500" />} 
                    title="Lucro Líquido Anual" 
                    value={formatCurrency(annualNetProfit)}
                    description="O resultado final após subtrair todas as despesas dos ganhos."
                />

                <StatCard 
                    icon={<Calculator size={20} className="text-orange-500" />} 
                    title="Imposto Estimado" 
                    value={formatCurrency(estimatedTax)}
                    description="Cálculo simplificado baseado em 6% do ganho bruto."
                />

            </div>
        </div>
    );
};

export default Accounting;
