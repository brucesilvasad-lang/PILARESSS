
import React, { useState } from 'react';
import { Student, UserRole, AdminUser } from '../types';
import { Lock, User, ArrowRight, UserPlus, Shield, Mail, CheckCircle } from 'lucide-react';

interface LoginProps {
    students: Student[];
    admins?: AdminUser[];
    onLogin: (role: UserRole, id?: string) => void;
    onRegister: (name: string, email: string) => void;
    onAdminRegister?: (name: string, email: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ students, admins = [], onLogin, onRegister, onAdminRegister }) => {
    const [view, setView] = useState<'student' | 'admin'>('student');
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Student Login State
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    
    // Student Register State
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');

    // Admin Login State
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminError, setAdminError] = useState('');

    // Admin Register State
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');

    const handleStudentLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudentId) {
            onLogin(UserRole.STUDENT, selectedStudentId);
        }
    };

    const handleStudentRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (newStudentName && newStudentEmail) {
            onRegister(newStudentName, newStudentEmail);
        }
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError('');
        
        const admin = admins.find(a => a.email.toLowerCase() === adminEmail.toLowerCase() && a.password === adminPassword);
        
        if (admin) {
            onLogin(UserRole.ADMIN, admin.id);
        } else {
            setAdminError('Credenciais inválidas. Verifique seu e-mail e senha.');
        }
    };

    const handleAdminRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAdminName && newAdminEmail && newAdminPassword && onAdminRegister) {
            // Basic check if exists
            if (admins.some(a => a.email.toLowerCase() === newAdminEmail.toLowerCase())) {
                setAdminError('Este e-mail já está cadastrado como administrador.');
                return;
            }
            onAdminRegister(newAdminName, newAdminEmail, newAdminPassword);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-gray-900 transition-colors duration-200 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-light text-brand-primary mb-4">
                        {view === 'student' ? <User size={32} /> : <Shield size={32} />}
                    </div>
                    <h1 className="text-3xl font-bold text-brand-primary dark:text-white">PilarisControl</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {view === 'student' ? 'Portal do Aluno' : 'Acesso Administrativo'}
                    </p>
                </div>

                {view === 'student' && (
                    <>
                        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
                            <button 
                                className={`flex-1 pb-2 text-sm font-medium transition-colors ${!isRegistering ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-500'}`}
                                onClick={() => setIsRegistering(false)}
                            >
                                Já tenho conta
                            </button>
                            <button 
                                className={`flex-1 pb-2 text-sm font-medium transition-colors ${isRegistering ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-500'}`}
                                onClick={() => setIsRegistering(true)}
                            >
                                Criar conta
                            </button>
                        </div>

                        {!isRegistering ? (
                            <form onSubmit={handleStudentLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selecione seu perfil</label>
                                    <select 
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-shadow"
                                    >
                                        <option value="">Buscar pelo nome...</option>
                                        {students.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!selectedStudentId}
                                    className="w-full flex items-center justify-center bg-brand-secondary hover:bg-brand-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                                >
                                    Entrar
                                    <ArrowRight size={18} className="ml-2" />
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleStudentRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seu Nome</label>
                                    <input 
                                        type="text"
                                        value={newStudentName}
                                        onChange={(e) => setNewStudentName(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-shadow"
                                        placeholder="Digite seu nome completo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seu E-mail</label>
                                    <input 
                                        type="email"
                                        value={newStudentEmail}
                                        onChange={(e) => setNewStudentEmail(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-shadow"
                                        placeholder="exemplo@email.com"
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full flex items-center justify-center bg-brand-primary hover:bg-brand-primary/90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                                >
                                    <UserPlus size={18} className="mr-2" />
                                    Cadastrar e Entrar
                                </button>
                            </form>
                        )}
                    </>
                )}

                {view === 'admin' && (
                    <>
                         <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
                            <button 
                                className={`flex-1 pb-2 text-sm font-medium transition-colors ${!isRegistering ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-500'}`}
                                onClick={() => { setIsRegistering(false); setAdminError(''); }}
                            >
                                Entrar
                            </button>
                            <button 
                                className={`flex-1 pb-2 text-sm font-medium transition-colors ${isRegistering ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-500'}`}
                                onClick={() => { setIsRegistering(true); setAdminError(''); }}
                            >
                                Criar Acesso
                            </button>
                        </div>

                        {!isRegistering ? (
                             <form onSubmit={handleAdminLogin} className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail size={18} className="text-gray-400" />
                                        </div>
                                        <input 
                                            type="email"
                                            value={adminEmail}
                                            onChange={(e) => { setAdminEmail(e.target.value); setAdminError(''); }}
                                            className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
                                            placeholder="admin@pilaris.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-gray-400" />
                                        </div>
                                        <input 
                                            type="password"
                                            value={adminPassword}
                                            onChange={(e) => { setAdminPassword(e.target.value); setAdminError(''); }}
                                            className={`w-full pl-10 p-2.5 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 transition-shadow ${adminError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-brand-primary'}`}
                                            placeholder="••••••"
                                            required
                                        />
                                    </div>
                                    {adminError && <p className="text-xs text-red-500 mt-1">{adminError}</p>}
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                                >
                                    Entrar no Sistema
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleAdminRegister} className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Profissional</label>
                                    <input 
                                        type="text"
                                        value={newAdminName}
                                        onChange={(e) => setNewAdminName(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
                                        placeholder="Dr. Silva"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail Profissional</label>
                                    <input 
                                        type="email"
                                        value={newAdminEmail}
                                        onChange={(e) => { setNewAdminEmail(e.target.value); setAdminError(''); }}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
                                        placeholder="email@clinica.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Criar Senha</label>
                                    <input 
                                        type="password"
                                        value={newAdminPassword}
                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
                                        placeholder="••••••"
                                        required
                                    />
                                </div>
                                {adminError && <p className="text-xs text-red-500 mt-1">{adminError}</p>}
                                <button 
                                    type="submit"
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                                >
                                    <CheckCircle size={18} className="mr-2" />
                                    Cadastrar Acesso
                                </button>
                            </form>
                        )}
                    </>
                )}
                
                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                    {view === 'student' ? (
                        <button 
                            onClick={() => { setView('admin'); setIsRegistering(false); }}
                            className="text-xs text-gray-400 hover:text-brand-primary transition-colors"
                        >
                            Acesso Administrativo
                        </button>
                    ) : (
                        <button 
                            onClick={() => { setView('student'); setIsRegistering(false); }}
                            className="text-xs text-gray-400 hover:text-brand-primary transition-colors"
                        >
                            Voltar para Área do Aluno
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
