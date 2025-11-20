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
        onSubmit({ 
            name, 
            email, 
            joinDate: new Date().toISOString().split('T')[0], 
            notes 
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">E-mail (Opcional)</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <textarea 
                    rows={4}
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md"
                ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md"
                >
                    Adicionar
                </button>
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


    // --- PREPARAR DATAS CORRETAMENTE ---
    const parsedClasses = useMemo(() => {
        return classes.map(cls => ({
            ...cls,
            dateObj: new Date(cls.date + "T00:00:00")
        }));
    }, [classes]);


    useEffect(() => {
        if (selectedStudent) {
            setEditedStudentData({
                name: selectedStudent.name,
                email: selectedStudent.email,
                notes: selectedStudent.notes
            });
        }
    }, [selectedStudent]);


    // --- GERAR PLANO DE AULA IA ---
    const handleGeneratePlan = async (studentToUse?: Student) => {
        const student = studentToUse || selectedStudent;
        if (!student) return;

        setSelectedStudent(student);
        setIsAiModalOpen(true);
        setIsLoadingAi(true);

        const plan = await generateExercisePlan(student.notes);
        setAiPlan(plan);

        setIsLoadingAi(false);
    };


    // --- DETALHES ---
    const handleOpenDetails = (student: Student) => {
        setSelectedStudent(student);
        setIsDetailModalOpen(true);
        setIsEditing(false);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedStudent(null);
        setIsEditing(false);
    };

    const handleSaveChanges = () => {
        if (selectedStudent) {
            updateStudent({
                ...selectedStudent,
                ...editedStudentData
            });
            setIsEditing(false);
        }
    };


    const handleCopyPlan = () => {
        navigator.clipboard.writeText(aiPlan);
    };


    // --- HISTÓRICO CORRIGIDO (datas eram string!) ---
    const studentHistory = useMemo(() => {

        if (!selectedStudent) return [];

        const list: {
            classId: string;
            className: string | undefined;
            date: Date;
            status: string;
            price: number;
        }[] = [];

        parsedClasses.forEach(cls => {
            cls.enrollments.forEach(enr => {
                if (enr.studentId === selectedStudent.id) {
                    list.push({
                        classId: cls.id,
                        className: (cls as any).name, // opcional, caso tenha nome
                        date: cls.dateObj,
                        status: enr.status,
                        price: enr.price
                    });
                }
            });
        });

        return list.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [parsedClasses, selectedStudent]);


    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };


    return (
        <div>

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">Gestão de Alunos</h1>

                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md"
                >
                    <UserPlus size={16} className="mr-2" />
                    Adicionar Aluno
                </button>
            </div>


            {/* LISTA DE ALUNOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {students.map(student => (
                    <div 
                        key={student.id} 
                        className="bg-white rounded-lg shadow-md p-5 flex flex-col"
                    >
                        <div className="flex items-center mb-4">
                            <img 
                                src={student.avatarUrl}
                                className="w-16 h-16 rounded-full mr-4"
                            />
                            <div>
                                <h3 className="text-lg font-bold text-brand-primary">
                                    {student.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {student.email || "Sem e-mail"}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 flex-grow">
                            <strong>Observações:</strong> {student.notes || "Nenhuma observação."}
                        </p>

                        <button 
                            onClick={() => handleOpenDetails(student)}
                            className="mt-4 w-full px-4 py-2 bg-brand-light text-brand-primary rounded-md"
                        >
                            Ver Detalhes
                        </button>
                    </div>
                ))}

            </div>


            {/* MODAL: ADICIONAR ALUNO */}
            <Modal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Adicionar Novo Aluno"
            >
                <StudentForm 
                    onSubmit={addStudent}
                    onClose={() => setIsAddModalOpen(false)}
                />
            </Modal>



            {/* MODAL: IA */}
            <Modal 
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                title={`Plano de Exercícios (IA) para ${selectedStudent?.name}`}
            >
                {isLoadingAi ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Loader2 className="animate-spin text-brand-primary" size={48} />
                        <p className="mt-4 text-gray-600">Gerando plano personalizado...</p>
                    </div>
                ) : (
                    <div className="relative">
                        <button
                            onClick={handleCopyPlan}
                            className="absolute top-0 right-0 p-2 text-gray-500 hover:text-brand-primary"
                        >
                            <Clipboard size={18} />
                        </button>

                        <div className="prose prose-sm max-w-none max-h-96 overflow-y-auto pr-4">
                            <ReactMarkdown>{aiPlan}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </Modal>



            {/* MODAL: DETALHES */}
            <Modal 
                isOpen={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                title={`Perfil de ${selectedStudent?.name}`}
            >
                {selectedStudent && (

                    <div className="space-y-4">

                        {/* INFO */}
                        <div>

                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-brand-primary">Informações</h3>

                                {!isEditing ? (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center text-sm text-blue-600"
                                    >
                                        <Edit size={14} className="mr-1" /> Editar
                                    </button>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={handleSaveChanges}
                                            className="flex items-center text-sm text-green-600"
                                        >
                                            <Save size={14} className="mr-1" /> Salvar
                                        </button>

                                        <button 
                                            onClick={() => setIsEditing(false)}
                                            className="flex items-center text-sm text-red-600"
                                        >
                                            <X size={14} className="mr-1" /> Cancelar
                                        </button>
                                    </div>
                                )}
                            </div>


                            {/* CAMPOS */}
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input 
                                        type="text"
                                        value={editedStudentData.name || ""}
                                        onChange={e => setEditedStudentData({
                                            ...editedStudentData, 
                                            name: e.target.value
                                        })}
                                        className="w-full p-2 border rounded"
                                    />

                                    <input 
                                        type="email"
                                        value={editedStudentData.email || ""}
                                        onChange={e => setEditedStudentData({
                                            ...editedStudentData, 
                                            email: e.target.value
                                        })}
                                        className="w-full p-2 border rounded"
                                    />

                                    <textarea
                                        rows={3}
                                        value={editedStudentData.notes || ""}
                                        onChange={e => setEditedStudentData({
                                            ...editedStudentData, 
                                            notes: e.target.value
                                        })}
                                        className="w-full p-2 border rounded"
                                    ></textarea>
                                </div>
                            ) : (
                                <>
                                    <p><strong>Nome:</strong> {selectedStudent.name}</p>
                                    <p><strong>Email:</strong> {selectedStudent.email || "Não informado"}</p>
                                    <p><strong>Membro desde:</strong> {new Date(selectedStudent.joinDate + "T00:00:00").toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Observações:</strong> {selectedStudent.notes || "Nenhuma."}</p>

                                    <button 
                                        onClick={() => handleGeneratePlan(selectedStudent)}
                                        className="mt-4 w-full px-4 py-2 bg-brand-accent text-white rounded-md"
                                    >
                                        <Sparkles size={16} className="mr-2 inline-block" />
                                        Gerar Plano com IA
                                    </button>
                                </>
                            )}

                        </div>


                        {/* HISTÓRICO */}
                        <div>
                            <h3 className="font-bold text-brand-primary">Histórico de Aulas</h3>

                            {studentHistory.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto border rounded-md mt-2">

                                    <table className="w-full text-sm">
                                        <thead className="text-xs bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2">Data</th>
                                                <th className="px-4 py-2">Aula</th>
                                                <th className="px-4 py-2">Status</th>
                                                <th className="px-4 py-2 text-right">Valor</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {studentHistory.map((h, idx) => (
                                                <tr key={idx} className="border-b">
                                                    <td className="px-4 py-2">
                                                        {h.date.toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {h.className || "Aula"}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {h.status}
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        {formatCurrency(h.price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mt-2">
                                    Nenhum histórico registrado.
                                </p>
                            )}

                        </div>

                    </div>
                )}
            </Modal>

        </div>
    );
};

export default StudentManagement;
