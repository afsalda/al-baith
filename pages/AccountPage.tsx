import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AccountPageProps {
    user: { fullName: string; email: string; phoneNumber: string; countryCode: string } | null;
}

const AccountPage: React.FC<AccountPageProps> = ({ user }) => {
    const [formData, setFormData] = useState({
        legalName: user?.fullName || 'Guest',
        email: user?.email || 'guest@example.com',
        phoneNumber: user ? `${user.countryCode} ${user.phoneNumber}` : '',
    });

    const [isEditing, setIsEditing] = useState<string | null>(null);

    const handleSave = (field: string) => {
        setIsEditing(null);
        // Logic to save would go here
    };

    return (
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-10">
            {/* Breadcrumb / Back */}
            <div className="mb-8">
                <Link to="/" className="text-sm font-semibold text-neutral-800 hover:underline">Account</Link>
                <h1 className="text-3xl font-bold text-neutral-900 mt-2">Personal info</h1>
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-12">
                {/* Left Column: Form */}
                <div className="w-full md:w-2/3 space-y-6">

                    {/* Legal Name */}
                    <div className="border-b border-neutral-200 py-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h2 className="text-base font-semibold text-neutral-900">Legal Name</h2>
                                {isEditing === 'legalName' ? (
                                    <div className="mt-4">
                                        <p className="text-sm text-neutral-500 mb-4">This is the name on your travel document, which could be a license or a passport.</p>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs font-semibold text-neutral-600 block mb-1">First name</label>
                                                <input
                                                    type="text"
                                                    value={formData.legalName.split(' ')[0]}
                                                    onChange={(e) => setFormData({ ...formData, legalName: `${e.target.value} ${formData.legalName.split(' ')[1] || ''}` })}
                                                    className="w-full p-3 border border-neutral-400 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-neutral-600 block mb-1">Last name</label>
                                                <input
                                                    type="text"
                                                    value={formData.legalName.split(' ')[1] || ''}
                                                    onChange={(e) => setFormData({ ...formData, legalName: `${formData.legalName.split(' ')[0]} ${e.target.value}` })}
                                                    className="w-full p-3 border border-neutral-400 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleSave('legalName')}
                                                className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(null)}
                                                className="text-neutral-800 font-semibold underline hover:text-neutral-600 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-neutral-500 mt-1">{formData.legalName}</p>
                                )}
                            </div>
                            {isEditing !== 'legalName' && (
                                <button
                                    onClick={() => setIsEditing('legalName')}
                                    className="text-neutral-900 underline font-medium hover:text-neutral-600"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="border-b border-neutral-200 py-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h2 className="text-base font-semibold text-neutral-900">Email address</h2>
                                {isEditing === 'email' ? (
                                    <div className="mt-4">
                                        <p className="text-sm text-neutral-500 mb-4">Use an address you’ll always have access to.</p>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full p-3 border border-neutral-400 rounded-lg mb-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                        />
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleSave('email')}
                                                className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(null)}
                                                className="text-neutral-800 font-semibold underline hover:text-neutral-600 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-neutral-500 mt-1">{formData.email}</p>
                                )}
                            </div>
                            {isEditing !== 'email' && (
                                <button
                                    onClick={() => setIsEditing('email')}
                                    className="text-neutral-900 underline font-medium hover:text-neutral-600"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="border-b border-neutral-200 py-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h2 className="text-base font-semibold text-neutral-900">Phone number</h2>
                                {isEditing === 'phoneNumber' ? (
                                    <div className="mt-4">
                                        <p className="text-sm text-neutral-500 mb-4">Add a number so confirmed guests and Airbnb can get in touch. You can add other numbers and choose how they’re used.</p>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="w-full p-3 border border-neutral-400 rounded-lg mb-4 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                        />
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleSave('phoneNumber')}
                                                className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(null)}
                                                className="text-neutral-800 font-semibold underline hover:text-neutral-600 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-neutral-500 mt-1">{formData.phoneNumber}</p>
                                )}
                            </div>
                            {isEditing !== 'phoneNumber' && (
                                <button
                                    onClick={() => setIsEditing('phoneNumber')}
                                    className="text-neutral-900 underline font-medium hover:text-neutral-600"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Other info placeholders */}
                    <div className="border-b border-neutral-200 py-6">
                        <div className="flex justify-between items-center text-neutral-900">
                            <div>
                                <h2 className="text-base font-semibold">Government ID</h2>
                                <p className="text-neutral-500 mt-1">Provided</p>
                            </div>
                            <span className="text-neutral-300 font-medium">Remove</span>
                        </div>
                    </div>
                    <div className="py-6">
                        <div className="flex justify-between items-center text-neutral-900">
                            <div>
                                <h2 className="text-base font-semibold">Address</h2>
                                <p className="text-neutral-500 mt-1">Not provided</p>
                            </div>
                            <button className="text-neutral-900 underline font-medium hover:text-neutral-600">Edit</button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Info Box */}
                <div className="w-full md:w-1/3">
                    <div className="border border-neutral-200 rounded-2xl p-6 bg-white sticky top-32">
                        <Lock className="w-8 h-8 text-[#FF385C] mb-4" />
                        <h3 className="text-lg font-bold mb-3">Why isn’t my info shown here?</h3>
                        <p className="text-neutral-500 text-sm leading-relaxed mb-4">
                            We’re hiding some account details to protect your identity.
                        </p>
                        <div className="border-t border-neutral-200 pt-4 mb-4">
                            <h3 className="text-lg font-bold mb-3">Which details can be edited?</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                Details Airbnb uses to verify your identity can’t be changed. Contact info and some personal details can be edited, but we may ask you to verify your identity the next time you book or create a listing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
