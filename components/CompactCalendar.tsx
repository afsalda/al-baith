
import React, { useState } from 'react';

interface CompactCalendarProps {
    mode?: 'single' | 'range';
    selectedDate?: Date | null;
    startDate?: Date | null;
    endDate?: Date | null;
    onDateSelect?: (date: Date) => void;
    onRangeSelect?: (start: Date | null, end: Date | null) => void;
    minDate?: Date;
    onClose: () => void;
}

const CompactCalendar: React.FC<CompactCalendarProps> = ({
    mode = 'single',
    selectedDate,
    startDate,
    endDate,
    onDateSelect,
    onRangeSelect,
    minDate,
    onClose
}) => {
    const today = new Date();
    // Start with selected date's month, or today's month
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (mode === 'single' && selectedDate) return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        if (mode === 'range' && startDate) return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysInMonth };
    };

    const handleDateClick = (date: Date) => {
        // Validation (Past dates)
        if (date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) return;
        if (minDate && date.setHours(0, 0, 0, 0) < minDate.setHours(0, 0, 0, 0)) return;

        if (mode === 'single' && onDateSelect) {
            onDateSelect(date);
            onClose();
        } else if (mode === 'range' && onRangeSelect) {
            if (!startDate || (startDate && endDate)) {
                // Start new range
                onRangeSelect(date, null);
            } else if (startDate && !endDate) {
                // Complete range
                if (date < startDate) {
                    onRangeSelect(date, startDate); // Swap if clicked before start
                    onClose();
                } else {
                    onRangeSelect(startDate, date);
                    onClose();
                }
            }
        }
    };

    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const calendarDays = [];
    // Empty slots
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = date.toDateString();
        const isToday = today.toDateString() === dateStr;

        let isSelected = false;
        let isInRange = false;

        if (mode === 'single') {
            isSelected = selectedDate?.toDateString() === dateStr;
        } else {
            if (startDate?.toDateString() === dateStr) isSelected = true;
            if (endDate?.toDateString() === dateStr) isSelected = true;
            if (startDate && endDate && date > startDate && date < endDate) isInRange = true;
        }

        let isDisabled = false;
        if (date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) isDisabled = true;
        if (minDate && date.setHours(0, 0, 0, 0) < minDate.setHours(0, 0, 0, 0)) isDisabled = true;

        // Styling classes
        let bgClass = '';
        let textClass = 'text-black';

        if (isDisabled) {
            textClass = 'text-gray-300 cursor-not-allowed';
        } else if (isSelected) {
            bgClass = 'bg-[#C79D27] text-white';
            textClass = 'text-white';
        } else if (isInRange) {
            bgClass = 'bg-[#F9F1D8]'; // Lighter gold/yellow for range
            textClass = 'text-black';
        } else if (isToday) {
            bgClass = 'border border-[#C79D27]';
        } else {
            bgClass = 'hover:bg-neutral-100';
        }

        calendarDays.push(
            <button
                key={day}
                onClick={() => !isDisabled && handleDateClick(date)}
                disabled={isDisabled}
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${bgClass} ${textClass}`}
            >
                {day}
            </button>
        );
    }

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    return (
        <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 w-[320px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-neutral-100 rounded-full transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="font-semibold text-sm">{monthName}</div>
                <button onClick={nextMonth} className="p-1 hover:bg-neutral-100 rounded-full transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map(d => (
                    <div key={d} className="h-9 w-9 flex items-center justify-center text-xs text-neutral-400 font-medium">
                        {d}
                    </div>
                ))}
                {calendarDays}
            </div>

            {/* Close Overlay (Optional, for outside click handling if not handled by parent) 
                Actually, simpler to just have a close button or rely on parent. 
                But for this 'compact' request, having it inline is good. 
            */}
        </div>
    );
};

export default CompactCalendar;
