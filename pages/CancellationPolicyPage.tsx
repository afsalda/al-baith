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
                {/* Cancellation Rule */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        Cancellation Rule
                    </h2>
                    <div className="pl-5 border-l border-neutral-100">
                        <p className="text-lg text-neutral-800 font-medium mb-4">
                            Cancellation is allowed only if requested at least 24 hours before the scheduled check-in time (12:00 PM on the arrival date).
                        </p>
                        <p className="text-neutral-600">
                            Requests made less than 24 hours before check-in will not be eligible for a refund.
                        </p>
                    </div>
                </section>

                {/* Refund Rules */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        Refund Rules
                    </h2>
                    <div className="space-y-6 pl-5 border-l border-neutral-100">
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">Full Refunds</h3>
                            <p className="text-neutral-600">Eligible cancellations processed before the 24-hour cutoff will receive a full refund, minus any standard processing fees if applicable.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-neutral-800 mb-2">Processing Time</h3>
                            <p className="text-neutral-600">Refunds are typically processed within 5-7 business days back to the original payment method.</p>
                        </div>
                    </div>
                </section>

                {/* No-Show Policy */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        No-Show Policy
                    </h2>
                    <div className="pl-5 border-l border-neutral-100">
                        <p className="text-neutral-600">
                            Failure to arrive at the property without prior cancellation will be treated as a no-show. In such cases, the entire booking amount will be forfeited, and no refund will be issued.
                        </p>
                    </div>
                </section>

                {/* Contact for Support */}
                <section className="bg-neutral-50 p-8 rounded-2xl border border-neutral-100">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                        <span className="w-2 h-2 bg-neutral-900 rounded-full mr-3"></span>
                        Contact Support
                    </h2>
                    <p className="text-neutral-600 mb-8">To request a cancellation or for any questions, please contact our support team:</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                            <span className="text-neutral-500 font-medium">Phone</span>
                            <span className="text-neutral-900">____________________</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                            <span className="text-neutral-500 font-medium">WhatsApp</span>
                            <span className="text-neutral-900">____________________</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                            <span className="text-neutral-500 font-medium">Email</span>
                            <span className="text-neutral-900">____________________</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Padding */}
            <div className="h-20"></div>
        </div>
    );
};

export default CancellationPolicyPage;
