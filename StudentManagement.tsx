
import React, { useState, useMemo, useEffect } from 'react';
import { Student, Class } from '../types';
import Modal from './Modal';
import { generateExercisePlan } from '../services/geminiService';
import { UserPlus, Sparkles, Loader2, Clipboard, Edit, Save, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StudentFormProps {
  onSubmit: (student: Omit<Student, 'id' | 'avatarUrl'>) => void;
  onClose: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, email, joinDate: new Date().toISOString().split('T')[0], notes });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Endereço de E-mail (Opcional)</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Observações Iniciais (Metas, lesões, etc.)</label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"></textarea>
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90">Adicionar Aluno</button>
            </div>
        </form>
    );
};

interface StudentManagementProps {
    students: Student[];
    addStudent: (student: Omit<Student, 'id' | 'avatarUrl'>) => void;
    updateStudent: (student: Student) => void;
    classes: Class[];
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students, addStudent, updateStudent, classes }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [aiPlan, setAiPlan] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedStudentData, setEditedStudentData] = useState<Partial<Student>>({});

    useEffect(() => {
        if (selectedStudent) {
            setEditedStudentData({
                name: selectedStudent.name,
                email: selectedStudent.email,
                notes: selectedStudent.notes,
            });
        }
    }, [selectedStudent]);

    const handleGeneratePlan = async (student: Student) => {
        // Ensure we set the student if calling from button inside details (where selectedStudent is already set)
        // or from outside.
        const studentToUse = student || selectedStudent;
        if(!studentToUse) return;

        setSelectedStudent(studentToUse);
        // Close details modal if open to show AI modal clearly, or stack them. 
        // Let's stack them: keep details open if it was open? 
        // The UI is cleaner if we close details and open AI result, or just open AI modal on top.
        // Since modals are simple fixed divs, let's just open AI modal.
        
        setIsAiModalOpen(true);
        setIsLoadingAi(true);
        const plan = await generateExercisePlan(studentToUse.notes);
        setAiPlan(plan);
        setIsLoadingAi(false);
    };

    const handleOpenDetails = (student: Student) => {
        setSelectedStudent(student);
        setIsDetailModalOpen(true);
        setIsEditing(false);
    };
    
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedStudent(null);
        setIsEditing(false);
    }
    
    const handleSaveChanges = () => {
        if (selectedStudent) {
            updateStudent({ ...selectedStudent, ...editedStudentData });
            setIsEditing(false);
        }
    };

    const handleCopyPlan = () => {
        navigator.clipboard.writeText(aiPlan);
    };

    const studentHistory = useMemo(() => {
        if (!selectedStudent) return [];
        const history: {classId: string; className: string; date: Date; status: string; price: number}[] = [];
        classes.forEach(cls => {
            cls.enrollments.forEach(enrollment => {
                if (enrollment.studentId === selectedStudent.id) {
                    history.push({
                        classId: cls.id,
                        className: cls.name,
                        date: cls.date,
                        status: enrollment.status,
                        price: enrollment.price,
                    });
                }
            });
        });
        return history.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [selectedStudent, classes]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">Gestão de Alunos</h1>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90">
                    <UserPlus size={16} className="mr-2" />
                    Adicionar Aluno
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(student => (
                    <div key={student.id} className="bg-white rounded-lg shadow-md p-5 flex flex-col">
                        <div className="flex items-center mb-4">
                            <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full mr-4" />
                            <div>
                                <h3 className="text-lg font-bold text-brand-primary">{student.name}</h3>
                                <p className="text-sm text-gray-500">{student.email || 'E-mail não informado'}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 flex-grow"><strong>Observações:</strong> {student.notes || 'Nenhuma observação disponível.'}</p>
                        <div className="mt-4">
                            <button onClick={() => handleOpenDetails(student)} className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-brand-primary bg-brand-light rounded-md hover:bg-brand-secondary/50">
                                Ver Detalhes
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Novo Aluno">
                <StudentForm onSubmit={addStudent} onClose={() => setIsAddModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title={`Plano de Exercícios (IA) para ${selectedStudent?.name}`}>
                 <div>
                    {isLoadingAi ? (
                        <div className="flex flex-col items-center justify-center h-48">
                            <Loader2 className="animate-spin text-brand-primary" size={48} />
                            <p className="mt-4 text-gray-600">Gerando plano personalizado...</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <button onClick={handleCopyPlan} title="Copiar plano" className="absolute top-0 right-0 p-2 text-gray-500 hover:text-brand-primary">
                                <Clipboard size={18} />
                            </button>
                            <div className="prose prose-sm max-w-none max-h-96 overflow-y-auto pr-4">
                               <ReactMarkdown>{aiPlan}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} title={`Perfil de ${selectedStudent?.name}`}>
                {selectedStudent && (
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-brand-primary">Informações</h3>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                                        <Edit size={14} className="mr-1"/> Editar
                                    </button>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <button onClick={handleSaveChanges} className="flex items-center text-sm text-green-600 hover:text-green-800">
                                            <Save size={14} className="mr-1"/> Salvar
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="flex items-center text-sm text-red-600 hover:text-red-800">
                                            <X size={14} className="mr-1"/> Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input type="text" value={editedStudentData.name || ''} onChange={e => setEditedStudentData({...editedStudentData, name: e.target.value})} className="w-full p-2 border rounded bg-white text-gray-900"/>
                                    <input type="email" value={editedStudentData.email || ''} onChange={e => setEditedStudentData({...editedStudentData, email: e.target.value})} className="w-full p-2 border rounded bg-white text-gray-900"/>
                                    <textarea value={editedStudentData.notes || ''} onChange={e => setEditedStudentData({...editedStudentData, notes: e.target.value})} rows={3} className="w-full p-2 border rounded bg-white text-gray-900"></textarea>
                                </div>
                            ) : (
                                <>
                                    <p><span className="font-semibold">Nome:</span> {selectedStudent.name}</p>
                                    <p><span className="font-semibold">Email:</span> {selectedStudent.email || 'Não informado'}</p>
                                    <p><span className="font-semibold">Membro desde:</span> {new Date(selectedStudent.joinDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                    <p><span className="font-semibold">Observações:</span> {selectedStudent.notes || 'Nenhuma.'}</p>
                                    
                                    <div className="mt-4 pt-2 border-t border-gray-100">
                                        <button 
                                            onClick={() => handleGeneratePlan(selectedStudent)} 
                                            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-brand-accent rounded-md hover:bg-brand-accent/90 transition-colors"
                                        >
                                            <Sparkles size={16} className="mr-2" />
                                            Gerar Plano de Aula com IA
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-primary">Histórico de Aulas</h3>
                            {studentHistory.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto border rounded-md mt-2">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                            <tr>
                                                <th scope="col" className="px-4 py-2">Data</th>
                                                <th scope="col" className="px-4 py-2">Aula</th>
                                                <th scope="col" className="px-4 py-2">Status</th>
                                                <th scope="col" className="px-4 py-2 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentHistory.map((item, index) => (
                                                <tr key={`${item.classId}-${index}`} className="bg-white border-b last:border-b-0">
                                                    <td className="px-4 py-2">{item.date.toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-4 py-2 font-medium text-gray-900">{item.className}</td>
                                                    <td className="px-4 py-2">{item.status}</td>
                                                    <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mt-2">Nenhum histórico de aulas encontrado.</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentManagement;
