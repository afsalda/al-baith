import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleContinue = () => {
        if (phoneNumber.length < 5) return;
        setIsProcessing(true);
        // Simulate login
        setTimeout(() => {
            setIsProcessing(false);
            onLoginSuccess();
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
                            className="bg-white w-full max-w-[568px] rounded-[32px] overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative h-16 flex items-center justify-center border-b border-neutral-200">
                                <button
                                    onClick={onClose}
                                    className="absolute left-6 p-2 hover:bg-neutral-100 rounded-full transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <h2 className="font-bold text-[#222222]">Log in or sign up to book</h2>
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="border border-neutral-400 rounded-xl overflow-hidden">
                                        {/* Country Selector */}
                                        <div className="p-4 border-b border-neutral-200 relative cursor-pointer hover:bg-neutral-50 transition">
                                            <div className="text-[12px] text-neutral-500 uppercase font-medium">Country/Region</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-base text-[#222222]">India (+91)</span>
                                                <ChevronDown className="w-5 h-5 text-neutral-500" />
                                            </div>
                                        </div>
                                        {/* Phone Input */}
                                        <div className="p-4 relative">
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="Phone number"
                                                className="w-full text-base text-[#222222] outline-none placeholder-neutral-500"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-[12px] text-neutral-600 leading-relaxed">
                                        We’ll call or text you to confirm your number. Standard message and data rates apply. <span className="underline font-semibold cursor-pointer">Privacy Policy</span>
                                    </p>
                                </div>

                                <button
                                    onClick={handleContinue}
                                    disabled={phoneNumber.length < 5 || isProcessing}
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
