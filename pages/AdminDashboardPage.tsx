import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, CalendarDays, TrendingUp, Users } from 'lucide-react';

interface Stats {
    totalRooms: number;
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
}

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalRooms: 0,
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const headers = { Authorization: `Bearer ${token}` };

                const [roomsRes, bookingsRes] = await Promise.all([
                    fetch('/api/admin/rooms', { headers }),
                    fetch('/api/admin/bookings', { headers })
                ]);

                if (roomsRes.ok && bookingsRes.ok) {
                    const rooms = await roomsRes.json();
                    const bookings = await bookingsRes.json();

                    setStats({
                        totalRooms: rooms.length,
                        totalBookings: bookings.length,
                        pendingBookings: bookings.filter((b: any) => b.bookingStatus === 'pending').length,
                        confirmedBookings: bookings.filter((b: any) => b.bookingStatus === 'confirmed').length,
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

    if (isLoading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name || 'Admin'}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <BedDouble size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Rooms</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalRooms}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <CalendarDays size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pending Bookings</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Confirmed</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</h3>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link to="/admin/rooms" className="px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-sm font-semibold transition-all shadow-sm">
                        Manage Rooms
                    </Link>
                    <Link to="/admin/bookings" className="px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 text-sm font-semibold transition-all shadow-sm">
                        View Bookings
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
