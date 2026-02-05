import React from 'react';
import { Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfilePageProps {
    user: { fullName: string; email: string; phoneNumber: string; countryCode: string } | null;
    onOpenLogin: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onOpenLogin }) => {
    if (!user) {
        return (
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 px-4 py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8 text-neutral-400" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Profile Protection</h1>
                <p className="text-neutral-500 max-w-md mb-8">
                    Your profile information is private. Please log in or sign up to view your details.
                </p>
                {/* Visual cue to use the navbar login, now also a button */}
                <button
                    onClick={onOpenLogin}
                    className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition shadow-md"
                >
                    Log in
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto px-4 md:px-8 py-20">
            <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Profile Image / Avatar */}
                    <div className="shrink-0 relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-black rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
                            {user.fullName.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 w-full text-center md:text-left space-y-4">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-neutral-900 mb-1">{user.fullName}</h2>
                            <p className="text-neutral-500 font-medium">Guest</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col items-start gap-1 p-3 bg-neutral-50 rounded-xl">
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Email Address</span>
                                <span className="text-neutral-900 font-medium break-all">{user.email}</span>
                            </div>

                            <div className="flex flex-col items-start gap-1 p-3 bg-neutral-50 rounded-xl">
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Phone Number</span>
                                <span className="text-neutral-900 font-medium">{user.countryCode} {user.phoneNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
