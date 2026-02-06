import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Search, Calendar, Users, CheckCircle, Clock, XCircle,
    Eye, Edit, Trash2, X, Filter, ChevronDown, Save, Plus
} from 'lucide-react';
import { Booking, BookingStatus, PaymentStatus } from '../adminTypes';
import { MOCK_BOOKINGS } from '../adminData';

interface AdminDashboardPageProps {
    admin: { name: string; email: string } | null;
    onLogout: () => void;
}

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ admin, onLogout }) => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
    const [roomTypeFilter, setRoomTypeFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const response = await fetch('/api/get-bookings');
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (admin) {
            fetchBookings();
        }
    }, [admin]);

    useEffect(() => {
        if (!admin) {
            navigate('/admin');
        }
    }, [admin, navigate]);

    // Filter bookings
    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            // Search filter (Name, Email, ID)
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                booking.customerName.toLowerCase().includes(searchLower) ||
                booking.email.toLowerCase().includes(searchLower) ||
                booking.id.toLowerCase().includes(searchLower);

            // Status filter
            const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;

            // Room Type filter
            const matchesRoomType = roomTypeFilter === 'all' || booking.roomType === roomTypeFilter;

            // Date filter
            const checkInDate = new Date(booking.checkIn);
            const matchesDateFrom = !dateFrom || checkInDate >= new Date(dateFrom);
            const matchesDateTo = !dateTo || checkInDate <= new Date(dateTo);

            return matchesSearch && matchesStatus && matchesRoomType && matchesDateFrom && matchesDateTo;
        });
    }, [bookings, searchQuery, statusFilter, roomTypeFilter, dateFrom, dateTo]);

    // Stats
    const stats = useMemo(() => ({
        total: bookings.length,
        confirmed: bookings.filter(b => b.bookingStatus === 'confirmed').length,
        pending: bookings.filter(b => b.bookingStatus === 'pending').length,
        cancelled: bookings.filter(b => b.bookingStatus === 'cancelled').length,
    }), [bookings]);

    const handleLogout = () => {
        onLogout();
        navigate('/admin');
    };

    const openModal = (booking: Booking, mode: 'view' | 'edit') => {
        setSelectedBooking({ ...booking });
        setModalMode(mode);
    };

    const closeModal = () => {
        setSelectedBooking(null);
    };

    const handleCancelBooking = (id: string) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            // Update local state
            setBookings(prev => prev.map(b =>
                b.id === id ? { ...b, bookingStatus: 'cancelled' as BookingStatus, paymentStatus: 'refunded' as PaymentStatus } : b
            ));
        }
    };

    const handleSaveBooking = () => {
        if (selectedBooking) {
            setBookings(prev => prev.map(b =>
                b.id === selectedBooking.id ? selectedBooking : b
            ));
            closeModal();
        }
    };

    const handleNewBooking = () => {
        const newBooking: Booking = {
            id: `BK-${Math.floor(Math.random() * 10000)}`,
            customerName: '',
            email: '',
            phone: '',
            checkIn: '',
            checkOut: '',
            roomType: '',
            roomId: 'room-1', // Placeholder
            guests: 2, // Default
            totalAmount: 0,
            paymentStatus: 'pending',
            bookingStatus: 'confirmed',
            createdAt: new Date().toISOString(),
        };
        setSelectedBooking(newBooking);
        setModalMode('create');
    };

    const handleCreateBooking = () => {
        if (selectedBooking) {
            // Simple validation
            if (!selectedBooking.customerName || !selectedBooking.roomType || !selectedBooking.checkIn || !selectedBooking.checkOut) {
                alert("Please fill in all required fields.");
                return;
            }

            // Calculate mock amount if 0
            let amount = selectedBooking.totalAmount;
            if (amount === 0) {
                const start = new Date(selectedBooking.checkIn);
                const end = new Date(selectedBooking.checkOut);
                const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                amount = nights * 2000; // Mock rate
            }

            const bookingToAdd = { ...selectedBooking, totalAmount: amount };
            setBookings(prev => [bookingToAdd, ...prev]);
            closeModal();
        }
    };

    const getStatusBadge = (status: BookingStatus) => {
        const styles = {
            confirmed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (status: PaymentStatus) => {
        const styles = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-orange-100 text-orange-800',
            refunded: 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-amber-950 font-serif">Al-Baith Admin</h1>
                        <p className="text-sm text-gray-500">Welcome, {admin.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleNewBooking}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Booking
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-sm text-gray-500">Total Bookings</p>
                            </div>
                        </div>
                    </div>
                    {/* ... other stats ... */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                                <p className="text-sm text-gray-500">Confirmed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                <p className="text-sm text-gray-500">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                                <p className="text-sm text-gray-500">Cancelled</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="p-4 flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or booking ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                                <select
                                    value={roomTypeFilter}
                                    onChange={(e) => setRoomTypeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="all">All Rooms</option>
                                    <option value="Deluxe Suite">Deluxe Suite</option>
                                    <option value="Standard Room">Standard Room</option>
                                    <option value="Suite Room">Suite Room</option>
                                    <option value="1 BHK Apartment">1 BHK Apartment</option>
                                    <option value="2 BHK Apartment">2 BHK Apartment</option>
                                    <option value="3 BHK Apartment">3 BHK Apartment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in From</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in To</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-700">
                                            {booking.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                                            <div className="text-xs text-gray-500">{booking.email}</div>
                                            <div className="text-xs text-gray-500">{booking.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{booking.roomType}</div>
                                            <div className="text-xs text-gray-500">{booking.guests} guests</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500">to {new Date(booking.checkOut).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getPaymentBadge(booking.paymentStatus)}
                                            <div className="text-xs text-gray-500 mt-1">₹{booking.totalAmount.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(booking.bookingStatus)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openModal(booking, 'view')}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openModal(booking, 'edit')}
                                                    className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {booking.bookingStatus !== 'cancelled' && (
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-3"></div>
                            <p>Loading bookings...</p>
                        </div>
                    ) : filteredBookings.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No bookings found matching your criteria</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalMode === 'view' ? 'Booking Details' : (modalMode === 'edit' ? 'Edit Booking' : 'New Booking')}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {modalMode === 'create' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={selectedBooking.customerName}
                                            onChange={(e) => setSelectedBooking({ ...selectedBooking, customerName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                            placeholder="Guest Name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                value={selectedBooking.phone}
                                                onChange={(e) => setSelectedBooking({ ...selectedBooking, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                                placeholder="Phone Number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={selectedBooking.email}
                                                onChange={(e) => setSelectedBooking({ ...selectedBooking, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                                placeholder="Email Address"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                                        <select
                                            value={selectedBooking.roomType}
                                            onChange={(e) => setSelectedBooking({ ...selectedBooking, roomType: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                        >
                                            <option value="">Select Room Type</option>
                                            <option value="Standard Room">Standard Room</option>
                                            <option value="Deluxe Room">Deluxe Room</option>
                                            <option value="Suite Room">Suite Room</option>
                                            <option value="1 BHK Apartment">1 BHK Apartment</option>
                                            <option value="2 BHK Apartment">2 BHK Apartment</option>
                                            <option value="3 BHK Apartment">3 BHK Apartment</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                                            <input
                                                type="date"
                                                value={selectedBooking.checkIn}
                                                onChange={(e) => setSelectedBooking({ ...selectedBooking, checkIn: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                                            <input
                                                type="date"
                                                value={selectedBooking.checkOut}
                                                onChange={(e) => setSelectedBooking({ ...selectedBooking, checkOut: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Booking ID</label>
                                            <p className="text-gray-900 font-medium text-sm">{selectedBooking.id}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                                            <p className="text-gray-900">{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
                                        <p className="text-gray-900">{selectedBooking.customerName}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                            <p className="text-gray-900 text-sm">{selectedBooking.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                                            <p className="text-gray-900 text-sm">{selectedBooking.phone}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Check-in</label>
                                            <p className="text-gray-900">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Check-out</label>
                                            <p className="text-gray-900">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Room Type</label>
                                            <p className="text-gray-900">{selectedBooking.roomType}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Guests</label>
                                            <p className="text-gray-900">{selectedBooking.guests}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Total Amount</label>
                                            <p className="text-gray-900 font-bold">₹{selectedBooking.totalAmount.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Payment Status</label>
                                            {modalMode === 'edit' ? (
                                                <select
                                                    value={selectedBooking.paymentStatus}
                                                    onChange={(e) => setSelectedBooking({ ...selectedBooking, paymentStatus: e.target.value as PaymentStatus })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                                >
                                                    <option value="paid">Paid</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="refunded">Refunded</option>
                                                </select>
                                            ) : (
                                                getPaymentBadge(selectedBooking.paymentStatus)
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Booking Status</label>
                                        {modalMode === 'edit' ? (
                                            <select
                                                value={selectedBooking.bookingStatus}
                                                onChange={(e) => setSelectedBooking({ ...selectedBooking, bookingStatus: e.target.value as BookingStatus })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                            >
                                                <option value="confirmed">Confirmed</option>
                                                <option value="pending">Pending</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        ) : (
                                            getStatusBadge(selectedBooking.bookingStatus)
                                        )}
                                    </div>

                                    {selectedBooking.notes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{selectedBooking.notes}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            {modalMode === 'edit' && (
                                <button
                                    onClick={handleSaveBooking}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            )}
                            {modalMode === 'create' && (
                                <button
                                    onClick={handleCreateBooking}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    <Save className="w-4 h-4" />
                                    Create Booking
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
