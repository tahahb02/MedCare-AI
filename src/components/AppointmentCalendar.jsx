import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const typeColors = {
  consultation: 'bg-blue-500',
  control: 'bg-green-500',
  emergency: 'bg-red-500',
  teleconsultation: 'bg-purple-500',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function AppointmentCalendar({ appointments = [], onSelectDate, onSelectAppointment }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

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

  const getAppointmentsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter((a) => a.date === dateStr);
  };

  const handleDayClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    onSelectDate?.(dateStr);
  };

  const selectedDayAppts = selectedDate ? appointments.filter((a) => a.date === selectedDate) : [];

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
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayAppts = getAppointmentsForDay(day);
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`relative flex flex-col items-center py-1.5 rounded-lg text-xs font-medium transition-colors
                ${isSelected ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : isToday ? 'bg-gray-100 dark:bg-dark-border text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border/50'}`}
            >
              {day}
              {dayAppts.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayAppts.slice(0, 3).map((a, j) => (
                    <div key={j} className={`w-1 h-1 rounded-full ${typeColors[a.type] || 'bg-gray-400'}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDayAppts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{selectedDate}</p>
          {selectedDayAppts.map((a, i) => (
            <button
              key={i}
              onClick={() => onSelectAppointment?.(a)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-dark-border/50 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-left"
            >
              <div className={`w-2 h-2 rounded-full ${typeColors[a.type] || 'bg-gray-400'}`} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title || a.patientName || 'Rendez-vous'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{a.time}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
