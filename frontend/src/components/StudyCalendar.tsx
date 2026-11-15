import { useEffect, useState } from 'react';
import type { Task } from '../types';
import { calendarEntries, inRange, monthDays, monthLabel, shiftMonth, CalendarRange, CalendarEntry } from '../calendar';
import { formatDate, localToday } from '../../../shared/planning';
import Modal from './Modal';

export default function StudyCalendar({ tasks, visible, range, month, unplanned, onMonthChange, onOpen, onPlan }: {
  tasks: Task[];
  visible: Task[];
  range: CalendarRange;
  month: string;
  unplanned: boolean;
  onMonthChange: (month: string) => void;
  onOpen: (taskId: number, sessionId: number) => void;
  onPlan: (taskId: number, date: string) => void;
}) {
  const today = localToday();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayOpen, setDayOpen] = useState(false);
  const [taskId, setTaskId] = useState('');
  const entries = calendarEntries(visible, range, month);
  useEffect(() => { setSelectedDay(null); setDayOpen(false); }, [month, range.start, range.end, unplanned]);

  function openDay(day: string) {
    setSelectedDay(day);
    setTaskId('');
    setDayOpen(true);
  }
  function eventButton(entry: CalendarEntry) {
    const { task, session } = entry;
    return <button type="button" className="calendar-event" data-session-id={session.id}
      onClick={() => { setSelectedDay(session.planned_date); onOpen(task.id, session.id); }}
      aria-label={`${task.title}${task.subject_name ? `, ${task.subject_name}` : ''}, ${formatDate(session.planned_date)}, ${session.start_time || 'Sem horário'}, consultar ou editar sessão`}>
      <strong>{task.title}</strong>
      {task.subject_name && <span>{task.subject_name}</span>}
      <span>{session.start_time || 'Sem horário'} · {session.duration_minutes} min</span>
    </button>;
  }

  if (unplanned) return <section className="study-calendar" aria-labelledby="unplanned-title">
    <h2 id="unplanned-title">Atividades sem planejamento</h2>
    <p className="help-text">Estas atividades não têm sessões nem datas para exibir na grade.</p>
    {visible.length === 0 && <p role="status">Nenhuma atividade sem planejamento.</p>}
    <ul className="unplanned-list">{visible.map(task => <li key={task.id}>
      <div><strong>{task.title}</strong><p>{task.subject_name || 'Sem disciplina'} · Prazo: {formatDate(task.due_date)}</p></div>
      <button className="btn btn-primary" onClick={() => onPlan(task.id, today)} aria-label={`Planejar ${task.title}`}>Planejar</button>
    </li>)}</ul>
  </section>;

  return <section className="study-calendar" aria-labelledby="calendar-month-title">
    <div className="calendar-toolbar">
      <h2 id="calendar-month-title" aria-live="polite">Mês visualizado: {monthLabel(month)}</h2>
      <div className="calendar-navigation">
        <button className="btn btn-secondary" disabled={shiftMonth(month, -1) === month} onClick={() => onMonthChange(shiftMonth(month, -1))}>Mês anterior</button>
        <button className="btn btn-secondary" onClick={() => { onMonthChange(today.slice(0, 7)); setSelectedDay(today); }}>Hoje</button>
        <button className="btn btn-secondary" disabled={shiftMonth(month, 1) === month} onClick={() => onMonthChange(shiftMonth(month, 1))}>Próximo mês</button>
      </div>
    </div>
    <p className="help-text">Navegar muda somente o mês visualizado. O período filtrado acima permanece ativo. Selecione um dia para planejar ou um estudo para consultar; você poderá escolher Editar nos detalhes.</p>
    {entries.length === 0 && <p role="status" className="calendar-empty">Nenhuma sessão corresponde ao filtro neste mês. Navegue pelos meses ou revise o período.</p>}
    <div className="calendar-weekdays" aria-hidden="true">{['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(day => <span key={day}>{day}</span>)}</div>
    <ol className="calendar-grid" aria-label={`Dias de ${monthLabel(month)}`}>{monthDays(month).map((day, index) => {
      if (!day) return <li key={`blank-${index}`} className="calendar-blank" aria-hidden="true" />;
      const dayEntries = entries.filter(entry => entry.session.planned_date === day);
      return <li key={day} className={`calendar-day ${day === today ? 'is-today' : ''} ${day === selectedDay ? 'is-selected' : ''}`}>
        <button className="calendar-date" onClick={() => openDay(day)} aria-pressed={selectedDay === day}
          aria-current={day === today ? 'date' : undefined} aria-label={`Selecionar dia ${formatDate(day)}${day === today ? ', hoje' : ''}`}>
          <span>{Number(day.slice(8))}</span>{day === today && <small>Hoje</small>}{day === selectedDay && <small>Selecionado</small>}
        </button>
        <ul className="calendar-events">{dayEntries.slice(0, 3).map(entry => <li key={entry.session.id}>{eventButton(entry)}</li>)}</ul>
        {dayEntries.length > 3 && <button className="calendar-more" onClick={() => openDay(day)} aria-label={`Ver mais sessões de ${formatDate(day)} (${dayEntries.length - 3} adicionais)`}>Ver mais ({dayEntries.length - 3})</button>}
      </li>;
    })}</ol>
    {dayOpen && selectedDay && <Modal title={`Sessões de ${formatDate(selectedDay)}`} large onClose={() => setDayOpen(false)}>
      {!inRange(selectedDay, range) && <p className="warning-message">Este dia está fora do período filtrado. Você pode planejar aqui; o filtro continuará ativo e poderá ocultar a nova sessão.</p>}
      <ul className="calendar-day-list">{entries.filter(e => e.session.planned_date === selectedDay).map(entry => <li key={entry.session.id}>{eventButton(entry)}</li>)}</ul>
      {!entries.some(e => e.session.planned_date === selectedDay) && <p>Nenhuma sessão corresponde ao filtro neste dia.</p>}
      <div className="form-group"><label htmlFor="calendar-task">Atividade existente para planejar</label>
        <select id="calendar-task" value={taskId} onChange={e => setTaskId(e.target.value)}>
          <option value="">Selecione uma atividade</option>{tasks.map(task => <option key={task.id} value={task.id}>{task.title}{task.subject_name ? ` — ${task.subject_name}` : ''}</option>)}
        </select></div>
      {tasks.length === 0 && <p>Cadastre uma atividade na tela principal antes de planejar.</p>}
      <div className="form-actions"><button className="btn btn-secondary" onClick={() => setDayOpen(false)}>Fechar dia</button>
        <button className="btn btn-primary" onClick={() => onPlan(Number(taskId), selectedDay)} disabled={!taskId}>Planejar sessão neste dia</button></div>
      {!taskId&&tasks.length>0&&<p className="help-text">Escolha a atividade acima para habilitar o planejamento. A data deste dia será preenchida; você poderá revisar antes de salvar.</p>}
    </Modal>}
  </section>;
}
