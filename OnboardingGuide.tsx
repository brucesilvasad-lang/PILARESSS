import React, { useState } from 'react';
import { UserRole } from '../types';
import { ChevronRight, ChevronLeft, X, Check, Calendar, Sparkles, LayoutDashboard, Settings2 } from 'lucide-react';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isOpen, onClose, role }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const adminSteps = [
    {
      title: "Bem-vindo ao PilarisControl",
      description: "Seu sistema completo para gestão de estúdio. Vamos fazer um tour rápido pelas novidades!",
      icon: <Sparkles size={48} className="text-brand-secondary" />
    },
    {
      title: "Agenda Inteligente",
      description: "Configure sua grade mensalmente de uma só vez! Clique em 'Configurar Grade' na Agenda para definir horários, capacidade e tipo de aula em lote.",
      icon: <Calendar size={48} className="text-blue-500" />
    },
    {
      title: "Planos com IA",
      description: "Na área de Alunos, use a Inteligência Artificial para gerar planos de aula personalizados baseados nas observações e lesões de cada aluno.",
      icon: <Settings2 size={48} className="text-purple-500" />
    },
    {
      title: "Financeiro e Contábil",
      description: "Acompanhe despesas diárias e tenha uma visão anual completa do seu lucro e estimativa de impostos na aba Contábil.",
      icon: <LayoutDashboard size={48} className="text-green-500" />
    }
  ];

  const studentSteps = [
    {
      title: "Bem-vindo ao seu Portal",
      description: "Acompanhe sua evolução e gerencie suas aulas de forma simples e prática.",
      icon: <Sparkles size={48} className="text-brand-secondary" />
    },
    {
      title: "Seu Painel",
      description: "Veja sua próxima aula em destaque, seu histórico de presença e as observações do seu instrutor.",
      icon: <LayoutDashboard size={48} className="text-blue-500" />
    },
    {
      title: "Agendamento Online",
      description: "Acesse a aba 'Agenda' para ver horários disponíveis. Você pode agendar aulas livres ou cancelar seus agendamentos com um clique.",
      icon: <Calendar size={48} className="text-green-500" />
    }
  ];

  const steps = role === UserRole.ADMIN ? adminSteps : studentSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative animate-fade-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10"
        >
          <X size={24} />
        </button>

        {/* Image/Icon Area */}
        <div className="bg-brand-bg dark:bg-gray-900 h-48 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-b-[50%] scale-150 translate-y-12"></div>
            <div className="z-10 transform transition-all duration-500 ease-in-out hover:scale-110">
                {steps[currentStep].icon}
            </div>
        </div>

        {/* Content Area */}
        <div className="p-8 flex-1 flex flex-col text-center">
          <h2 className="text-2xl font-bold text-brand-primary dark:text-white mb-3 transition-all">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm leading-relaxed">
            {steps[currentStep].description}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-brand-secondary' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-auto">
            <button 
              onClick={handlePrev} 
              disabled={currentStep === 0}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}
            >
              Voltar
            </button>
            
            <button 
              onClick={handleNext}
              className="flex items-center bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-brand-primary/20"
            >
              {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
              {currentStep === steps.length - 1 ? <Check size={16} className="ml-2"/> : <ChevronRight size={16} className="ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;