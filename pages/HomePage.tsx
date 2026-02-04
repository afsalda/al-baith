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
        // Use window.location to force a reset if needed, but navigation is cleaner for SPA
        // navigate('/') doesn't trigger reload but updates params
        // Since we are adding "clear filters", let's make sure it actually navigates
        window.location.href = '/';
    };

    return (
        <main className="flex-grow">
            {guests > 0 && (
                <div className="container mx-auto px-4 md:px-8 mt-8 mb-[-40px]">
                    <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                        <p className="text-sm text-neutral-600">
                            Showing rooms for <strong>{guests} guests</strong>
                        </p>
                        <button
                            onClick={clearFilters}
                            className="text-sm font-semibold text-amber-700 hover:text-amber-800 hover:underline bg-transparent border-none cursor-pointer"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {filteredRooms.length > 0 ? (
                <Rooms rooms={filteredRooms} />
            ) : (
                <div className="container mx-auto px-4 md:px-8 py-24 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No rooms found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find any rooms that match your criteria.</p>
                    <button
                        onClick={clearFilters}
                        className="bg-gold-glow text-amber-950 px-6 py-2 rounded-full font-semibold hover:bg-amber-400 transition"
                    >
                        View All Rooms
                    </button>
                </div>
            )}
        </main>
    );
};

export default HomePage;
