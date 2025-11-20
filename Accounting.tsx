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

    const changeYear = (o
