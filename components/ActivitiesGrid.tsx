import React from 'react';
import { motion } from 'framer-motion';
import ActivityCard from './ActivityCard';
import { Property } from '../types';

interface ActivitiesGridProps {
    activities: Property[];
    heading?: string;
    subheading?: string;
}

const ActivitiesGrid: React.FC<ActivitiesGridProps> = ({
    activities,
    heading = 'Unforgettable Experiences',
    subheading = 'Discover unique activities and cultural experiences curated just for you'
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
        <section className="py-12 md:py-16 bg-white">
            <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 px-4">
                <div className="mb-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="mb-3 text-3xl font-bold tracking-tight md:text-4xl"
                    >
                        {heading}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                        className="text-base text-neutral-600 max-w-2xl mx-auto"
                    >
                        {subheading}
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
                >
                    {activities.map((activity) => (
                        <motion.div key={activity.id} variants={itemVariants}>
                            <ActivityCard activity={activity} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ActivitiesGrid;
