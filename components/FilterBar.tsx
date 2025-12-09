
import React from 'react';
import { Filter, IndianRupee, Star, MapPin } from 'lucide-react';

const FilterBar = ({ filters, onFilterChange, resultCount }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
        <Filter className="w-4 h-4 text-indigo-600" />
        <h3 className="font-bold text-gray-800 text-sm">Filters</h3>
        <span className="ml-auto text-xs text-gray-500">{resultCount} properties found</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Price Range */}
        <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 flex items-center justify-between">
                <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Max Monthly Rent</span>
                <span className="text-indigo-600 font-bold">₹{filters.maxPrice.toLocaleString()}</span>
            </label>
            <input 
                type="range" 
                min="3000" 
                max="30000" 
                step="500"
                value={filters.maxPrice}
                onChange={(e) => handleChange('maxPrice', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
                <span>₹3k</span>
                <span>₹30k+</span>
            </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Star className="w-3 h-3" /> Minimum Rating
            </label>
            <div className="flex gap-2">
                {[3, 3.5, 4, 4.5].map((rating) => (
                    <button
                        key={rating}
                        onClick={() => handleChange('minRating', rating)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            filters.minRating === rating 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {rating}+
                    </button>
                ))}
                <button
                        onClick={() => handleChange('minRating', 0)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            filters.minRating === 0
                            ? 'bg-gray-800 text-white border-gray-800' 
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                    >
                        All
                    </button>
            </div>
        </div>

        {/* Distance */}
        <div className="space-y-2">
             <label className="text-xs font-medium text-gray-600 flex items-center justify-between">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Max Distance from Campus</span>
                <span className="text-indigo-600 font-bold">{filters.maxDistance} km</span>
            </label>
            <select 
                value={filters.maxDistance}
                onChange={(e) => handleChange('maxDistance', parseInt(e.target.value))}
                className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
                <option value={1}>Within 1 km (Walking)</option>
                <option value={3}>Within 3 km</option>
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={20}>Any distance</option>
            </select>
        </div>

      </div>
    </div>
  );
};

export default FilterBar;
