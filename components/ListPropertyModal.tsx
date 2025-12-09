
import React, { useState } from 'react';
import { X, Upload, Home, MapPin, Phone, IndianRupee, FileText, Plus, Trash2, Send } from 'lucide-react';
import Button from './Button';

const ListPropertyModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    ownerName: '',
    propertyName: '',
    type: 'PG',
    city: 'Chennai',
    address: '',
    contactPhone: '',
    contactEmail: '',
    description: '',
  });
  
  const [amenities, setAmenities] = useState([]);
  const [roomTypes, setRoomTypes] = useState([{ type: '', price: 0, description: '' }]);

  if (!isOpen) return null;

  const toggleAmenity = (amenity) => {
    setAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleRoomChange = (index, field, value) => {
    const newRooms = [...roomTypes];
    newRooms[index][field] = value;
    setRoomTypes(newRooms);
  };

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { type: '', price: 0, description: '' }]);
  };

  const removeRoomType = (index) => {
    if (roomTypes.length > 1) {
        setRoomTypes(roomTypes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct Email Body
    const subject = `New Property Listing Request: ${formData.propertyName}`;
    const body = `
Dear Admin (suryas0904@gmail.com),

I would like to list my property on FindMyDorm.

--- Property Details ---
Owner Name: ${formData.ownerName}
Property Name: ${formData.propertyName}
Type: ${formData.type}
City: ${formData.city}
Address: ${formData.address}

--- Contact Info ---
Phone: ${formData.contactPhone}
Email: ${formData.contactEmail}

--- Description ---
${formData.description}

--- Amenities ---
${amenities.join(', ')}

--- Room Configurations & Pricing ---
${roomTypes.map(r => `- ${r.type}: ₹${r.price} (${r.description})`).join('\n')}

---------------------------
Please review my details and contact me for verification.
`;

    // Open Mail Client
    window.location.href = `mailto:suryas0904@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    onClose();
    // Reset form
    setFormData({
      ownerName: '', propertyName: '', type: 'PG', city: 'Chennai', 
      address: '', contactPhone: '', contactEmail: '', description: ''
    });
    setAmenities([]);
    setRoomTypes([{ type: '', price: 0, description: '' }]);
  };

  const amenityOptions = ['Wifi', 'AC', 'Food', 'Laundry', 'Gym', 'Security', 'Power Backup', 'Geyser'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">List Your Property</h2>
            <p className="text-sm text-gray-500">Submit details for admin verification via Email.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="property-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Info */}
            <section className="space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Property Name</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input 
                            required
                            value={formData.propertyName}
                            onChange={e => setFormData({...formData, propertyName: e.target.value})}
                            className="w-full pl-9 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Sri Sai Residency"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Property Type</label>
                        <select 
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="PG">PG (Paying Guest)</option>
                            <option value="DORM">Dormitory</option>
                            <option value="APARTMENT">Flat/Apartment</option>
                        </select>
                    </div>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Owner Name</label>
                        <input 
                            required
                            value={formData.ownerName}
                            onChange={e => setFormData({...formData, ownerName: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Full Name"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <select 
                            value={formData.city}
                            onChange={e => setFormData({...formData, city: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            {['Chennai', 'Bangalore', 'Hyderabad', 'Trichy', 'Delhi', 'Mumbai'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Full Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <textarea 
                            required
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            className="w-full pl-9 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-16 resize-none"
                            placeholder="#12, Gandhi Road, Near Main Campus..."
                        />
                    </div>
                </div>
            </section>

            {/* Room Configurations */}
            <section className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-gray-900">Room Types & Pricing</h3>
                    <Button type="button" size="sm" variant="secondary" onClick={addRoomType}>
                        <Plus className="w-4 h-4 mr-1" /> Add Room Type
                    </Button>
                </div>
                
                {roomTypes.map((room, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                        {roomTypes.length > 1 && (
                            <button 
                                type="button" 
                                onClick={() => removeRoomType(index)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Type (e.g. 2-Sharing AC)</label>
                                <input 
                                    required
                                    value={room.type}
                                    onChange={e => handleRoomChange(index, 'type', e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="Room Type"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Price (₹/mo)</label>
                                <input 
                                    required
                                    type="number"
                                    value={room.price || ''}
                                    onChange={e => handleRoomChange(index, 'price', Number(e.target.value))}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="Price"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-600">Description</label>
                                <input 
                                    value={room.description || ''}
                                    onChange={e => handleRoomChange(index, 'description', e.target.value)}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="e.g. Attached Bath"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Contact & Extra */}
            <section className="space-y-4">
                 <h3 className="font-bold text-gray-900 border-b pb-2">Contact & Amenities</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Owner Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input 
                            required
                            value={formData.contactPhone}
                            onChange={e => setFormData({...formData, contactPhone: e.target.value})}
                            className="w-full pl-9 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Owner Email</label>
                        <input 
                            type="email"
                            required
                            value={formData.contactEmail}
                            onChange={e => setFormData({...formData, contactEmail: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="owner@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                        {amenityOptions.map(am => (
                            <button
                                key={am}
                                type="button"
                                onClick={() => toggleAmenity(am)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                    amenities.includes(am) 
                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {am}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <textarea 
                            required
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full pl-9 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                            placeholder="Describe your property, rules, and nearby landmarks..."
                        />
                    </div>
                </div>
            </section>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" form="property-form" variant="primary" className="flex items-center gap-2">
                <Send className="w-4 h-4" /> Send Request to Admin
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ListPropertyModal;
