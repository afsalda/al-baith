import React, { useEffect, useState } from 'react';
import { Eye, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Booking {
    id: number;
    customerName: string;
    email: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
    bookingStatus: 'confirmed' | 'pending' | 'cancelled';
    createdAt: string;
}

const AdminBookingsPage: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem('adminToken');

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/admin/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            const response = await fetch(`/api/admin/bookings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchBookings();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        try {
            const response = await fetch(`/api/admin/bookings/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                fetchBookings();
            } else {
                alert('Failed to delete booking');
            }
        } catch (error) {
            console.error('Error deleting booking', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (isLoading) return <div className="p-8">Loading bookings...</div>;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manage Bookings</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                            <th className="p-4 font-medium">Customer</th>
                            <th className="p-4 font-medium">Room</th>
                            <th className="p-4 font-medium">Dates</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                <td className="p-4">
                                    <p className="font-semibold text-gray-900">{booking.customerName}</p>
                                    <p className="text-sm text-gray-500">{booking.email}</p>
                                    <p className="text-xs text-gray-400">{booking.phone}</p>
                                </td>
                                <td className="p-4 text-gray-800">{booking.roomType}</td>
                                <td className="p-4 text-sm text-gray-600">
                                    <div>In: {new Date(booking.checkIn).toLocaleDateString()}</div>
                                    <div>Out: {new Date(booking.checkOut).toLocaleDateString()}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.bookingStatus)}`}>
                                        {booking.bookingStatus}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {booking.bookingStatus === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(booking.id, 'confirmed')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Confirm"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(booking.id, 'cancelled')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Cancel"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        )}
                                        {booking.bookingStatus === 'confirmed' && (
                                            <button
                                                onClick={() => updateStatus(booking.id, 'cancelled')}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(booking.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No bookings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminBookingsPage;
