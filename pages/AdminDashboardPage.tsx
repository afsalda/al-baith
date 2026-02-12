import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, CalendarDays, TrendingUp, Users, LogIn, LogOut, Percent } from 'lucide-react';
import { isSameDay, startOfToday, parseISO, isWithinInterval } from 'date-fns';

interface Booking {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    status: string;
    roomType: string;
    totalAmount: number;
    createdAt?: string;
}

interface Stats {
    checkInsToday: number;
    checkOutsToday: number;
    occupancyRate: number;
    totalBookings: number;
    recentBookings: Booking[];
}

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        checkInsToday: 0,
        checkOutsToday: 0,
        occupancyRate: 0,
        totalBookings: 0,
        recentBookings: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch rooms and bookings
                // In a real app, these endpoints should filter by date on the server side
                // But for now we fetch all and filter client side as requested "Simple"
                const [roomsRes, bookingsRes] = await Promise.all([
                    fetch('/api/admin/rooms', { headers }),
                    fetch('/api/admin/bookings', { headers })
                ]);

                if (roomsRes.ok && bookingsRes.ok) {
                    const rooms = await roomsRes.json();
                    const bookings: Booking[] = await bookingsRes.json();

                    const today = startOfToday();

                    // Check-ins Today
                    const checkIns = bookings.filter(b =>
                        b.status !== 'cancelled' &&
                        isSameDay(parseISO(b.checkIn), today)
                    ).length;

                    // Check-outs Today
                    const checkOuts = bookings.filter(b =>
                        b.status !== 'cancelled' &&
                        isSameDay(parseISO(b.checkOut), today)
                    ).length;

                    // Occupancy
                    // Count bookings where today is within [checkIn, checkOut) range usually
                    // Here we count if today is between checkIn and checkOut (inclusive start, exclusive end for logic)
                    const activeBookings = bookings.filter(b => {
                        const start = parseISO(b.checkIn);
                        const end = parseISO(b.checkOut);
                        return b.status === 'confirmed' && (today >= start && today < end);
                    });

                    const occupancy = rooms.length > 0 ? Math.round((activeBookings.length / rooms.length) * 100) : 0;

                    // Recent Bookings (Last 5)
                    // Assuming bookings are sorted or we sort them by createdAt if available, 
                    // otherwise by checkIn descending
                    const recent = [...bookings]
                        .sort((a, b) => {
                            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.checkIn);
                            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.checkIn);
                            return dateB.getTime() - dateA.getTime();
                        })
                        .slice(0, 5);

                    setStats({
                        checkInsToday: checkIns,
                        checkOutsToday: checkOuts,
                        occupancyRate: occupancy,
                        totalBookings: bookings.length,
                        recentBookings: recent,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

    if (isLoading) return <div className="p-8 flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name || 'Admin'}</h1>
                <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Check-ins */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Check-ins Today</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.checkInsToday}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <LogIn size={24} />
                    </div>
                </div>

                {/* Check-outs */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Check-outs Today</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.checkOutsToday}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <LogOut size={24} />
                    </div>
                </div>

                {/* Occupancy */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Occupancy</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.occupancyRate}%</h3>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Percent size={24} />
                    </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBookings}</h3>
                    </div>
                    <div className="p-3 bg-gray-50 text-gray-600 rounded-lg">
                        <CalendarDays size={24} />
                    </div>
                </div>
            </div>

            {/* Recent Bookings & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
                        <Link to="/admin/bookings" className="text-sm text-amber-900 hover:text-amber-700 font-medium">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 hover:bg-gray-100/50 transition-colors">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.recentBookings.length > 0 ? (
                                    stats.recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.guestName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.roomType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.checkIn).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">No recent bookings found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link to="/admin/bookings" className="block w-full text-center px-4 py-3 bg-amber-900 hover:bg-amber-800 text-white rounded-lg font-semibold transition-colors shadow-sm">
                            New Booking (Manual)
                        </Link>
                        <Link to="/admin/calendar" className="block w-full text-center px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                            Check Availability
                        </Link>
                        <Link to="/admin/rooms" className="block w-full text-center px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                            Manage Rooms
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
