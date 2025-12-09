
import React from 'react';
import { MapPin, Star, ShieldCheck, Wifi, Coffee } from 'lucide-react';
import Button from './Button';

const ListingCard = ({ hostel, onClick }) => {
  // Calculate lowest price
  const lowestPrice = hostel.roomTypes && hostel.roomTypes.length > 0 
    ? Math.min(...hostel.roomTypes.map(r => r.price))
    : 0;

  return (
    <div 
      className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={hostel.images[0]} 
          alt={hostel.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hostel.verified && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3 h-3" />
            VERIFIED
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded">
          {hostel.type}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {hostel.name}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">
            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-bold">{hostel.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{hostel.distance}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
            {hostel.amenities.slice(0, 3).map((am, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    {am}
                </span>
            ))}
            {hostel.amenities.length > 3 && (
                <span className="text-xs bg-gray-50 text-gray-400 px-2 py-1 rounded-md">
                    +{hostel.amenities.length - 3}
                </span>
            )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Starts from</span>
            <span className="text-lg font-bold text-indigo-900">
              {hostel.currency}{lowestPrice.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span>
            </span>
          </div>
          <Button variant="outline" size="sm">View Details</Button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
