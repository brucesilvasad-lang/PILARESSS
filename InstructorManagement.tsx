
import React, { useState } from 'react';
import { Instructor } from '../types';
import Modal from './Modal';
import { UserPlus } from 'lucide-react';

interface InstructorFormProps {
  onSubmit: (instructor: Omit<Instructor, 'id' | 'avatarUrl'>) => void;
  onClose: () => void;
}

const InstructorForm: React.FC<InstructorFormProps> = ({ onSubmit, onClose }) => {
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, specialty });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
            </div>
            <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Especialidade (ex: Reformer, Mat Pilates)</label>
                <input type="text" id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm" />
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90">Adicionar Instrutor</button>
            </div>
        </form>
    );
};

const InstructorManagement: React.FC<{ instructors: Instructor[], addInstructor: (instructor: Omit<Instructor, 'id' | 'avatarUrl'>) => void }> = ({ instructors, addInstructor }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">Gestão de Instrutores</h1>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90">
                    <UserPlus size={16} className="mr-2" />
                    Adicionar Instrutor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructors.map(instructor => (
                    <div key={instructor.id} className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center text-center">
                        <img src={instructor.avatarUrl} alt={instructor.name} className="w-24 h-24 rounded-full mb-4" />
                        <h3 className="text-lg font-bold text-brand-primary">{instructor.name}</h3>
                        <p className="text-sm text-brand-secondary font-medium">{instructor.specialty}</p>
                    </div>
                ))}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Novo Instrutor">
                <InstructorForm onSubmit={addInstructor} onClose={() => setIsAddModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default InstructorManagement;
