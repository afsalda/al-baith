import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Bell } from 'lucide-react';

const MobileNav: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { label: 'Explore', path: '/', icon: <Home className="w-6 h-6" /> },
        { label: 'Wishlists', path: '/experiences', icon: <Compass className="w-6 h-6" /> },
        { label: 'Services', path: '/services', icon: <Bell className="w-6 h-6" /> },
    ];

    const isRoomPage = location.pathname.startsWith('/room/');

    if (isRoomPage) return null;

    return (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className={`${isActive ? 'text-amber-900' : 'text-neutral-400 group-hover:text-black'} transition-colors`}>
                                {item.icon}
                            </div>
                            <span className={`text-[10px] font-medium ${isActive ? 'text-amber-900' : 'text-neutral-400 group-hover:text-black'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileNav;
