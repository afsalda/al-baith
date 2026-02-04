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

    return (
        <main className="flex-grow">
            <Rooms rooms={filteredRooms} />
        </main>
    );
};

export default HomePage;
