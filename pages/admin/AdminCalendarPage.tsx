import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, X, Plus, Ban, CheckCircle } from 'lucide-react';

interface Availability {
    roomId: string;
    date: string;
    isBooked: boolean;
    bookingId?: string;
}

interface Room {
    id: string;
    roomType: string;
    name: string;
}

const AdminCalendarPage: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [rooms, setRooms] = useState<Room[]>([]);
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCell, setSelectedCell] = useState<{ room: Room, date: Date, status: string, bookingId?: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch rooms
            const roomsRes = await fetch('/api/admin/rooms', { headers });
            const roomsData = await roomsRes.json();
            setRooms(roomsData);

            // Fetch availability
            const start = startOfMonth(currentDate).toISOString();
            const end = endOfMonth(currentDate).toISOString();

            const availRes = await fetch(`/api/admin/calendar?start=${start}&end=${end}`, { headers });
            if (availRes.ok) {
                const availData = await availRes.json();
                setAvailability(availData);
            }
        } catch (error) {
            console.error('Failed to fetch calendar data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCellClick = (room: Room, date: Date, status: string, bookingId?: string) => {
        setSelectedCell({ room, date, status, bookingId });
    };

    const handleAction = async (action: 'block' | 'unblock' | 'booking') => {
        if (!selectedCell) return;

        if (action === 'booking') {
            // Redirect to booking page with prefilled data or show form
            // For now, alert
            alert(`Feature to add booking for ${selectedCell.room.roomType} on ${format(selectedCell.date, 'yyyy-MM-dd')} coming soon.`);
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch('/api/admin/toggle-block', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    roomId: selectedCell.room.id,
                    date: format(selectedCell.date, 'yyyy-MM-dd'), // Use YYYY-MM-DD to match schema expectation regardless of timezone
                    shouldBlock: action === 'block'
                })
            });

            if (res.ok) {
                // Refresh data
                fetchData();
                setSelectedCell(null);
            } else {
                alert('Failed to update availability');
            }
        } catch (error) {
            console.error('Action failed', error);
        }
    };

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
                <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-md"><ChevronLeft size={20} /></button>
                    <span className="text-base font-semibold min-w-[140px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-md"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto pb-4">
                    <table className="w-full border-collapse min-w-[1000px]">
                        <thead>
                            <tr>
                                <th className="p-4 text-left border-b border-r bg-gray-50 min-w-[200px] sticky left-0 z-10 w-[200px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                    <span className="font-semibold text-gray-700">Room Type</span>
                                </th>
                                {daysInMonth.map(day => (
                                    <th key={day.toString()} className={`p-2 border-b border-r border-gray-100 text-center min-w-[60px] ${isToday(day) ? 'bg-amber-50' : ''}`}>
                                        <div className={`text-xs ${isToday(day) ? 'text-amber-700 font-bold' : 'text-gray-500'}`}>{format(day, 'EEE')}</div>
                                        <div className={`text-sm font-bold mt-1 ${isToday(day) ? 'text-amber-900' : 'text-gray-700'}`}>{format(day, 'd')}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={daysInMonth.length + 1} className="p-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="animate-spin mb-3 h-8 w-8 text-amber-500" />
                                            <span>Loading calendar data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : rooms.map(room => (
                                <tr key={room.id} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="p-4 border-b border-r border-gray-100 font-medium sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] group-hover:bg-gray-50 transition-colors">
                                        <div className="font-semibold text-gray-800">{room.roomType}</div>
                                        {/* <div className="text-xs text-gray-400 mt-1">ID: {room.id.substring(0, 8)}...</div> */}
                                    </td>
                                    {daysInMonth.map(day => {
                                        // Check availability status
                                        // Need to match date carefully. API likely returns full ISO string with time.
                                        // We should match strictly by YYYY-MM-DD
                                        const dayStr = format(day, 'yyyy-MM-dd');
                                        const avail = availability.find(a => a.roomId === room.id && a.date.startsWith(dayStr));

                                        const status = avail?.isBooked ? (avail.bookingId ? 'booked' : 'blocked') : 'available';

                                        let cellClass = "hover:bg-gray-100 cursor-pointer transition-colors";
                                        let content = null;

                                        if (status === 'booked') {
                                            cellClass = "bg-blue-50 hover:bg-blue-100 cursor-pointer";
                                            content = <div className="h-full w-full flex items-center justify-center p-1"><div className="w-full h-8 bg-blue-500 rounded-md shadow-sm" title="Booked"></div></div>;
                                        } else if (status === 'blocked') {
                                            cellClass = "bg-red-50 hover:bg-red-100 cursor-pointer";
                                            content = <div className="h-full w-full flex items-center justify-center p-1"><div className="w-full h-8 bg-red-400 rounded-md shadow-sm flex items-center justify-center"><X size={14} className="text-white" /></div></div>;
                                        } else {
                                            // Available
                                            content = <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100"><Plus size={16} className="text-gray-400" /></div>;
                                        }

                                        return (
                                            <td
                                                key={day.toString()}
                                                className={`border-b border-r border-gray-100 relative h-[60px] p-0 ${cellClass}`}
                                                onClick={() => handleCellClick(room, day, status, avail?.bookingId)}
                                                title={`${format(day, 'yyyy-MM-dd')}: ${status}`}
                                            >
                                                {content}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cell Action Modal */}
            {selectedCell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedCell(null)}>
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {format(selectedCell.date, 'MMMM d, yyyy')}
                            </h3>
                            <button onClick={() => setSelectedCell(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm text-gray-500">
                                <p>Room: <span className="font-semibold text-gray-800">{selectedCell.room.roomType}</span></p>
                                <p>Status: <span className={`font-semibold capitalize ${selectedCell.status === 'booked' ? 'text-blue-600' :
                                    selectedCell.status === 'blocked' ? 'text-red-500' : 'text-green-600'
                                    }`}>{selectedCell.status}</span></p>
                                {selectedCell.bookingId && <p className="text-xs mt-1 font-mono bg-gray-100 p-1 rounded inline-block">ID: {selectedCell.bookingId}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-2">
                                {selectedCell.status === 'available' && (
                                    <>
                                        {/* <button 
                                            onClick={() => handleAction('booking')}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                                        >
                                            <CheckCircle size={18} />
                                            Add Manual Booking
                                        </button> */}
                                        <button
                                            onClick={() => handleAction('block')}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                                        >
                                            <Ban size={18} />
                                            Block Date
                                        </button>
                                    </>
                                )}

                                {selectedCell.status === 'blocked' && (
                                    <button
                                        onClick={() => handleAction('unblock')}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                    >
                                        <CheckCircle size={18} />
                                        Unblock Date
                                    </button>
                                )}

                                {selectedCell.status === 'booked' && (
                                    <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-center">
                                        This date has a confirmed booking. <br />
                                        Go to Bookings page to manage.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendarPage;
