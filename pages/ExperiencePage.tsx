import React from 'react';
import ActivitiesGrid from '../components/ActivitiesGrid';
import { EXPERIENCES } from '../constants';

const ExperiencePage: React.FC = () => {
    return (
        <main className="flex-grow bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-[#FFF5F7] to-white pt-8 pb-6">
                <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 font-serif text-gold-glow">
                            Discover Al-Baith Experiences
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-600">
                            Immerse yourself in authentic royal hospitality, cultural treasures, and luxury adventures.
                        </p>
                    </div>
                </div>
            </div>



            {/* Additional Section - Why Choose Our Experiences */}
            <div className="bg-neutral-50 py-16 mt-12">
                <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 font-serif text-amber-950">Why Choose Al-Baith</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-4">👑</div>
                            <h3 className="text-xl font-semibold mb-2 text-amber-900">Royal Treatment</h3>
                            <p className="text-neutral-600">Every guest is royalty. Experience service that anticipates your every need.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">✨</div>
                            <h3 className="text-xl font-semibold mb-2 text-amber-900">Authentic Luxury</h3>
                            <p className="text-neutral-600">Interiors and experiences curated to reflect the richness of Arabic heritage.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🕌</div>
                            <h3 className="text-xl font-semibold mb-2 text-amber-900">Prime Location</h3>
                            <p className="text-neutral-600">Situated in the heart of the city, offering breathtaking views and easy access.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guest Reviews Section */}
            <div className="py-16 bg-white border-t border-neutral-100">
                <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-serif text-amber-950">What our guests say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Review 1 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 shadow-sm hover:shadow-md transition border border-amber-100/50">
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className="text-[#FFD700]">★</span>
                                ))}
                            </div>
                            <p className="text-gray-700 italic mb-4">"Absolutely majestic stay. The attention to detail in the suite was breathtaking and the service is royalty-standard. A true gem."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold-glow flex items-center justify-center text-amber-950 font-bold shrink-0">A</div>
                                <div>
                                    <div className="font-semibold text-sm">Ahmed S.</div>
                                    <div className="text-xs text-gray-500">Stayed in Oct 2024</div>
                                </div>
                            </div>
                        </div>

                        {/* Review 2 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 shadow-sm hover:shadow-md transition border border-amber-100/50">
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className="text-[#FFD700]">★</span>
                                ))}
                            </div>
                            <p className="text-gray-700 italic mb-4">"The perfect blend of modern luxury and Arabic hospitality. The 24-hour housekeeping team was invisible yet effective. Highly recommended."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold-glow flex items-center justify-center text-amber-950 font-bold shrink-0">S</div>
                                <div>
                                    <div className="font-semibold text-sm">Sarah Jenkins</div>
                                    <div className="text-xs text-gray-500">Stayed in Jan 2025</div>
                                </div>
                            </div>
                        </div>

                        {/* Review 3 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 shadow-sm hover:shadow-md transition border border-amber-100/50">
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className="text-[#FFD700]">★</span>
                                ))}
                            </div>
                            <p className="text-gray-700 italic mb-4">"From the golden accents in the room to the warm welcome, everything screamed luxury. The view from the Deluxe room was unforgettable."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold-glow flex items-center justify-center text-amber-950 font-bold shrink-0">M</div>
                                <div>
                                    <div className="font-semibold text-sm">Mohammed Al-Fayed</div>
                                    <div className="text-xs text-gray-500">Stayed in Dec 2024</div>
                                </div>
                            </div>
                        </div>

                        {/* Review 4 */}
                        <div className="p-6 rounded-2xl bg-neutral-50 shadow-sm hover:shadow-md transition border border-amber-100/50">
                            <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className="text-[#FFD700]">★</span>
                                ))}
                            </div>
                            <p className="text-gray-700 italic mb-4">"Best hotel experience I've had. Very convenient location and the amenities were top notch. Will definitely return."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold-glow flex items-center justify-center text-amber-950 font-bold shrink-0">F</div>
                                <div>
                                    <div className="font-semibold text-sm">Fatima R.</div>
                                    <div className="text-xs text-gray-500">Stayed in Feb 2025</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ExperiencePage;
