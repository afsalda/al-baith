
import React from 'react';
import { Property } from '../types';

interface ListingCardProps {
  property: Property;
}

const ListingCard: React.FC<ListingCardProps> = ({ property }) => {
  return (
    <div className="col-span-1 cursor-pointer group">
      <div className="flex flex-col gap-2 w-full">
        <div className="aspect-square w-full relative overflow-hidden rounded-2xl">
          <img
            src={property.image}
            alt={property.title}
            className="object-cover h-full w-full group-hover:scale-105 transition duration-500"
          />
          
          {/* Guest Favourite Badge */}
          {property.isGuestFavorite && (
            <div className="absolute top-3 left-3 bg-white border border-neutral-300 px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <span className="text-[12px] font-bold text-neutral-800">Guest favourite</span>
            </div>
          )}

          {/* Heart Icon */}
          <div className="absolute top-3 right-3 p-1">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white drop-shadow-xl hover:scale-110 transition" fill="rgba(0,0,0,0.4)" stroke="white" strokeWidth="2">
              <path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95s-3.158-2.05-4.95-2.05c-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05s-2.051 3.158-2.051 4.95c0 7 7 12.267 14 17z"></path>
            </svg>
          </div>
        </div>

        <div className="flex flex-col pt-1">
          <div className="flex flex-row justify-between items-start">
            <h3 className="font-bold text-[15px] truncate pr-2">{property.title}</h3>
          </div>
          <div className="text-[14px] text-neutral-500 flex items-center gap-1">
             ₹{property.price.toLocaleString()} for {property.distance || '2 nights'} • ★ {property.rating}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
