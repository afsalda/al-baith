
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ViewMode } from '../types';

interface CalendarModalProps {
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  currentView: ViewMode;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ onClose, onDateSelect, currentView }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Get real current date and time
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Initialize currentMonth to current month or later
  const [currentMonth, setCurrentMonth] = useState(new Date(now.getFullYear(), now.getMonth()));
  const [activeTab, setActiveTab] = useState<'dates' | 'months' | 'flexible'>('dates');

  // Calculate shortcuts based on real date
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Get next weekend (Saturday-Sunday)
  const getNextWeekend = () => {
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));

    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);

    return { start: saturday, end: sunday };
  };

  const weekend = getNextWeekend();
  const weekendStart = weekend.start;
  const weekendEnd = weekend.end;

  const isHomesView = currentView === 'homes';

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const handleDateClick = (date: Date) => {
    // Check if date is in the past
    if (date < today) {
      setErrorMessage('Please select a future date');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setErrorMessage('');
    setSelectedDate(date);
    onDateSelect(date);
    setTimeout(() => onClose(), 300);
  };

  const handleQuickSelect = (date: Date) => {
    handleDateClick(date);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString('en-US', { month: 'short' })}`;
  };

  const renderSingleCalendar = (monthDate: Date, showLeftArrow = false, showRightArrow = false) => {
    const { firstDay, daysInMonth } = getDaysInMonth(monthDate);
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isToday = today.toDateString() === date.toDateString();
      const isPast = date < today;

      calendarDays.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateClick(date)}
          disabled={isPast}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${isPast
            ? 'text-[#EBEBEB] cursor-not-allowed'
            : isSelected
              ? 'bg-[#C79D27] text-white'
              : isToday
                ? 'border-2 border-[#C79D27]'
                : 'hover:bg-neutral-100'
            }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          {showLeftArrow && (
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1.5 hover:bg-neutral-100 rounded-full transition border border-neutral-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h3 className="text-center text-base font-semibold flex-1">{monthName}</h3>
          {showRightArrow && (
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1.5 hover:bg-neutral-100 rounded-full transition border border-neutral-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div key={day} className="h-10 w-10 flex items-center justify-center text-xs font-medium text-neutral-500">
              {day}
            </div>
          ))}
          {calendarDays}
        </div>
      </div>
    );
  };

  const renderCalendarWithSidebar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isToday = today.toDateString() === date.toDateString();

      calendarDays.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${isSelected
            ? 'bg-[#C79D27] text-white'
            : isToday
              ? 'border-2 border-[#C79D27]'
              : 'hover:bg-neutral-100'
            }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="flex gap-6">
        {/* Left Sidebar - Quick Select */}
        <div className="flex flex-col gap-3 min-w-[160px]">
          <button
            onClick={() => handleQuickSelect(today)}
            className="text-left p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-900 transition-all"
          >
            <div className="font-semibold text-sm">Today</div>
            <div className="text-xs text-neutral-500 mt-1">{formatDate(today)}</div>
          </button>

          <button
            onClick={() => handleQuickSelect(tomorrow)}
            className="text-left p-4 rounded-xl border-2 border-neutral-900 bg-neutral-50 hover:bg-neutral-100 transition-all"
          >
            <div className="font-semibold text-sm">Tomorrow</div>
            <div className="text-xs text-neutral-500 mt-1">{formatDate(tomorrow)}</div>
          </button>

          <button
            onClick={() => handleQuickSelect(weekendStart)}
            className="text-left p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-900 transition-all"
          >
            <div className="font-semibold text-sm">This weekend</div>
            <div className="text-xs text-neutral-500 mt-1">{formatDateRange(weekendStart, weekendEnd)}</div>
          </button>
        </div>

        {/* Right - Calendar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-neutral-100 rounded-full transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-base font-semibold">{monthName}</h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-neutral-100 rounded-full transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div key={day} className="h-10 w-10 flex items-center justify-center text-xs font-medium text-neutral-500">
                {day}
              </div>
            ))}
            {calendarDays}
          </div>
        </div>
      </div>
    );
  };

  const renderDualCalendar = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);

    return (
      <div>
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-neutral-100 p-1 rounded-full gap-1">
            <button
              onClick={() => setActiveTab('dates')}
              className={`px-8 py-2 rounded-full text-sm font-semibold transition ${activeTab === 'dates' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
            >
              Dates
            </button>
            <button
              onClick={() => setActiveTab('months')}
              className={`px-8 py-2 rounded-full text-sm font-semibold transition ${activeTab === 'months' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
            >
              Months
            </button>
            <button
              onClick={() => setActiveTab('flexible')}
              className={`px-8 py-2 rounded-full text-sm font-semibold transition ${activeTab === 'flexible' ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                }`}
            >
              Flexible
            </button>
          </div>
        </div>

        {/* Dual Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          {renderSingleCalendar(currentMonth, true, false)}
          <div className="hidden md:block">
            {renderSingleCalendar(nextMonth, false, true)}
          </div>
        </div>

        {/* Flexibility Options */}
        <div className="flex flex-wrap gap-2 justify-center border-t pt-6">
          {['Exact dates', '± 1 day', '± 2 days', '± 3 days', '± 7 days', '± 14 days'].map((label) => (
            <button
              key={label}
              className="px-4 py-2 border border-neutral-300 rounded-full text-sm font-semibold hover:border-neutral-900 transition"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95, x: '-50%' }}
        animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
        exit={{ opacity: 0, y: -10, scale: 0.95, x: '-50%' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`fixed top-[140px] md:top-[180px] left-1/2 bg-white rounded-3xl shadow-2xl z-50 w-[95vw] sm:w-[500px] md:w-[600px] lg:w-[800px] ${isHomesView ? '' : 'max-w-[500px]'}`}
      >
        <div className={isHomesView ? 'p-4' : 'p-5'}>
          {isHomesView ? renderDualCalendar() : renderCalendarWithSidebar()}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium shadow-md"
          >
            {errorMessage}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default CalendarModal;
