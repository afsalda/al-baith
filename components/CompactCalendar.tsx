
import React, { useState } from 'react';

interface CompactCalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    minDate?: Date;
    onClose: () => void;
}

const CompactCalendar: React.FC<CompactCalendarProps> = ({ selectedDate, onDateSelect, minDate, onClose }) => {
    const today = new Date();
    // Start with selected date's month, or today's month
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (selectedDate) return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
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
        if (minDate) {
            // Reset times to compare dates only
            const dateStr = date.toDateString();
            const minDateStr = minDate.toDateString();
            // If date is before minDate (and not equal), disable
            // Actually, simple comparison:
            if (date.setHours(0, 0, 0, 0) < minDate.setHours(0, 0, 0, 0)) return;
        }

        // Prevent selecting past dates globally if no minDate provided (standard sanity check)
        if (date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) return;

        onDateSelect(date);
        onClose();
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
        const isSelected = selectedDate?.toDateString() === date.toDateString();
        const isToday = today.toDateString() === date.toDateString();

        let isDisabled = false;
        if (date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) isDisabled = true;
        if (minDate && date.setHours(0, 0, 0, 0) < minDate.setHours(0, 0, 0, 0)) isDisabled = true;

        calendarDays.push(
            <button
                key={day}
                onClick={() => !isDisabled && handleDateClick(date)}
                disabled={isDisabled}
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' :
                        isSelected ? 'bg-[#C79D27] text-white' :
                            isToday ? 'border border-[#C79D27] text-black' :
                                'hover:bg-neutral-100 text-black'
                    }`}
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
