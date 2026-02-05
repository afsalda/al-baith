import * as React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Wifi, Coffee, Tv, Wind } from "lucide-react";
import { ROOMS_DATA } from "../constants";
import { Room } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

// Room interfaces removed, now imported from ../types

interface RoomsProps {
    heading?: string;
    subheading?: string;
    rooms?: Room[];
}

const RoomCard: React.FC<{ room: Room }> = ({ room }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/room/${room.id}`);
    };

    const handleBookNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/room/${room.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm transition-all duration-300 ease-in-out hover:y-[-4px] hover:shadow-lg cursor-pointer"
        >
            <div className="relative h-52 w-full overflow-hidden">
                <img
                    src={room.imageUrl}
                    alt={room.imageAlt}
                    className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                {room.available && (
                    <Badge className="absolute right-3 top-3 bg-green-500 text-white hover:bg-green-600">
                        Available
                    </Badge>
                )}
            </div>

            <div className="flex flex-col flex-grow p-5 space-y-4">
                <div className="space-y-2">
                    <span className="text-sm text-gray-500">{room.roomType}</span>
                    <h3 className="text-xl font-bold tracking-tight">{room.roomName}</h3>

                    <div className="flex items-center text-gray-500">
                        <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{room.location}</span>
                    </div>

                    <div className="flex items-center text-gray-500">
                        <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{room.rating.toFixed(1)}</span>
                        <span className="ml-1.5 text-sm">({room.reviewCount.toLocaleString()} Reviews)</span>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3 flex-grow">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{room.beds}</span>
                        <span>{room.size}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {room.features.slice(0, 4).map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md"
                            >
                                {feature.icon}
                                <span>{feature.label}</span>
                            </div>
                        ))}
                        {room.features.length > 4 && (
                            <div className="text-xs text-gray-400 self-center">+{room.features.length - 4} more</div>
                        )}
                    </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">From</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">
                                {room.currency}{room.price}
                            </span>
                        </div>
                    </div>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/booking/${room.id}`);
                        }}
                        size="sm"
                        className="bg-gold-glow text-amber-950 border-none font-semibold px-6"
                    >
                        Book Now
                    </Button>
                </div>
            </div>
        </div>
    );
};


const Rooms: React.FC<RoomsProps> = ({
    heading = "Available Rooms",
    subheading = "Choose from our selection of comfortable and well-equipped rooms",
    rooms = ROOMS_DATA,
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 md:px-8">
                <div className="mb-12 text-center">
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="mb-4 text-3xl font-bold tracking-tight md:text-5xl"
                    >
                        {heading}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                        className="text-lg text-gray-600 max-w-2xl mx-auto"
                    >
                        {subheading}
                    </motion.p>
                </div>

                <div
                    className="grid gap-8 md:grid-cols-2 lg:grid-cols-2"
                >
                    {rooms.map((room) => (
                        <div key={room.id}>
                            <RoomCard room={room} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Rooms;
