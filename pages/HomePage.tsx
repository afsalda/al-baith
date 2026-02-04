import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Rooms from '../components/Rooms';
import { ROOMS_DATA } from '../constants';

const HomePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const guestsParam = searchParams.get('guests');
    const guests = guestsParam ? parseInt(guestsParam) : 0;

    const filteredRooms = useMemo(() => {
        if (!guests) return ROOMS_DATA;
        return ROOMS_DATA.filter(room => room.guests >= guests);
    }, [guests]);

    const clearFilters = () => {
        window.history.pushState({}, '', '/');
        window.location.reload(); // Simple way to reset or just use navigation
    };

    // Better way using navigate from router if available, or just link.
    // Since we are inside component, let's just render the header differently.

    return (
        <main className="flex-grow">
            {guests > 0 && (
                <div className="container mx-auto px-4 md:px-8 mt-8 mb-[-40px]">
                    <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                        <p className="text-sm text-neutral-600">
                            Showing rooms for <strong>{guests} guests</strong>
                        </p>
                        <a
                            href="/"
                            className="text-sm font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                        >
                            Clear Filters
                        </a>
                    </div>
                </div>
            )}
            <Rooms rooms={filteredRooms} />
        </main>
    );
};

export default HomePage;
