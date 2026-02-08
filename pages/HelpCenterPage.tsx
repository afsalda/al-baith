import React from 'react';
import { Link } from 'react-router-dom';

const HelpCenterPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-['Inter',_sans-serif]">
            {/* Simple Header */}
            <div className="max-w-4xl mx-auto px-6 pt-16 pb-8 border-b border-neutral-100">
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">Help Center</h1>
                <p className="text-neutral-500">Find answers to common questions about your stay.</p>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
                {/* Booking */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        Booking
                    </h2>
                    <div className="space-y-8 pl-5 border-l border-neutral-100">
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">How do I book a room?</h3>
                            <p className="text-neutral-600">You can book a room by sending a booking request via email.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">Can I cancel my booking?</h3>
                            <p className="text-neutral-600">Yes, bookings can be cancelled. Please refer to our <Link to="/cancellation-policy" className="text-neutral-900 underline font-semibold">Cancellation Policy</Link> for details.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">Is advance payment required?</h3>
                            <p className="text-neutral-600">Yes, advance payment is required to confirm the booking.</p>
                        </div>
                    </div>
                </section>

                {/* Stay Information */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        Stay Information
                    </h2>
                    <div className="space-y-8 pl-5 border-l border-neutral-100">
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">What is the check-in time?</h3>
                            <p className="text-neutral-600">Check-in time is 12:00 PM.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">What is the check-out time?</h3>
                            <p className="text-neutral-600">Check-out time is 11:00 AM.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">Is an extra bed available?</h3>
                            <p className="text-neutral-600">Extra bed facility is available for Suite and Deluxe rooms only.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">What amenities are included?</h3>
                            <p className="text-neutral-600 mb-2">All rooms include:</p>
                            <ul className="grid grid-cols-2 gap-2 text-neutral-600 font-medium">
                                <li className="flex items-center">• AC</li>
                                <li className="flex items-center">• WiFi</li>
                                <li className="flex items-center">• TV</li>
                                <li className="flex items-center">• Heater</li>
                                <li className="flex items-center">• Power backup</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Rules */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        Rules
                    </h2>
                    <div className="space-y-8 pl-5 border-l border-neutral-100">
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">Is smoking allowed?</h3>
                            <p className="text-neutral-600">Yes, smoking is allowed.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">Are visitors allowed?</h3>
                            <p className="text-neutral-600">Yes, visitors are allowed.</p>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-neutral-50 p-8 rounded-2xl border border-neutral-100">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        Contact
                    </h2>
                    <p className="text-neutral-600 mb-8">For any questions or booking assistance, please contact us:</p>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2 pb-3 border-b border-neutral-200">
                            <span className="text-neutral-500 font-medium">Call / WhatsApp</span>
                            <div className="flex flex-col gap-1">
                                <a href="https://wa.me/916238304411" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-semibold hover:text-amber-800 hover:underline">6238-304411</a>
                                <a href="https://wa.me/918848805197" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-semibold hover:text-amber-800 hover:underline">8848805197</a>
                                <a href="https://wa.me/919447290936" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-semibold hover:text-amber-800 hover:underline">9447290936</a>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                            <span className="text-neutral-500 font-medium">Email</span>
                            <a href="mailto:contact@al-baith.com" className="text-neutral-900 font-semibold hover:text-amber-800 hover:underline">contact@al-baith.com</a>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-500 font-medium">Support Hours</span>
                            <span className="text-neutral-900 font-semibold">24/7</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Padding */}
            <div className="h-20"></div>
        </div>
    );
};

export default HelpCenterPage;
