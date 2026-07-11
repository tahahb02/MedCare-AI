import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';

const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const eventColors = {
  medication: 'bg-blue-500',
  appointment: 'bg-purple-500',
  symptom: 'bg-orange-500',
  exercise: 'bg-green-500',
  lab: 'bg-yellow-500',
  other: 'bg-gray-400',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function HealthCalendar({ events = [], onAddEvent, onDeleteEvent }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'other' });

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };

  const next = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const formatDate = (day) => `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDay = (day) => events.filter((e) => e.date === formatDate(day));
  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  const handleAdd = () => {
    if (!newEvent.title.trim()) return;
    onAddEvent?.({ ...newEvent, date: selectedDate });
    setNewEvent({ title: '', type: 'other' });
    setShowAddForm(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
          <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button onClick={next} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
          <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = formatDate(day);
          const dayEvents = getEventsForDay(day);
          const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={day}
              onClick={() => { setSelectedDate(dateStr); setShowAddForm(false); }}
              className={`relative flex flex-col items-center py-1.5 rounded-lg text-xs font-medium transition-colors
                ${isSelected ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : isToday ? 'bg-gray-100 dark:bg-dark-border text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border/50'}`}
            >
              {day}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <div key={j} className={`w-1 h-1 rounded-full ${eventColors[e.type] || eventColors.other}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 pt-3 border-t border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{selectedDate}</p>
              {!showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
                  <Plus size={14} /> Ajouter
                </button>
              )}
            </div>

            {showAddForm && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Événement..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {Object.keys(eventColors).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button onClick={handleAdd} className="px-3 py-1.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">OK</button>
                <button onClick={() => setShowAddForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            )}

            {selectedEvents.length > 0 ? (
              <div className="space-y-1.5">
                {selectedEvents.map((e, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-dark-border/50">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${eventColors[e.type] || eventColors.other}`} />
                      <span className="text-sm text-gray-900 dark:text-white">{e.title}</span>
                    </div>
                    {onDeleteEvent && (
                      <button onClick={() => onDeleteEvent(e)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-border transition-colors">
                        <Trash2 size={12} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !showAddForm && <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">Aucun événement</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
