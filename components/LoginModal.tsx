import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (userData: { fullName: string; email: string; phoneNumber: string; countryCode: string }) => void;
    mode: 'login' | 'signup';
}

const COUNTRIES = [
    { code: 'IN', name: 'India', dial_code: '+91' },
    { code: 'US', name: 'United States', dial_code: '+1' },
    { code: 'AE', name: 'United Arab Emirates', dial_code: '+971' },
    { code: 'GB', name: 'United Kingdom', dial_code: '+44' },
    { code: 'SA', name: 'Saudi Arabia', dial_code: '+966' },
    { code: 'CA', name: 'Canada', dial_code: '+1' },
    { code: 'AU', name: 'Australia', dial_code: '+61' },
    { code: 'DE', name: 'Germany', dial_code: '+49' },
    { code: 'FR', name: 'France', dial_code: '+33' },
    { code: 'QA', name: 'Qatar', dial_code: '+974' },
];

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess, mode }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Country Logic
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setFullName('');
            setEmail('');
            setPhoneNumber('');
            setIsProcessing(false);
            setShowCountryDropdown(false);
            setSelectedCountry(COUNTRIES[0]);
        }
    }, [isOpen]);

    const handleContinue = () => {
        if (!fullName.trim() || !email.trim() || phoneNumber.length < 5) return;
        setIsProcessing(true);
        // Simulate login
        setTimeout(() => {
            setIsProcessing(false);
            onLoginSuccess({
                fullName,
                email,
                phoneNumber,
                countryCode: selectedCountry.dial_code
            });
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-[568px] rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative h-16 flex items-center justify-center border-b border-neutral-200 shrink-0">
                                <button
                                    onClick={onClose}
                                    className="absolute left-6 p-2 hover:bg-neutral-100 rounded-full transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <h2 className="font-bold text-[#222222]">
                                    {mode === 'signup' ? 'Sign up' : 'Log in'}
                                </h2>
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Welcome to Al-Baith</h3>

                                    <div className="space-y-4">
                                        {/* Full Name Input */}
                                        <div className="border border-neutral-400 rounded-xl px-4 py-2 relative focus-within:ring-1 focus-within:ring-black focus-within:border-black">
                                            <label className="text-xs text-neutral-500 absolute top-2 left-4">Full Name</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pt-4 pb-1 text-base text-[#222222] outline-none placeholder-neutral-500 bg-transparent"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        {/* Email Input */}
                                        <div className="border border-neutral-400 rounded-xl px-4 py-2 relative focus-within:ring-1 focus-within:ring-black focus-within:border-black">
                                            <label className="text-xs text-neutral-500 absolute top-2 left-4">Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pt-4 pb-1 text-base text-[#222222] outline-none placeholder-neutral-500 bg-transparent"
                                                placeholder="email@example.com"
                                            />
                                        </div>

                                        {/* Phone Input Group */}
                                        <div className="border border-neutral-400 rounded-xl overflow-visible focus-within:ring-1 focus-within:ring-black focus-within:border-black relative">
                                            {/* Country Selector */}
                                            <div
                                                className="p-4 border-b border-neutral-200 relative cursor-pointer hover:bg-neutral-50 transition"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                            >
                                                <div className="text-[12px] text-neutral-500 uppercase font-medium">Country/Region</div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-base text-[#222222]">{selectedCountry.name} ({selectedCountry.dial_code})</span>
                                                    <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>

                                            {/* Country Dropdown */}
                                            <AnimatePresence>
                                                {showCountryDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute top-[80px] left-0 right-0 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 max-h-[200px] overflow-y-auto"
                                                    >
                                                        {COUNTRIES.map((country) => (
                                                            <div
                                                                key={country.code}
                                                                onClick={() => {
                                                                    setSelectedCountry(country);
                                                                    setShowCountryDropdown(false);
                                                                }}
                                                                className="px-4 py-3 hover:bg-neutral-50 cursor-pointer flex justify-between items-center text-sm"
                                                            >
                                                                <span className="font-medium text-[#222222]">{country.name}</span>
                                                                <span className="text-neutral-500">{country.dial_code}</span>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="px-4 py-2 relative">
                                                <input
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="Phone number"
                                                    className="w-full py-2 text-base text-[#222222] outline-none placeholder-neutral-500 bg-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[12px] text-neutral-600 leading-relaxed">
                                        We’ll call or text you to confirm your number. Standard message and data rates apply. <span className="underline font-semibold cursor-pointer">Privacy Policy</span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleContinue}
                                    disabled={!fullName.trim() || !email.trim() || phoneNumber.length < 5 || isProcessing}
                                    className="w-full bg-[#E31C5F] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 shadow-md"
                                >
                                    {isProcessing ? 'Continue...' : 'Continue'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;
