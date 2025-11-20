
import React, { useState } from 'react';
import { Theme, ColorTheme, Service, StudentLabel } from '../types';
import { Sun, Moon, PlusCircle, Trash2, Save, X, Palette } from 'lucide-react';

interface SettingsProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    colorTheme: ColorTheme;
    setColorTheme: (theme: ColorTheme) => void;
    services: Service[];
    addService: (service: Omit<Service, 'id'>) => void;
    updateService: (service: Service) => void;
    removeService: (serviceId: string) => void;
    studentLabels: StudentLabel[];
    addStudentLabel: (label: Omit<StudentLabel, 'id'>) => void;
    removeStudentLabel: (labelId: string) => void;
}

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-brand-primary dark:text-gray-100">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const Settings: React.FC<SettingsProps> = ({
    theme,
    setTheme,
    colorTheme,
    setColorTheme,
    services,
    addService,
    updateService,
    removeService,
    studentLabels,
    addStudentLabel,
    removeStudentLabel
}) => {
    const [newServiceName, setNewServiceName] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [newLabelName, setNewLabelName] = useState('');

    const handleAddService = (e: React.FormEvent) => {
        e.preventDefault();
        if (newServiceName && newServicePrice) {
            addService({ name: newServiceName, price: parseFloat(newServicePrice) });
            setNewServiceName('');
            setNewServicePrice('');
        }
    };

    const handleUpdateService = () => {
        if(editingService){
            updateService(editingService);
            setEditingService(null);
        }
    };

    const handleAddLabel = (e: React.FormEvent) => {
        e.preventDefault();
        if(newLabelName){
            addStudentLabel({ name: newLabelName });
            setNewLabelName('');
        }
    }

    // Preview colors for buttons
    const themeColors: Record<ColorTheme, string> = {
        nature: '#4A5C58',
        ocean: '#0f766e',
        royal: '#1e40af',
        sunset: '#c2410c',
    };
    
    const themeNames: Record<ColorTheme, string> = {
        nature: 'Natureza',
        ocean: 'Oceano',
        royal: 'Azul Real',
        sunset: 'Pôr do Sol',
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-primary dark:text-gray-100">Configurações</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <SettingsCard title="Tipos de Atendimento" description="Crie e gerencie os serviços oferecidos e seus preços padrão.">
                        <div className="space-y-4">
                            {services.map(service => (
                                <div key={service.id} className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                    {editingService?.id === service.id ? (
                                        <>
                                            <input type="text" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} className="flex-grow p-2 border rounded-md bg-white text-gray-900 dark:border-gray-500"/>
                                            <input type="number" value={editingService.price} onChange={e => setEditingService({...editingService, price: parseFloat(e.target.value) || 0})} className="w-24 p-2 border rounded-md bg-white text-gray-900 dark:border-gray-500" />
                                            <button onClick={handleUpdateService} className="p-2 text-green-600 hover:text-green-800"><Save size={18} /></button>
                                            <button onClick={() => setEditingService(null)} className="p-2 text-gray-500 hover:text-gray-700"><X size={18} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-grow">
                                                <p className="font-semibold">{service.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">R$ {service.price.toFixed(2)}</p>
                                            </div>
                                            <button onClick={() => setEditingService(service)} className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Editar</button>
                                            <button onClick={() => removeService(service.id)} className="p-2 text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                        </>
                                    )}
                                </div>
                            ))}
                             <form onSubmit={handleAddService} className="flex items-center space-x-2 pt-4 border-t dark:border-gray-700">
                                <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Nome do Atendimento" className="flex-grow p-2 border rounded-md bg-white text-gray-900 dark:border-gray-600"/>
                                <input type="number" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="Valor (R$)" className="w-28 p-2 border rounded-md bg-white text-gray-900 dark:border-gray-600"/>
                                <button type="submit" className="p-2 text-white bg-brand-primary rounded-md hover:bg-brand-primary/90"><PlusCircle size={20}/></button>
                            </form>
                        </div>
                    </SettingsCard>
                </div>

                <div className="space-y-8">
                     <SettingsCard title="Legendas de Alunos" description="Crie e gerencie legendas para classificar seus alunos.">
                         <div className="space-y-2">
                             {studentLabels.map(label => (
                                 <div key={label.id} className="flex justify-between items-center p-3 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                     <span className="font-medium">{label.name}</span>
                                     <button onClick={() => removeStudentLabel(label.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                 </div>
                             ))}
                         </div>
                         <form onSubmit={handleAddLabel} className="flex items-center space-x-2 pt-4 mt-4 border-t dark:border-gray-700">
                            <input type="text" value={newLabelName} onChange={e => setNewLabelName(e.target.value)} placeholder="Nova Legenda" className="flex-grow p-2 border rounded-md bg-white text-gray-900 dark:border-gray-600"/>
                            <button type="submit" className="p-2 text-white bg-brand-primary rounded-md hover:bg-brand-primary/90"><PlusCircle size={20}/></button>
                         </form>
                     </SettingsCard>

                     <SettingsCard title="Aparência" description="Personalize a experiência visual do sistema.">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <Palette className="mr-2 text-gray-500" size={20}/>
                                    <span className="font-medium">Tema de Cores</span>
                                </div>
                                <div className="flex gap-2">
                                    {(Object.keys(themeColors) as ColorTheme[]).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setColorTheme(t)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${colorTheme === t ? 'ring-2 ring-offset-2 ring-brand-primary dark:ring-offset-gray-800 scale-110' : 'hover:scale-105'}`}
                                            title={themeNames[t]}
                                            style={{ backgroundColor: themeColors[t] }}
                                        >
                                            {colorTheme === t && <span className="block w-2 h-2 bg-white rounded-full" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t pt-4 dark:border-gray-700">
                                <span className="font-medium">Modo Escuro</span>
                                <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-white shadow' : 'text-gray-500'}`}>
                                        <Sun size={18} className={theme === 'light' ? 'text-yellow-500' : 'currentColor'}/>
                                    </button>
                                    <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-800 shadow' : 'text-gray-500'}`}>
                                        <Moon size={18} className={theme === 'dark' ? 'text-blue-400' : 'currentColor'}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SettingsCard>

                    <SettingsCard title="Conta" description="Gerencie sua sessão.">
                        <button className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-200 dark:hover:bg-red-900">
                            Sair da Conta
                        </button>
                    </SettingsCard>
                </div>
            </div>
        </div>
    );
};

export default Settings;
