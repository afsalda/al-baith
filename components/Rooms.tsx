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
        <motion.div
            onClick={handleCardClick}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg cursor-pointer"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="relative h-64 w-full overflow-hidden">
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

            <div className="flex flex-col p-6 space-y-4">
                <div className="space-y-2">
                    <span className="text-sm text-gray-500">{room.roomType}</span>
                    <h3 className="text-2xl font-bold tracking-tight">{room.roomName}</h3>

                    <div className="flex items-center text-gray-500">
                        <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{room.location}</span>
                    </div>

                    <div className="flex items-center text-gray-500">
                        <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{room.rating.toFixed(1)}</span>
                        <span className="ml-1.5 text-sm">({room.reviewCount.toLocaleString()} Reviews)</span>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{room.beds}</span>
                        <span>{room.size}</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {room.features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1.5 text-sm text-gray-500"
                            >
                                {feature.icon}
                                <span>{feature.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">From</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-gray-900">
                                {room.currency}{room.price}
                            </span>
                            <span className="text-sm text-gray-500">/night + taxes</span>
                        </div>
                    </div>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/booking/${room.id}`);
                        }}
                        size="lg"
                        className="bg-gold-glow text-amber-950 border-none"
                    >
                        Book Now
                    </Button>
                </div>
            </div>
        </motion.div>
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

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-8 md:grid-cols-2 lg:grid-cols-2"
                >
                    {rooms.map((room) => (
                        <motion.div key={room.id} variants={itemVariants}>
                            <RoomCard room={room} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Rooms;
