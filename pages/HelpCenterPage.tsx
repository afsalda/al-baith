import React from 'react';
import { Search, HelpCircle, FileQuestion, MessageCircle, Phone } from 'lucide-react';

const HelpCenterPage: React.FC = () => {
    const categories = [
        { icon: <FileQuestion className="w-6 h-6 text-amber-600" />, title: 'Booking & Trips', desc: 'Manage your reservations' },
        { icon: <HelpCircle className="w-6 h-6 text-amber-600" />, title: 'Account & Profile', desc: 'Login and settings' },
        { icon: <MessageCircle className="w-6 h-6 text-amber-600" />, title: 'Contact Host', desc: 'Communication tips' },
        { icon: <Phone className="w-6 h-6 text-amber-600" />, title: 'Safety & Trust', desc: 'Secure payments & stays' },
    ];

    const faqs = [
        { q: 'How do I cancel my booking?', a: 'Go to your Trips page, select the reservation, and click Cancel.' },
        { q: 'What payment methods are accepted?', a: 'We accept all major credit cards, PayPal, and Apple Pay.' },
        { q: 'How do I contact the host?', a: 'You can message the host directly from the listing page or your trips.' },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-neutral-100 py-12 md:py-20 px-4 text-center">
                <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">How can we help?</h1>
                <div className="max-w-2xl mx-auto relative">
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        className="w-full py-4 pl-12 pr-4 rounded-full border border-neutral-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-lg"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-6 h-6" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="p-6 border border-neutral-200 rounded-xl hover:shadow-lg transition cursor-pointer group">
                            <div className="mb-4 p-3 bg-amber-50 rounded-full w-fit group-hover:bg-amber-100 transition">
                                {cat.icon}
                            </div>
                            <h3 className="font-bold text-lg mb-2">{cat.title}</h3>
                            <p className="text-neutral-500">{cat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* FAQs */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8 text-center md:text-left">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border-b border-neutral-100 pb-6">
                                <h3 className="text-lg font-semibold mb-2 text-neutral-800">{faq.q}</h3>
                                <p className="text-neutral-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Footer */}
                <div className="mt-20 py-10 border-t border-neutral-200 text-center">
                    <p className="text-neutral-500 mb-4">Still need help?</p>
                    <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
