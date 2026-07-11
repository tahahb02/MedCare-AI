import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus, Download, Clock, Pill, CalendarCheck, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';

const eventTypeConfig = {
  medication: { label: 'Médicament', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300', dot: 'bg-blue-500' },
  appointment: { label: 'Rendez-vous', color: 'bg-medcare-purple/10 text-medcare-purple', dot: 'bg-medcare-purple' },
  reminder: { label: 'Rappel', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300', dot: 'bg-amber-500' },
  exercise: { label: 'Exercice', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300', dot: 'bg-green-500' },
};

const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

export default function HealthCalendarPage() {
  const queryClient = useQueryClient();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [eventType, setEventType] = useState('medication');
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('08:00');
  const [eventReminder, setEventReminder] = useState(true);

  const { data } = useQuery({
    queryKey: ['patient-calendar'],
    queryFn: async () => { const { data } = await api.get('/symptoms/calendar'); return data; },
  });

  const addEventMutation = useMutation({
    mutationFn: async () => {
      const date = selectedDate || new Date().toISOString().split('T')[0];
      const { data } = await api.post('/symptoms/calendar', { type: eventType, title: eventTitle, date, time: eventTime, reminder: eventReminder });
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries('patient-calendar'); toast.success('Événement ajouté'); setShowForm(false); setEventTitle(''); },
    onError: () => toast.error('Erreur'),
  });

  const events = data?.events || [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const d = ev.date?.split('T')[0] || ev.date;
      if (!map[d]) map[d] = [];
      map[d].push(ev);
    });
    return map;
  }, [events]);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const formatDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isToday = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const exportICS = () => {
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
    events.forEach(ev => {
      ics += 'BEGIN:VEVENT\n';
      ics += `DTSTART:${(ev.date || '').replace(/-/g, '')}T${(ev.time || '00:00').replace(':', '')}00\n`;
      ics += `SUMMARY:${ev.title || ev.type}\n`;
      ics += `DESCRIPTION:${ev.type}\n`;
      ics += 'END:VEVENT\n';
    });
    ics += 'END:VCALENDAR';
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'calendrier-sante.ics'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Calendrier exporté');
  };

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];
  const upcomingEvents = events.filter(e => e.date >= today.toISOString().split('T')[0]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Calendar size={24} className="text-medcare-purple" /> Calendrier Santé</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportICS} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center gap-1.5 transition-colors">
            <Download size={14} /> Export .ics
          </button>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium flex items-center gap-2 hover:bg-medcare-purple/90 transition-colors">
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nouvel événement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Type</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm">
                {Object.entries(eventTypeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Titre</label>
              <input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" placeholder="Ex: Prendre Doliprane" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">Heure</label>
              <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-sm" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={eventReminder} onChange={e => setEventReminder(e.target.checked)} className="rounded border-gray-300 text-medcare-purple" />
              <label className="text-sm text-gray-700 dark:text-dark-text">Activer le rappel</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => addEventMutation.mutate()} disabled={addEventMutation.isPending || !eventTitle} className="px-5 py-2.5 rounded-xl bg-medcare-purple text-white text-sm font-medium hover:bg-medcare-purple/90 disabled:opacity-50 transition-colors">
              {addEventMutation.isPending ? 'Ajout...' : 'Ajouter'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">Annuler</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{monthNames[month]} {year}</h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"><ChevronLeft size={16} /></button>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-dark-text py-2">{d}</div>)}
            {Array.from({ length: startDay }).map((_, i) => <div key={`e${i}`}></div>)}
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = i + 1;
              const dateStr = formatDateStr(year, month, d);
              const dayEvents = eventsByDate[dateStr] || [];
              const selected = selectedDate === dateStr;
              return (
                <button key={d} onClick={() => setSelectedDate(dateStr)} className={`relative p-2 rounded-xl text-sm transition-all ${isToday(d) ? 'bg-medcare-purple text-white font-bold' : selected ? 'bg-medcare-purple/10 text-medcare-purple font-bold ring-2 ring-medcare-purple' : 'text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg'}`}>
                  {d}
                  {dayEvents.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((ev, j) => <span key={j} className={`w-1 h-1 rounded-full ${eventTypeConfig[ev.type]?.dot || 'bg-gray-400'}`}></span>)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">{selectedDate ? `Événements du ${selectedDate}` : 'Aujourd\'hui'}</h4>
            {(selectedDate ? selectedEvents : eventsByDate[formatDateStr(year, month, today.getDate())] || []).length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Aucun événement</p>
            ) : (selectedDate ? selectedEvents : eventsByDate[formatDateStr(year, month, today.getDate())] || []).map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-dark-bg rounded-xl mb-2">
                <span className={`w-2 h-2 rounded-full ${eventTypeConfig[ev.type]?.dot || 'bg-gray-400'}`}></span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ev.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {ev.time || '--:--'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Prochains événements</h4>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Rien de prévu</p>
            ) : upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-dark-bg rounded-xl mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${eventTypeConfig[ev.type]?.color || 'bg-gray-100 text-gray-500'}`}>{eventTypeConfig[ev.type]?.label || ev.type}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ev.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(ev.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
