import React from 'react';
import Rooms from '../components/Rooms';

const HomePage: React.FC = () => {
    return (
        <main className="flex-grow">
            <Rooms />
        </main>
    );
};

export default HomePage;
