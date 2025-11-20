import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Class, Student, Service, AttendanceStatus, Enrollment } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  Trash2, 
  CalendarPlus, 
  CalendarX, 
  DollarSign, 
  Lock, 
  LayoutGrid, 
  Settings2 
} from 'lucide-react';

import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import Modal from './Modal';

const animatedComponents = makeAnimated();

// Horários fixos do dia
const HOURS = Array.from({ length: 14 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

interface ScheduleProps {
  allDayClasses: Class[];
  students: Student[];
  services: Service[];
  updateClassesForDay: (date: string, updatedClasses: Class[]) => void;
  onBatchUpdate?: (dates: string[], hours: string[], capacity: number, serviceId: string | null) => void;
  isReadOnly?: boolean;
  currentStudentId?: string;
}

const Schedule: React.FC<ScheduleProps> = ({
  allDayClasses,
  students,
  services,
  updateClassesForDay,
  onBatchUpdate,
  isReadOnly = false,
  currentStudentId
}) => {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // yyyy-mm-dd
  const dateString = useMemo(() => currentDate.toISOString().split('T')[0], [currentDate]);

  // Gera grade com base nos dados vindos do backend
  const dailyClasses = useMemo(() => {
    const filtered = allDayClasses.filter(c => c.date === dateString);
    const map = new Map(filtered.map(c => [c.id, c]));

    return HOURS.map(hour => map.get(hour) || {
      id: hour,
      date: dateString,
      serviceId: null,
      capacity: 0,
      enrollments: []
    });
  }, [dateString, allDayClasses]);

  const [localDailyClasses, setLocalDailyClasses] = useState<Class[]>(dailyClasses);

  // Atualiza quando troca o dia
  useEffect(() => {
    setLocalDailyClasses(dailyClasses);
  }, [dailyClasses]);

  // Atualizar aula
  const handleUpdate = useCallback(
    (updatedClass: Class) => {
      const next = localDailyClasses.map(c => c.id === updatedClass.id ? updatedClass : c);
      setLocalDailyClasses(next);
      updateClassesForDay(dateString, next);
    },
    [localDailyClasses, dateString, updateClassesForDay]
  );

  // Mudar tipo de atendimento
  const handleServiceChange = (hour: string, serviceId: string | null) => {
    if (isReadOnly) return;

    const target = localDailyClasses.find(c => c.id === hour);
    if (!target) return;

    const service = services.find(s => s.id === serviceId);
    const price = service ? service.price : 0;

    let enrollments = target.enrollments;

    // Se trocou o atendimento e não há vagas, cria uma vaga inicial
    if (serviceId && enrollments.length === 0) {
      enrollments = [{
        studentId: null,
        status: AttendanceStatus.PENDING,
        price
      }];
    }

    handleUpdate({ ...target, serviceId, enrollments });
  };

  // Criar VAGA
  const handleAddStudentSlot = (hour: string) => {
    if (isReadOnly) return;

    const target = localDailyClasses.find(c => c.id === hour);
    if (!target || !target.serviceId) return;

    const service = services.find(s => s.id === target.serviceId);
    const price = service ? service.price : 0;

    const newEnrollment: Enrollment = {
      studentId: null,
      status: AttendanceStatus.PENDING,
      price
    };

    handleUpdate({ ...target, enrollments: [...target.enrollments, newEnrollment] });
  };

  // Mudar aluno na vaga
  const handleEnrollmentChange = (hour: string, index: number, studentId: string | null) => {
    if (isReadOnly) return;

    const target = localDailyClasses.find(c => c.id === hour);
    if (!target) return;

    const updated = [...target.enrollments];
    updated[index].studentId = studentId;

    handleUpdate({ ...target, enrollments: updated });
  };

  // Status da vaga
  const handleStatusChange = (hour: string, index: number, status: AttendanceStatus) => {
    if (isReadOnly) return;

    const target = localDailyClasses.find(c => c.id === hour);
    if (!target) return;

    const updated = [...target.enrollments];
    updated[index].status = status;

    handleUpdate({ ...target, enrollments: updated });
  };

  // Remover vaga
  const handleRemoveEnrollment = (hour: string, index: number) => {
    if (isReadOnly) return;

    const target = localDailyClasses.find(c => c.id === hour);
    if (!target) return;

    const updated = target.enrollments.filter((_, i) => i !== index);

    handleUpdate({ ...target, enrollments: updated });
  };

  // Editar preço da vaga
  const handlePriceChange = (hour: string, index: number, price: number) => {
    if (isReadOnly) return;

    const target = localDailyClasses.find(c => c.id === hour);
    if (!target || isNaN(price)) return;

    const updated = [...target.enrollments];
    updated[index].price = price;

    handleUpdate({ ...target, enrollments: updated });
  };

  // Agendar aluno (modo leitura)
  const handleStudentBook = (hour: string, index: number) => {
    if (!currentStudentId) return;

    const target = localDailyClasses.find(c => c.id === hour);
    if (!target) return;

    const updated = [...target.enrollments];
    updated[index] = {
      ...updated[index],
      studentId: currentStudentId,
      status: AttendanceStatus.BOOKED
    };

    handleUpdate({ ...target, enrollments: updated });
  };

  // Cancelar agendamento
  const handleStudentCancel = (hour: string, index: number) => {
    if (!currentStudentId) return;

    const target = localDailyClasses.find(c => c.id === hour);
    if (!target) return;

    const updated = [...target.enrollments];
    updated[index] = {
      ...updated[index],
      studentId: null,
      status: AttendanceStatus.PENDING
    };

    handleUpdate({ ...target, enrollments: updated });
  };

  const studentOptions = useMemo(
    () => students.map(s => ({ value: s.id, label: s.name })),
    [students]
  );

  const changeDay = (offset: number) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + offset);
      return d;
    });
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    // CONFIG EM LOTE
  const [configPeriod, setConfigPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [configCapacity, setConfigCapacity] = useState<number>(3);
  const [configServiceId, setConfigServiceId] = useState<string>('');
  const [selectedHours, setSelectedHours] = useState<string[]>([]);

  const toggleHour = (hour: string) => {
    setSelectedHours(prev =>
      prev.includes(hour)
        ? prev.filter(h => h !== hour)
        : [...prev, hour]
    );
  };

  const selectAllHours = () => {
    setSelectedHours(prev => prev.length === HOURS.length ? [] : HOURS);
  };

  const applyBatchConfig = () => {
    if (!onBatchUpdate) return;

    const dates: string[] = [];
    const start = new Date(currentDate);

    if (configPeriod === 'today') {
      dates.push(start.toISOString().split('T')[0]);
    } else if (configPeriod === 'week') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
    } else {
      const month = start.getMonth();
      const d = new Date(start);
      while (d.getMonth() === month) {
        dates.push(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
      }
    }

    onBatchUpdate(
      dates,
      selectedHours,
      configCapacity,
      configServiceId || null
    );

    setIsConfigModalOpen(false);
  };

  return (
    <div>
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-brand-primary dark:text-gray-100">
          Agenda {isReadOnly ? '(Agendamento)' : ''}
        </h1>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 shadow-sm"
            >
              <Settings2 size={18} className="mr-2" />
              Configurar Grade
            </button>
          )}

          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => changeDay(-1)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft />
            </button>

            <span className="w-48 text-center font-semibold text-brand-primary dark:text-gray-200">
              {currentDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>

            <button
              onClick={() => changeDay(1)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* GRADE DO DIA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {localDailyClasses.map(cls => {
          const service = services.find(s => s.id === cls.serviceId);
          const serviceName = service?.name ?? 'Atendimento';

          const filledSlots = cls.enrollments.filter(e => e.studentId).length;

          const classRevenue = cls.enrollments
            .filter(e => e.status === AttendanceStatus.PRESENT && e.studentId)
            .reduce((sum, e) => sum + e.price, 0);

          return (
            <div
              key={cls.id}
              className={`
                bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col space-y-3 border-t-4
                ${filledSlots > 0 ? 'border-brand-secondary' : 'border-transparent'}
                ${isReadOnly && !cls.serviceId ? 'opacity-50' : ''}
              `}
            >
              {/* TOPO – Horário + Receita */}
              <div className="flex justify-between items-center border-b pb-2 border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-xl text-brand-primary dark:text-gray-100">
                  {cls.id}
                </h3>

                {!isReadOnly && (
                  <div className="flex items-center text-sm font-semibold text-green-600">
                    <DollarSign size={14} className="mr-1" />
                    {formatCurrency(classRevenue)}
                  </div>
                )}
              </div>

              {/* Seleção de atendimento */}
              {!isReadOnly ? (
                <select
                  value={cls.serviceId || ''}
                  onChange={e => handleServiceChange(cls.id, e.target.value || null)}
                  className="w-full p-2 border rounded-md bg-white text-gray-900"
                >
                  <option value="">Selecione o Atendimento</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatCurrency(s.price)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="h-10 flex items-center">
                  {cls.serviceId ? (
                    <span className="font-medium text-brand-secondary">
                      {serviceName}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Livre</span>
                  )}
                </div>
              )}

              {/* VAGAS */}
              {cls.serviceId && (
                <div className="space-y-3">
                  {cls.enrollments.map((enrollment, index) => {
                    const isMine =
                      currentStudentId &&
                      enrollment.studentId === currentStudentId;

                    const isEmpty = !enrollment.studentId;

                    return (
                      <div
                        key={index}
                        className={`
                          bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md space-y-2
                          ${isMine ? 'ring-2 ring-brand-secondary bg-blue-50 dark:bg-blue-900/20' : ''}
                        `}
                      >
                        {/* VISÃO DO ALUNO (READ-ONLY) */}
                        {isReadOnly ? (
                          <div className="flex items-center justify-between min-h-[2.25rem]">
                            {isEmpty ? (
                              <button
                                onClick={() => handleStudentBook(cls.id, index)}
                                className="w-full flex items-center justify-center text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md py-1.5"
                              >
                                <CalendarPlus size={14} className="mr-1.5" />
                                Agendar
                              </button>
                            ) : isMine ? (
                              <div className="w-full flex justify-between items-center">
                                <span className="font-bold text-brand-primary dark:text-white text-sm">
                                  Você
                                </span>
                                <button
                                  onClick={() => handleStudentCancel(cls.id, index)}
                                  className="text-xs flex items-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                                >
                                  <CalendarX size={12} className="mr-1" />
                                  Sair
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm flex items-center w-full">
                                <Lock size={14} className="mr-1.5" />
                                Ocupado
                              </span>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Selecionar aluno */}
                            <Select
                              options={studentOptions}
                              value={studentOptions.find(o => o.value === enrollment.studentId) || null}
                              onChange={opt =>
                                handleEnrollmentChange(cls.id, index, opt ? opt.value : null)
                              }
                              isClearable
                              placeholder={`Vaga ${index + 1}`}
                              components={animatedComponents}
                            />

                            <div className="flex items-center space-x-2">
                              {/* Status */}
                              <select
                                value={enrollment.status}
                                onChange={e =>
                                  handleStatusChange(
                                    cls.id,
                                    index,
                                    e.target.value as AttendanceStatus
                                  )
                                }
                                className="w-full p-1 border rounded-md text-xs bg-white"
                              >
                                {Object.values(AttendanceStatus).map(s => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>

                              {/* Remover */}
                              <button
                                onClick={() => handleRemoveEnrollment(cls.id, index)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {!isReadOnly && (
                    <button
                      onClick={() => handleAddStudentSlot(cls.id)}
                      className="w-full mt-2 flex items-center justify-center p-2 text-xs font-medium text-brand-primary border border-brand-primary/30 hover:bg-brand-light/50 rounded-md"
                    >
                      <UserPlus size={14} className="mr-1" />
                      + Vaga
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL DE CONFIGURAÇÃO */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configurar Grade de Horários"
      >
        <div className="space-y-6">
          <p className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
            Configure automaticamente vários dias e horários.
          </p>

          {/* PERÍODO */}
          <div>
            <label className="block text-sm font-medium mb-2">
              1. Escolha o Período
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setConfigPeriod('today')}
                className={`flex-1 py-2 rounded-md border ${
                  configPeriod === 'today'
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                Apenas Hoje
              </button>

              <button
                onClick={() => setConfigPeriod('week')}
                className={`flex-1 py-2 rounded-md border ${
                  configPeriod === 'week'
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                Próx. 7 Dias
              </button>

              <button
                onClick={() => setConfigPeriod('month')}
                className={`flex-1 py-2 rounded-md border ${
                  configPeriod === 'month'
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                Mês Atual
              </button>
            </div>
          </div>

          {/* SERVIÇO */}
          <div>
            <label className="block text-sm font-medium mb-2">
              2. Atendimento
            </label>

            <select
              value={configServiceId}
              onChange={e => setConfigServiceId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Definir depois (Livre)</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — {formatCurrency(s.price)}
                </option>
              ))}
            </select>
          </div>

          {/* CAPACIDADE */}
          <div>
            <label className="block text-sm font-medium mb-2">
              3. Capacidade
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={configCapacity}
              onChange={e => setConfigCapacity(Number(e.target.value))}
              className="w-24 p-2 border rounded-md"
            />
          </div>

          {/* HORÁRIOS */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">
                4. Horários
              </label>
              <button
                onClick={selectAllHours}
                className="text-xs text-brand-primary underline"
              >
                {selectedHours.length === HOURS.length
                  ? 'Desmarcar Todos'
                  : 'Selecionar Todos'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {HOURS.map(hour => (
                <button
                  key={hour}
                  onClick={() => toggleHour(hour)}
                  className={`py-2 text-xs rounded-md border ${
                    selectedHours.includes(hour)
                      ? 'bg-brand-secondary text-white border-brand-secondary'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={applyBatchConfig}
            disabled={selectedHours.length === 0}
            className="w-full py-3 bg-brand-primary text-white rounded-lg disabled:opacity-50"
          >
            <LayoutGrid size={18} className="inline mr-2" />
            Gerar Vagas
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Schedule;

