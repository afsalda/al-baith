import React from 'react';
import { Property } from '../types';
import { motion } from 'framer-motion';

interface ActivityCardProps {
    activity: Property;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
    const isComingSoon = activity.comingSoon;

    return (
        <motion.div
            className="col-span-1 cursor-pointer group"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col gap-2 w-full">
                <div className="aspect-[4/3] w-full relative overflow-hidden rounded-2xl">
                    <img
                        src={activity.image}
                        alt={activity.title}
                        className="object-cover h-full w-full group-hover:scale-105 transition duration-500"
                    />

                    {/* Guest Favourite Badge */}
                    {activity.isGuestFavorite && (
                        <div className="absolute top-3 left-3 bg-white border border-neutral-300 px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                            <span className="text-[12px] font-bold text-neutral-800">Guest favourite</span>
                        </div>
                    )}

                    {/* Coming Soon Badge */}
                    {isComingSoon && (
                        <div className="absolute top-3 right-3 bg-gold-glow px-3 py-1 rounded-full shadow-lg border border-amber-300/30">
                            <span className="text-[12px] font-bold text-amber-950">Coming Soon</span>
                        </div>
                    )}

                    {/* Heart Icon */}
                    {!isComingSoon && (
                        <div className="absolute top-3 right-3 p-1">
                            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white drop-shadow-xl hover:scale-110 transition" fill="rgba(0,0,0,0.4)" stroke="white" strokeWidth="2">
                                <path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95s-3.158-2.05-4.95-2.05c-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05s-2.051 3.158-2.051 4.95c0 7 7 12.267 14 17z"></path>
                            </svg>
                        </div>
                    )}
                </div>

                <div className="flex flex-col pt-1">
                    <div className="flex flex-row justify-between items-start">
                        <h3 className="font-bold text-[15px] truncate pr-2">{activity.title}</h3>
                    </div>
                    <div className="text-[13px] text-neutral-500 truncate">{activity.location}</div>
                    <div className="text-[14px] text-neutral-700 mt-1">
                        {isComingSoon ? (
                            <span className="text-neutral-500 italic">Price TBA</span>
                        ) : (
                            <>
                                <span className="font-semibold">₹{activity.price.toLocaleString()}</span>
                                <span className="text-neutral-500"> per person</span>
                            </>
                        )}
                        {activity.rating && (
                            <span className="ml-2">• ★ {activity.rating}</span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityCard;
