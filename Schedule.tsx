import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Class, Student, Service, AttendanceStatus, Enrollment } from '../types';
import { ChevronLeft, ChevronRight, UserPlus, Trash2, CalendarPlus, CalendarX, DollarSign, Lock, LayoutGrid, Settings2 } from 'lucide-react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import Modal from './Modal';

interface ScheduleProps {
  allDayClasses: Class[];
  students: Student[];
  services: Service[];
  updateClassesForDay: (date: string, updatedClasses: Class[]) => void;
  onBatchUpdate?: (dates: string[], hours: string[], capacity: number, serviceId: string | null) => void;
  isReadOnly?: boolean;
  currentStudentId?: string;
}

const animatedComponents = makeAnimated();
const HOURS = Array.from({ length: 14 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

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

  const dateString = useMemo(() => currentDate.toISOString().split('T')[0], [currentDate]);

  const dailyClasses = useMemo(() => {
    const classesForDay = allDayClasses.filter(c => c.date === dateString);
    const classMap = new Map(classesForDay.map(c => [c.id, c]));

    return HOURS.map(hour => {
      return classMap.get(hour) || {
        id: hour,
        date: dateString,
        serviceId: null,
        capacity: 0,
        enrollments: []
      };
    });
  }, [dateString, allDayClasses]);

  const [localDailyClasses, setLocalDailyClasses] = useState(dailyClasses);

  useEffect(() => {
    setLocalDailyClasses(dailyClasses);
  }, [dailyClasses]);

  const handleUpdate = useCallback(
    (updatedClass: Class) => {
      const newClasses = localDailyClasses.map(c =>
        c.id === updatedClass.id ? updatedClass : c
      );
      setLocalDailyClasses(newClasses);
      updateClassesForDay(dateString, newClasses);
    },
    [localDailyClasses, dateString, updateClassesForDay]
  );

  const handleServiceChange = (hour: string, serviceId: string | null) => {
    if (isReadOnly) return;

    const targetClass = localDailyClasses.find(c => c.id === hour);
    if (targetClass) {
      const service = services.find(s => s.id === serviceId);
      const price = service ? service.price : 0;

      let newEnrollments = targetClass.enrollments;

      if (serviceId && newEnrollments.length === 0) {
        newEnrollments = [
          { studentId: null, status: AttendanceStatus.PENDING, price }
        ];
      }

      handleUpdate({
        ...targetClass,
        serviceId,
        enrollments: newEnrollments
      });
    }
  };

  const handleAddStudentSlot = (hour: string) => {
    if (isReadOnly) return;

    const targetClass = localDailyClasses.find(c => c.id === hour);
    if (targetClass && targetClass.serviceId) {
      const service = services.find(s => s.id === targetClass.serviceId);
      const price = service ? service.price : 0;

      const newEnrollment: Enrollment = {
        studentId: null,
        status: AttendanceStatus.PENDING,
        price
      };

      handleUpdate({
        ...targetClass,
        enrollments: [...targetClass.enrollments, newEnrollment]
      });
    }
  };

  const handleEnrollmentChange = (hour: string, index: number, studentId: string | null) => {
    if (isReadOnly) return;

    const targetClass = localDailyClasses.find(c => c.id === hour);
    if (targetClass) {
      const newEnrollments = [...targetClass.enrollments];
      newEnrollments[index].studentId = studentId;

      handleUpdate({ ...targetClass, enrollments: newEnrollments });
    }
  };

  const handleStatusChange = (hour: string, index: number, status: AttendanceStatus) => {
    if (isReadOnly) return;

    const targetClass = localDailyClasses.find(c => c.id === hour);
    if (targetClass) {
      const newEnrollments = [...targetClass.enrollments];
      newEnrollments[index].status = status;

      handleUpdate({ ...targetClass, enrollments: newEnrollments });
    }
  };

  const handleRemoveEnrollment = (hour: string, index: number) => {
    if (isReadOnly) return;

    const targetClass = localDailyClasses.find(c => c.id === hour);
    if (targetClass) {
      const newEnrollments = targetClass.enrollments.filter((_, i) => i !== index);

      handleUpdate({ ...targetClass, enrollments: newEnrollments });
    }
  };

  const handlePriceChange = (hour: string, index: number, price: number) => {
    if (isReadOnly) return;

    const targetClass = localDailyClasses.find(c => c.id === hour);

    if (targetClass && !isNaN(price)) {
      const newEnrollments = [...targetClass.enrollments];
      newEnrollments[index].price = price;

      handleUpdate({ ...targetClass, enrollments: newEnrollments });
    }
  };

  const handleStudentBook = (hour: string, index: number) => {
    if (!currentStudentId) return;

    const targetClass = localDailyClasses.find(c => c.id === hour);
    if (!targetClass) return;

    const newEnrollments = [...targetClass.enrollments];
    newEnrollments[index] = {
      ...newEnrollments[index],
      studentId: currentStudentId,
      status: AttendanceStatus.BOOKED
    };

    handleUpdate({ ...targetClass, enrollments: newEnrollments });
  };

  const handleStudentCancel = (hour: string, index: number) => {
    if (!currentStudentId) return;

    const targetClass = localDailyClasses.find(c => c.id === hour);
    if (!targetClass) return;

    const newEnrollments = [...targetClass.enrollments];
    newEnrollments[index] = {
      ...newEnrollments[index],
      studentId: null,
      status: AttendanceStatus.PENDING
    };

    handleUpdate({ ...targetClass, enrollments: newEnrollments });
  };

  const studentOptions = useMemo(
    () => students.map(s => ({ value: s.id, label: s.name })),
    [students]
  );

  const changeDay = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + offset);
      return newDate;
    });
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

  // Batch configuration
  const [configPeriod, setConfigPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [configCapacity, setConfigCapacity] = useState<number>(3);
  const [configServiceId, setConfigServiceId] = useState<string>('');
  const [selectedHours, setSelectedHours] = useState<string[]>([]);

  const toggleHour = (hour: string) => {
    setSelectedHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]
    );
  };

  const selectAllHours = () => {
    setSelectedHours(prev =>
      prev.length === HOURS.length ? [] : HOURS
    );
  };

  const applyBatchConfig = () => {
    if (!onBatchUpdate) return;

    const dates: string[] = [];
    const startDate = new Date(currentDate);

    if (configPeriod === 'today') {
      dates.push(startDate.toISOString().split('T')[0]);
    } else if (configPeriod === 'week') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
    } else {
      const month = startDate.getMonth();
      const d = new Date(startDate);
      while (d.getMonth() === month) {
        dates.push(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
      }
    }

    onBatchUpdate(dates, selectedHours, configCapacity, configServiceId || null);
    setIsConfigModalOpen(false);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-brand-primary dark:text-gray-100">
          Agenda {isReadOnly ? '(Agendamento)' : ''}
        </h1>

        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 transition-colors shadow-sm"
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

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {localDailyClasses.map(cls => {
          const classRevenue = cls.enrollments
            .filter(e => e.status === AttendanceStatus.PRESENT && e.studentId)
            .reduce((sum, e) => sum + e.price, 0);

          const serviceName =
            services.find(s => s.id === cls.serviceId)?.name || 'Atendimento';

          const filledSlots = cls.enrollments.filter(e => e.studentId).length;

          return (
            <div
              key={cls.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col space-y-3 border-t-4
              ${filledSlots > 0 ? 'border-brand-secondary' : 'border-transparent'}
              ${isReadOnly && !cls.serviceId ? 'opacity-50' : ''}`}
            >
              {/* TOP */}
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

              {/* SERVICE SELECTOR */}
              {!isReadOnly ? (
                <select
                  value={cls.serviceId || ''}
                  onChange={e =>
                    handleServiceChange(cls.id, e.target.value || null)
                  }
                  className="w-full p-2 border rounded-md bg-white text-gray-900"
                >
                  <option value="">Selecione o Atendimento</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {formatCurrency(s.price)}
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

              {/* ENROLLMENTS */}
              {cls.serviceId && (
                <div className="space-y-3 flex-grow">
                  {cls.enrollments.map((enrollment, index) => {
                    const isMyEnrollment =
                      currentStudentId &&
                      enrollment.studentId === currentStudentId;

                    const isEmpty = !enrollment.studentId;

                    return (
                      <div
                        key={index}
                        className={`bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md space-y-2
                        ${isMyEnrollment ? 'ring-2 ring-brand-secondary bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        {/* STUDENT VIEW */}
                        {isReadOnly ? (
                          <div className="flex items-center justify-between min-h-[2.25rem]">
                            {isEmpty ? (
                              <button
                                onClick={() =>
                                  handleStudentBook(cls.id, index)
                                }
                                className="w-full flex items-center justify-center text-sm bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md py-1.5"
                              >
                                <CalendarPlus size={14} className="mr-1.5" />
                                Agendar
                              </button>
                            ) : isMyEnrollment ? (
                              <div className="w-full flex items-center justify-between">
                                <span className="font-bold text-brand-primary dark:text-white text-sm">
                                  Você
                                </span>
                                <button
                                  onClick={() =>
                                    handleStudentCancel(cls.id, index)
                                  }
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
                            <Select
                              options={studentOptions}
                              value={studentOptions.find(
                                o => o.value === enrollment.studentId
                              )}
                              onChange={opt =>
                                handleEnrollmentChange(
                                  cls.id,
                                  index,
                                  opt ? opt.value : null
                                )
                              }
                              isClearable
                              placeholder={`Vaga ${index + 1}`}
                              components={animatedComponents}
                            />

                            <div className="flex items-center space-x-2">
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

                              <button
                                onClick={() =>
                                  handleRemoveEnrollment(cls.id, index)
                                }
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

      {/* MODAL */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configurar Grade de Horários"
      >
        <div className="space-y-6">
          <p className="bg-blue-50 p-4 rounded-md text-blue-800 text-sm">
            Configure vagas automaticamente para múltiplos dias e horários.
          </p>

          {/* PERÍODO */}
          <div>
            <label className="block text-sm font-medium mb-2">
              1. Escolha o Período
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setConfigPeriod('today')}
                className={`flex-1 py-2 px-4 rounded-md border ${
                  configPeriod === 'today'
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                Apenas Hoje
              </button>
              <button
                onClick={() => setConfigPeriod('week')}
                className={`flex-1 py-2 px-4 rounded-md border ${
                  configPeriod === 'week'
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                Próx. 7 Dias
              </button>
              <button
                onClick={() => setConfigPeriod('month')}
                className={`flex-1 py-2 px-4 rounded-md border ${
                  configPeriod === 'month'
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white border-gray-300'
                }`}
              >
                Mês Atual (Restante)
              </button>
            </div>
          </div>

          {/* SERVIÇO */}
          <div>
            <label className="block text-sm font-medium mb-2">
              2. Tipo de Atendimento
            </label>
            <select
              value={configServiceId}
              onChange={e => setConfigServiceId(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Definir depois (Livre)</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - {formatCurrency(s.price)}
                </option>
              ))}
            </select>
          </div>

          {/* CAPACIDADE */}
          <div>
            <label className="block text-sm font-medium mb-2">
              3. Capacidade de Alunos
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
              <label className="text-sm font-medium">4. Horários</label>
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
                  className={`py-2 px-1 text-xs rounded-md border ${
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

          {/* SALVAR */}
          <button
            onClick={applyBatchConfig}
            disabled={selectedHours.length === 0}
            className="w-full py-3 bg-brand-primary text-white rounded-lg disabled:opacity-50"
          >
            <LayoutGrid size={18} className="inline-block mr-2" />
            Gerar Vagas
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Schedule;
