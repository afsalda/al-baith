import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BedDouble, CalendarDays, Settings, LogOut, Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/rooms', label: 'Rooms', icon: <BedDouble size={20} /> },
        { path: '/admin/bookings', label: 'Bookings', icon: <CalendarDays size={20} /> },
        { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:shadow-none shadow-xl
            `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border ${location.pathname === item.path
                                ? 'bg-black text-white border-black shadow-md'
                                : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-black'
                                }`}
                        >
                            {/* Icon wrapper to ensure consistent width */}
                            <span className="shrink-0">{item.icon}</span>
                            <span className="font-medium truncate">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-lg w-full transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 shrink-0 z-30 sticky top-0">
                    <div className="font-bold text-lg text-gray-800">Al-Baith Admin</div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
