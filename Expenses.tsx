
import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { PlusCircle } from 'lucide-react';

interface ExpensesProps {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, 'id'>) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, addExpense }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const dailyExpenses = useMemo(() => {
        return expenses.filter(e => e.date === selectedDate).sort((a, b) => b.id.localeCompare(a.id));
    }, [expenses, selectedDate]);

    const totalDailyExpenses = useMemo(() => {
        return dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
    }, [dailyExpenses]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description && amount) {
            addExpense({
                date: selectedDate,
                description,
                amount: parseFloat(amount),
            });
            setDescription('');
            setAmount('');
        }
    };
    
    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-primary">Despesas Diárias</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Expense Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md self-start">
                    <h2 className="text-xl font-semibold text-brand-primary mb-4">Adicionar Nova Despesa</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                            <input
                                type="date"
                                id="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                            <input
                                type="text"
                                id="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="ex: Material de limpeza"
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0,00"
                                required
                                min="0.01"
                                step="0.01"
                                className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                            />
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90">
                            <PlusCircle size={16} className="mr-2" />
                            Adicionar Despesa
                        </button>
                    </form>
                </div>

                {/* Expenses List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-xl font-semibold text-brand-primary">Despesas de {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                         <div className="text-right">
                             <p className="text-sm font-medium text-gray-500">Total</p>
                             <p className="text-2xl font-bold text-brand-primary">{formatCurrency(totalDailyExpenses)}</p>
                         </div>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto">
                         <ul className="divide-y divide-brand-light">
                            {dailyExpenses.length > 0 ? dailyExpenses.map(expense => (
                                <li key={expense.id} className="py-3 flex justify-between items-center">
                                    <p className="text-gray-700">{expense.description}</p>
                                    <p className="font-semibold text-brand-primary">{formatCurrency(expense.amount)}</p>
                                </li>
                            )) : (
                                <li className="py-8 text-center text-gray-500">
                                    <p>Nenhuma despesa registrada para este dia.</p>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
