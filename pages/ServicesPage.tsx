import React from 'react';
import ListingCard from '../components/ListingCard';
import { SERVICES } from '../constants';

const ServicesPage: React.FC = () => {
    return (
        <main className="flex-grow bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-[#FFF5F7] to-white pt-8 pb-6">
                <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                            Concierge & Local Services
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-600">
                            Enhance your stay with personalized services delivered to your doorstep
                        </p>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                    {SERVICES.map((service) => (
                        <ListingCard key={service.id} property={service} />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default ServicesPage;
