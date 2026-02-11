import React from 'react';

const CancellationPolicyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-['Inter',_sans-serif]">
            {/* Header */}
            <div className="max-w-4xl mx-auto px-6 pt-16 pb-8 border-b border-neutral-100">
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">Cancellation Policy</h1>
                <p className="text-neutral-500">Please review our rules regarding booking cancellations and refunds.</p>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
                {/* How to Request a Cancellation */}
                <section className="bg-amber-50 border border-amber-200 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center">
                        <span className="text-3xl mr-3">📞</span>
                        How to Request a Cancellation
                    </h2>
                    <p className="text-amber-800 mb-6 text-lg">
                        To ensure secure processing, we do not accept cancellations via the website.
                        <strong> You must contact us directly via phone or email.</strong>
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm transition hover:shadow-md">
                            <div className="flex items-center mb-3">
                                <span className="text-2xl mr-3">📞</span>
                                <h3 className="font-bold text-gray-900">Call Us</h3>
                            </div>
                            <p className="text-gray-600 mb-3 text-sm">Fastest way for immediate assistance</p>
                            <a href="tel:+916238304411" className="block text-xl font-bold text-amber-700 hover:underline mb-1">
                                +91 6238-304411
                            </a>
                            <div className="text-sm text-gray-500 mt-2 flex items-center">
                                <span className="mr-2">⏰</span> 9:00 AM - 9:00 PM (IST)
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm transition hover:shadow-md">
                            <div className="flex items-center mb-3">
                                <span className="text-2xl mr-3">📧</span>
                                <h3 className="font-bold text-gray-900">Email Us</h3>
                            </div>
                            <p className="text-gray-600 mb-3 text-sm">For non-urgent modifications</p>
                            <a href="mailto:albaith.booking@gmail.com" className="block text-lg font-bold text-amber-700 hover:underline break-all">
                                albaith.booking@gmail.com
                            </a>
                            <p className="text-xs text-gray-400 mt-2">Response within 24 hours</p>
                        </div>
                    </div>
                </section>

                {/* Cancellation Rules */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        Cancellation Terms
                    </h2>
                    <div className="pl-5 border-l-2 border-neutral-200 ml-1 space-y-6">
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800 mb-2">⏱️ 24-Hour Free Cancellation</h3>
                            <p className="text-neutral-600">
                                You may cancel your booking free of charge up to <strong>24 hours before your scheduled check-in time</strong> (12:00 PM on arrival date).
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-neutral-800 mb-2">💸 Late Cancellations</h3>
                            <p className="text-neutral-600">
                                Cancellations made <strong>within 24 hours</strong> of check-in are not eligible for a refund and may incur a charge equal to the first night's stay.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Refund Policy */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        Refund Policy
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="text-green-600 mr-3 font-bold">✓</span>
                                <span className="text-neutral-700">Full refunds (minus standard processing fees) are issued for timely cancellations.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-600 mr-3 font-bold">ℹ️</span>
                                <span className="text-neutral-700">Refunds are typically processed to the original payment method within <strong>5-7 business days</strong>.</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* No-Show Policy */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        No-Show Policy
                    </h2>
                    <div className="pl-5 border-l-2 border-red-200 ml-1">
                        <p className="text-neutral-600">
                            Failure to check in without prior notice is considered a <strong>No-Show</strong>.
                            The entire booking amount will be forfeited, and the reservation will be released.
                        </p>
                    </div>
                </section>
            </div>

            {/* Footer Padding */}
            <div className="h-20"></div>
        </div>
    );
};

export default CancellationPolicyPage;
