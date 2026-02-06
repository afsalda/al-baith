import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, CheckCircle2, Lock } from 'lucide-react';
import LoginModal from '../components/LoginModal';
import { ROOMS_DATA } from '../constants';

const BookingPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests') || '1 adult';

    // Parse dates or fallback to mock
    // Parse dates (YYYY-MM-DD) as local time to avoid timezone shifts
    const parseLocalDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const checkInDate = checkInParam ? parseLocalDate(checkInParam) : new Date(2026, 1, 6); // Feb 6, 2026
    const checkOutDate = checkOutParam ? parseLocalDate(checkOutParam) : new Date(2026, 1, 8); // Feb 8, 2026

    // Calculate nights
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const numberOfNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // States for sequential flow
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isPaymentAdded, setIsPaymentAdded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Dynamic room lookup
    const room = ROOMS_DATA.find(r => r.id === id) || ROOMS_DATA[0];
    const originalPrice = room.price * 1.2;

    // Derived costs
    const [userData, setUserData] = useState<{ fullName: string; email: string; phoneNumber: string; countryCode: string } | null>(null);

    // Derived costs
    const basePrice = room.price * numberOfNights;
    const taxes = 330;
    const totalPrice = basePrice + taxes;

    // Format display dates
    const checkInStr = checkInDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const checkOutStr = checkOutDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const handleLogin = () => {
        setIsLoginModalOpen(true);
    };

    const handleLoginSuccess = (data: { fullName: string; email: string; phoneNumber: string; countryCode: string }) => {
        setUserData(data);
        setIsLoginModalOpen(false);
        setIsLoggedIn(true);
    };

    const handleAddPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsPaymentAdded(true);
            setIsProcessing(false);
        }, 1500);
    };

    const handleFinalConfirm = async () => {
        if (!userData) return;

        setIsProcessing(true);

        try {
            // Check-in/out dates formatted as YYYY-MM-DD for backend
            const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const response = await fetch('/api/book-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userData.fullName,
                    email: userData.email,
                    phone: `${userData.countryCode} ${userData.phoneNumber}`,
                    room_type: room.roomType, // Assuming this matches DB expected values or we should use room.roomName
                    check_in: formatDate(checkInDate),
                    check_out: formatDate(checkOutDate)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Booking failed');
            }

            setShowSuccess(true);
        } catch (error: any) {
            console.error('Booking Error:', error);
            alert(`Booking Failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-[#222222]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">You're booked!</h1>
                    <p className="text-neutral-600 mb-8 text-lg">
                        Your reservation for {room.roomName} is confirmed for {numberOfNights} night{numberOfNights > 1 ? 's' : ''}. Details have been sent to your email.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-[#222222] text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition"
                    >
                        Great!
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-[#222222]">
            <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-8 md:py-12">
                {/* Header */}
                <div className="flex items-center gap-6 mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-semibold">Confirm and pay</h1>
                </div>

                <div className="flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-20">
                    {/* Left Column: Sequential steps */}
                    <div className="md:col-span-7 space-y-4">

                        {/* Step 1: Login */}
                        <div className={`bg-white p-8 rounded-2xl border ${isLoggedIn ? 'border-neutral-200 bg-neutral-50/30' : 'border-neutral-200 shadow-sm'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-lg font-semibold ${isLoggedIn ? 'text-neutral-500' : 'text-[#222222]'}`}>
                                    1. Log in or sign up
                                </span>
                                {isLoggedIn ? (
                                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Logged in</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleLogin}
                                        disabled={isProcessing}
                                        className="bg-[#E31C5F] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Checking...' : 'Continue'}
                                    </button>
                                )}
                            </div>
                            {isLoggedIn && (
                                <p className="mt-2 text-sm text-neutral-500">Connected as guest@al-baith.com</p>
                            )}
                        </div>

                        {/* Step 2: Payment */}
                        <div className={`bg-white p-8 rounded-2xl border transition-all duration-300 ${isLoggedIn ? (isPaymentAdded ? 'border-neutral-200 bg-neutral-50/30' : 'border-neutral-200 shadow-sm') : 'border-neutral-100 opacity-40'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-lg font-semibold ${!isLoggedIn ? 'text-neutral-400' : (isPaymentAdded ? 'text-neutral-500' : 'text-[#222222]')}`}>
                                    2. Add a payment method
                                </span>
                                {!isLoggedIn && <Lock className="w-5 h-5 text-neutral-300" />}
                                {isLoggedIn && !isPaymentAdded && (
                                    <button
                                        onClick={handleAddPayment}
                                        disabled={isProcessing}
                                        className="bg-[#222222] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-black transition active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Adding...' : 'Add payment'}
                                    </button>
                                )}
                                {isLoggedIn && isPaymentAdded && (
                                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Visa •••• 4242</span>
                                    </div>
                                )}
                            </div>
                            {isLoggedIn && !isPaymentAdded && (
                                <p className="mt-4 text-sm text-neutral-600">Secure payment via Al-Baith encrypted gateway.</p>
                            )}
                        </div>

                        {/* Step 3: Review */}
                        <div className={`bg-white p-8 rounded-2xl border transition-all duration-300 ${isPaymentAdded ? 'border-neutral-200 shadow-sm' : 'border-neutral-100 opacity-40'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <span className={`text-lg font-semibold ${!isPaymentAdded ? 'text-neutral-400' : 'text-[#222222]'}`}>
                                    3. Review your reservation
                                </span>
                                {!isPaymentAdded && <Lock className="w-5 h-5 text-neutral-300" />}
                            </div>

                            {isPaymentAdded && (
                                <div className="space-y-6">
                                    <div className="p-4 border border-neutral-200 rounded-xl space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold underline">Price details</span>
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            By selecting the button below, you agree to the Host's House Rules and Al-Baith's Rebooking and Refund Policy.
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleFinalConfirm}
                                        disabled={isProcessing}
                                        className="w-full bg-[#E31C5F] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 shadow-xl"
                                    >
                                        {isProcessing ? 'Finalizing...' : 'Confirm and pay'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Dynamic summary card */}
                    <div className="md:col-span-5 relative">
                        <div className="md:sticky md:top-24 border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-6">
                            {/* Room Info */}
                            <div className="flex gap-4 items-start">
                                <div className="w-28 h-24 bg-neutral-100 rounded-xl overflow-hidden shrink-0">
                                    <img src={room.imageUrl} className="w-full h-full object-cover" alt="Room" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-[15px] leading-tight text-[#222222]">{room.roomName}</p>
                                    <div className="flex items-center gap-1 text-[13px] text-[#222222]">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span>{room.rating} ({room.reviewCount})</span>
                                        {room.rating >= 4.8 && (
                                            <span className="flex items-center gap-1 before:content-['·'] before:mr-1">
                                                <svg viewBox="0 0 32 32" className="w-3 h-3 fill-current"><path d="M16 1.67a14.33 14.33 0 1 0 14.33 14.33A14.33 14.33 0 0 0 16 1.67zm0 27.16a12.83 12.83 0 1 1 12.83-12.83A12.83 12.83 0 0 1 16 28.83zm-4.32-15.16l2.36 2.36 5.3-5.3 1.06 1.06-6.36 6.36-3.42-3.42z" /></svg>
                                                Guest favourite
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-neutral-100" />

                            {/* Cancellation */}
                            <p className="text-[14px] leading-relaxed">
                                Cancel before check-in 24 hours before check-in for a partial refund. <Link to="/cancellation-policy" className="underline font-semibold cursor-pointer">Full policy</Link>
                            </p>

                            <hr className="border-neutral-100" />

                            {/* Dates & Guests summary */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="text-[14px]">
                                        <p className="font-semibold">Dates</p>
                                        <p>{checkInStr} – {checkOutStr}</p>
                                    </div>
                                    <button onClick={() => navigate(-1)} className="bg-[#F7F7F7] px-4 py-2 rounded-lg text-[14px] font-semibold">Change</button>
                                </div>
                                <div className="flex justify-between items-center text-[14px]">
                                    <div>
                                        <p className="font-semibold">Guests</p>
                                        <p>{guestsParam}</p>
                                    </div>
                                    <button onClick={() => navigate(-1)} className="bg-[#F7F7F7] px-4 py-2 rounded-lg text-[14px] font-semibold">Change</button>
                                </div>
                            </div>

                            <hr className="border-neutral-100" />

                            {/* Price labels */}
                            <div className="space-y-4">
                                <h3 className="text-[22px] font-semibold">Price details</h3>
                                <div className="space-y-3 text-[16px]">
                                    <div className="flex justify-between">
                                        <span>{numberOfNights} nights x ₹{room.price.toLocaleString()}</span>
                                        <div className="flex gap-2">
                                            <span className="text-neutral-400 line-through">₹{(originalPrice * numberOfNights).toLocaleString()}</span>
                                            <span>₹{basePrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="underline">Taxes</span>
                                        <span>₹{taxes}</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-neutral-100" />

                            {/* Total row */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[16px] font-semibold">
                                    <span>Total (INR)</span>
                                    <span>₹{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <button className="text-[14px] font-semibold underline">Price breakdown</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </div>
    );
};

export default BookingPage;
