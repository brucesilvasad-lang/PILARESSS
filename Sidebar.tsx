import React from 'react';
import { ActiveView, UserRole } from '../types';
import { LayoutDashboard, Users, Calendar, Dumbbell, X, CreditCard, Calculator, Sparkles, SlidersHorizontal, LogOut, HelpCircle } from 'lucide-react';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  closeSidebar: () => void;
  userRole?: UserRole;
  onLogout: () => void;
  onOpenGuide?: () => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center p-3 text-base font-normal rounded-lg transition-all duration-200 ${
        isActive 
        ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/50 dark:text-blue-300' 
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, closeSidebar, userRole, onLogout, onOpenGuide }) => {
  const handleNavigation = (view: ActiveView) => {
    setActiveView(view);
    closeSidebar();
  };

  const isAdmin = userRole === UserRole.ADMIN;

  return (
    <div className="flex flex-col h-full text-gray-800 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-brand-light/30 rounded-full mr-2">
                <Sparkles className="text-brand-secondary" size={24} />
              </div>
              <h1 className="text-xl font-bold dark:text-white tracking-tight">Pilaris<span className="text-brand-secondary">Control</span></h1>
            </div>
            <button onClick={closeSidebar} className="text-gray-500 lg:hidden dark:text-gray-400">
              <X size={24} />
            </button>
        </div>
        <nav className="flex-1 p-4">
            <ul className="space-y-2">
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    label={isAdmin ? "Painel Admin" : "Meu Painel"}
                    isActive={activeView === ActiveView.DASHBOARD}
                    onClick={() => handleNavigation(ActiveView.DASHBOARD)}
                />
                
                <NavItem
                    icon={<Calendar size={20} />}
                    label="Agenda"
                    isActive={activeView === ActiveView.SCHEDULE}
                    onClick={() => handleNavigation(ActiveView.SCHEDULE)}
                />

                {isAdmin && (
                    <>
                        <NavItem
                            icon={<Users size={20} />}
                            label="Alunos"
                            isActive={activeView === ActiveView.STUDENTS}
                            onClick={() => handleNavigation(ActiveView.STUDENTS)}
                        />
                        <NavItem
                            icon={<Dumbbell size={20} />}
                            label="Instrutores"
                            isActive={activeView === ActiveView.INSTRUCTORS}
                            onClick={() => handleNavigation(ActiveView.INSTRUCTORS)}
                        />
                        <NavItem
                            icon={<CreditCard size={20} />}
                            label="Despesas"
                            isActive={activeView === ActiveView.EXPENSES}
                            onClick={() => handleNavigation(ActiveView.EXPENSES)}
                        />
                         <NavItem
                            icon={<Calculator size={20} />}
                            label="Contábil"
                            isActive={activeView === ActiveView.ACCOUNTING}
                            onClick={() => handleNavigation(ActiveView.ACCOUNTING)}
                        />
                        <NavItem
                            icon={<SlidersHorizontal size={20} />}
                            label="Ajustes"
                            isActive={activeView === ActiveView.SETTINGS}
                            onClick={() => handleNavigation(ActiveView.SETTINGS)}
                        />
                    </>
                )}
            </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
             {onOpenGuide && (
                 <button 
                    onClick={onOpenGuide}
                    className="flex items-center w-full p-3 text-base font-normal text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                    <HelpCircle size={20} />
                    <span className="ml-3">Guia de Uso</span>
                </button>
             )}
             <button 
                onClick={onLogout}
                className="flex items-center w-full p-3 text-base font-normal text-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
            >
                <LogOut size={20} />
                <span className="ml-3">Sair</span>
            </button>
        </div>

        <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} PilarisControl</p>
            <p>{isAdmin ? 'Modo Gestão' : 'Portal do Aluno'}</p>
        </div>
    </div>
  );
};

export default Sidebar;