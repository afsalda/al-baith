import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Heart, Share2, Wifi, Tv, Wind, Coffee, Users, Home, Calendar, Shield, Award, Clock, Droplets, Zap, Armchair, Moon, Flame, Bath, Sparkles, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROOMS_DATA } from '../constants';
import CompactCalendar from '../components/CompactCalendar';

interface RoomDetails {
    id: string;
    name: string;
    type: string;
    location: string;
    rating: number;
    reviewCount: number;
    price: number;
    currency: string;
    images: string[];
    guests: number;
    bedrooms: number;
    bathrooms: number;
    beds: string;
    size: string;
    description: string;
    host: {
        name: string;
        image: string;
        yearsHosting: number;
        superhost: boolean;
    };
    highlights: Array<{
        icon: React.ReactNode;
        title: string;
        description: string;
    }>;
    amenities: Array<{
        icon: React.ReactNode;
        title: string;
        description: string;
    }>;
    isGuestFavorite: boolean;
}

// Mock data - in real app, this would come from API


const RoomDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [saved, setSaved] = useState(false);
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
    const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
    const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
    const [guests, setGuests] = useState('1 guest');

    const handleReserve = () => {
        if (!checkInDate || !checkOutDate) {
            alert('Please select both check-in and check-out dates to continue.');
            return;
        }

        // Check if same day
        if (checkInDate.toDateString() === checkOutDate.toDateString()) {
            alert('Same-day check-in and check-out is not allowed. Please select at least one night.');
            return;
        }

        // Check if out is before in (Already handled by minDate in UI, but good for safety)
        if (checkOutDate < checkInDate) {
            alert('Check-out date must be after check-in date.');
            return;
        }

        // Format for URL
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        navigate(`/booking/${id}?checkIn=${formatDate(checkInDate)}&checkOut=${formatDate(checkOutDate)}&guests=${guests}`);
    };

    const toggleCheckIn = () => {
        setShowCheckInCalendar(!showCheckInCalendar);
        setShowCheckOutCalendar(false);
    };

    const toggleCheckOut = () => {
        setShowCheckOutCalendar(!showCheckOutCalendar);
        setShowCheckInCalendar(false);
    };

    // Find room from constants
    const foundRoom = ROOMS_DATA.find(r => r.id === id) || ROOMS_DATA[0];

    // Adapter to match RoomDetails Page expectations
    const room = {
        ...foundRoom,
        name: foundRoom.roomName,
        type: foundRoom.roomType,
        images: [
            foundRoom.imageUrl,
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80",
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        ],
        host: {
            name: "Al Baith Resthouse",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256",
            isSuperhost: true,
            yearsHosting: 5,
            superhost: true // Add alias for compatibility
        },
        description: "Experience the epitome of luxury in our meticulously designed room. Featuring locally sourced wooden furniture, traditional Kerala art, and modern amenities, this space offers a perfect blend of comfort and culture. Wake up to the sound of birds and enjoy your morning coffee with a stunning view.",
        amenities: foundRoom.features.map(f => ({
            icon: f.icon,
            title: f.label,
            description: "Included in your stay"
        })),
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        highlights: [
            {
                icon: <Award className="w-6 h-6" />,
                title: 'Guest favourite',
                description: 'One of the most loved homes on Al-Baith',
            },
            {
                icon: <Shield className="w-6 h-6" />,
                title: 'Free cancellation',
                description: 'Flexible refund policy available',
            }
        ],
        isGuestFavorite: true
    };

    if (!room) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Room not found</h2>
                    <button onClick={() => navigate('/')} className="text-[#C79D27] hover:underline">
                        Return to home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="max-w-[1120px] mx-auto px-6 md:px-10 pt-6">
                {/* Title and Actions */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-semibold mb-2">{room.name}</h1>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-semibold">{room.rating}</span>
                                <span className="text-gray-600">({room.reviewCount} reviews)</span>
                            </div>
                            <span className="text-gray-600">·</span>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span className="font-semibold underline cursor-pointer">{room.location}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm font-semibold underline">Share</span>
                            </button>
                            <button
                                onClick={() => setSaved(!saved)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <Heart className={`w-4 h-4 ${saved ? 'fill-[#C79D27] text-[#C79D27]' : ''}`} />
                                <span className="text-sm font-semibold underline">Save</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="mb-6 md:mb-12">
                    <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden h-[300px] md:h-[400px]">
                        {/* Main Image */}
                        <div className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer" onClick={() => setShowAllPhotos(true)}>
                            <img
                                src={room.images[0]}
                                alt={room.name}
                                className="w-full h-full object-cover hover:brightness-95 transition"
                            />
                        </div>
                        {/* Grid Images */}
                        {room.images.slice(1, 5).map((image, index) => (
                            <div
                                key={index}
                                className="hidden md:block relative cursor-pointer"
                                onClick={() => setShowAllPhotos(true)}
                            >
                                <img
                                    src={image}
                                    alt={`${room.name} ${index + 2}`}
                                    className="w-full h-full object-cover hover:brightness-95 transition"
                                />
                                {index === 3 && (
                                    <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg border border-gray-900 font-semibold text-sm hover:bg-gray-100 transition flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        Show all photos
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Mobile "Show all photos" floating link */}
                    <div className="md:hidden mt-2 flex justify-end">
                        <button
                            onClick={() => setShowAllPhotos(true)}
                            className="bg-white border border-neutral-800 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                        >
                            Show all photos
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        {/* Room Info */}
                        <div className="pb-8 border-b">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-semibold mb-2">
                                        {room.type} in {room.location.split(',')[0]}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span>{room.guests} guests</span>
                                        <span>·</span>
                                        <span>{room.bedrooms} bedroom</span>
                                        <span>·</span>
                                        <span>{room.beds}</span>
                                        <span>·</span>
                                        <span>{room.bathrooms} bathroom</span>
                                    </div>
                                </div>
                                <img
                                    src={room.host.image}
                                    alt={room.host.name}
                                    className="w-14 h-14 rounded-full"
                                />
                            </div>
                        </div>

                        {/* Guest Favorite Badge */}
                        {room.isGuestFavorite && (
                            <div className="py-8 border-b">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="text-2xl">❤️</div>
                                    <div>
                                        <h3 className="font-semibold">Rare find! This place is usually booked</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Highlights */}
                        <div className="py-8 border-b space-y-6">
                            {room.highlights.map((highlight, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="text-gray-900 mt-1">{highlight.icon}</div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{highlight.title}</h3>
                                        <p className="text-gray-600 text-sm">{highlight.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="py-8 border-b">
                            <p className="text-gray-700 leading-relaxed">{room.description}</p>
                        </div>

                        {/* Amenities */}
                        <div className="py-8 border-b">
                            <h2 className="text-2xl font-semibold mb-6">What this place offers</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {room.amenities.map((amenity, index) => (
                                    <div key={index} className="flex items-center gap-4 py-3">
                                        <div className="text-gray-600">{amenity.icon}</div>
                                        <span>{amenity.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Things to know */}
                        <div className="py-8 border-b">
                            <h2 className="text-2xl font-semibold mb-6">Things to know</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-2">House rules</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>Check-in: 12:00 PM</li>
                                        <li>Checkout: 11:00 PM</li>
                                        <li>No smoking</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Safety & Property</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>Security camera/recording device</li>
                                        <li>Carbon monoxide alarm not reported</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Host Info */}
                        <div className="py-8">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={room.host.image}
                                    alt={room.host.name}
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <h3 className="text-xl font-semibold">Hosted by {room.host.name}</h3>
                                    <p className="text-gray-600">{room.host.yearsHosting} years hosting</p>
                                </div>
                            </div>
                            {room.host.superhost && (
                                <div className="flex items-center gap-2 text-gray-700 mb-4">
                                    <Award className="w-5 h-5" />
                                    <span className="font-semibold">Superhost</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-gray-300 rounded-xl shadow-xl p-6"
                            >
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-2xl font-semibold">{room.currency}{room.price.toLocaleString()}</span>
                                        <span className="text-gray-600">night + taxes</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-semibold">{room.rating}</span>
                                        <span className="text-gray-600">·</span>
                                        <span className="text-gray-600 underline">{room.reviewCount} reviews</span>
                                    </div>
                                </div>

                                {/* Date Inputs */}
                                <div className="grid grid-cols-2 border border-gray-400 rounded-lg mb-4 overflow-visible relative">
                                    <div className="p-3 border-r border-gray-400 relative">
                                        <div className="text-xs font-semibold mb-1">CHECK-IN</div>
                                        <input
                                            type="text"
                                            readOnly
                                            placeholder="Add date"
                                            className="text-sm w-full outline-none cursor-pointer bg-transparent"
                                            value={checkInDate ? checkInDate.toLocaleDateString() : ''}
                                            onClick={toggleCheckIn}
                                        />
                                        {showCheckInCalendar && (
                                            <CompactCalendar
                                                selectedDate={checkInDate}
                                                onDateSelect={(date) => setCheckInDate(date)}
                                                onClose={() => setShowCheckInCalendar(false)}
                                                minDate={new Date()}
                                            // Mobile adjustment: position centrally or leave absolute
                                            />
                                        )}
                                    </div>
                                    <div className="p-3 relative">
                                        <div className="text-xs font-semibold mb-1">CHECKOUT</div>
                                        <input
                                            type="text"
                                            readOnly
                                            placeholder="Add date"
                                            className="text-sm w-full outline-none cursor-pointer bg-transparent"
                                            value={checkOutDate ? checkOutDate.toLocaleDateString() : ''}
                                            onClick={toggleCheckOut}
                                        />
                                        {showCheckOutCalendar && (
                                            <CompactCalendar
                                                selectedDate={checkOutDate}
                                                onDateSelect={(date) => setCheckOutDate(date)}
                                                onClose={() => setShowCheckOutCalendar(false)}
                                                minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date()}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Guests */}
                                <div className="border border-gray-400 rounded-lg p-3 mb-6">
                                    <div className="text-xs font-semibold mb-1">GUESTS</div>
                                    <select
                                        className="text-sm w-full outline-none cursor-pointer bg-transparent"
                                        value={guests}
                                        onChange={(e) => setGuests(e.target.value)}
                                    >
                                        <option>1 guest</option>
                                        <option>2 guests</option>
                                        <option>3 guests</option>
                                        <option>4 guests</option>
                                    </select>
                                </div>

                                {/* Reserve Button */}
                                <button
                                    onClick={handleReserve}
                                    className="w-full bg-gold-glow text-amber-950 py-3 rounded-lg font-semibold hover:opacity-90 transition mb-4 shadow-lg border-none"
                                >
                                    Reserve
                                </button>


                            </motion.div>

                            {/* Report Listing */}
                            <div className="mt-6 text-center">
                                <button className="text-sm text-gray-600 underline hover:text-gray-900 flex items-center gap-2 mx-auto">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                    Report this listing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Footer */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between z-40">
                <div>
                    <div className="flex items-center gap-1">
                        <span className="text-lg font-bold">{room.currency}{room.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">night + taxes</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{room.rating}</span>
                        <span className="text-gray-500 underline">{room.reviewCount}</span>
                    </div>
                </div>
                <button
                    onClick={handleReserve}
                    className="bg-gold-glow text-amber-950 px-8 py-3 rounded-lg font-bold shadow-md"
                >
                    Reserve
                </button>
            </div>
            {/* Full Screen Image Gallery Modal */}
            {showAllPhotos && (
                <div className="fixed inset-0 bg-white z-[60] overflow-y-auto">
                    <div className="max-w-5xl mx-auto px-6 py-4">
                        <div className="sticky top-0 bg-white pt-4 pb-6 flex items-center justify-between z-10">
                            <button
                                onClick={() => setShowAllPhotos(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex gap-4">
                                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                                    <Heart className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
                            {room.images.map((image, index) => (
                                <div key={index} className={`relative ${index % 3 === 0 ? 'md:col-span-2' : ''}`}>
                                    <img
                                        src={image}
                                        alt={`${room.name} ${index + 1}`}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomDetailsPage;
