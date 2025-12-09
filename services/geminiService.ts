
import { GoogleGenAI, Type } from "@google/genai";

const getRandomImage = (id) => `https://picsum.photos/400/300?random=${id}`;

export const fetchHostelsFromGemini = async (city, university) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API Key found. Returning mock data.");
    return getMockHostels(university, city);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 4 realistic hostels or PGs near ${university} in ${city}, India. 
      Include contact details (Indian phone format) and approximate lat/lng coordinates for Google Maps.
      Crucial: Provide a list of room types (e.g., Single, 2-Sharing) with their specific monthly prices in INR.
      Make them sound authentic with Indian amenities (e.g., North/South Indian food, AC/Non-AC).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['DORM', 'PG', 'APARTMENT'] },
              currency: { type: Type.STRING },
              distance: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              reviewCount: { type: Type.INTEGER },
              verified: { type: Type.BOOLEAN },
              amenities: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              address: { type: Type.STRING },
              contact: {
                type: Type.OBJECT,
                properties: {
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING }
                }
              },
              coordinates: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                }
              },
              roomTypes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    description: { type: Type.STRING }
                  },
                  required: ['type', 'price']
                }
              }
            },
            required: ['id', 'name', 'type', 'roomTypes', 'rating', 'amenities', 'description', 'contact', 'coordinates']
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");

    return data.map((item, index) => ({
      ...item,
      id: `gemini-${index}-${Date.now()}`,
      images: [getRandomImage(index + 1), getRandomImage(index + 2)]
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    return getMockHostels(university, city);
  }
};

const getMockHostels = (university, city) => {
  // Simple lat/lng offset based on city for mock data
  const baseLat = 12.9716; // Bangalore-ish default
  const baseLng = 77.5946;

  return [
    {
      id: '1',
      name: 'Sri Sai Student Living',
      type: 'PG',
      currency: '₹',
      distance: '0.5 km',
      rating: 4.2,
      reviewCount: 128,
      verified: true,
      amenities: ['Wifi', '3 Times Food', 'Geyser', 'Washing Machine'],
      images: [getRandomImage(10), getRandomImage(11)],
      description: `Affordable PG walking distance from ${university}. Includes home-style food.`,
      address: `12, 4th Cross, Near ${university}, ${city}`,
      contact: { phone: '+91 98765 43210', email: 'info@srisai.com' },
      coordinates: { lat: baseLat + 0.01, lng: baseLng + 0.01 },
      roomTypes: [
        { type: '3-Sharing Non-AC', price: 8500, description: 'Common Washroom' },
        { type: '2-Sharing AC', price: 12000, description: 'Attached Washroom' },
        { type: 'Single Room', price: 18000, description: 'Private & Spacious' }
      ]
    },
    {
      id: '2',
      name: 'Elite Dorms',
      type: 'DORM',
      currency: '₹',
      distance: '1.2 km',
      rating: 4.5,
      reviewCount: 85,
      verified: true,
      amenities: ['AC', 'Gym', 'Security', 'Power Backup'],
      images: [getRandomImage(12), getRandomImage(13)],
      description: 'Premium student accommodation with modern facilities and 24/7 security.',
      address: `45, Main Road, ${city}`,
      contact: { phone: '+91 99887 76655', email: 'contact@elitedorms.in' },
      coordinates: { lat: baseLat - 0.01, lng: baseLng - 0.01 },
      roomTypes: [
        { type: '4-Sharing Dorm', price: 6500, description: 'Bunk Beds' },
        { type: '2-Sharing Luxury', price: 14000, description: 'Study Table & Wardrobe' }
      ]
    },
    {
      id: '3',
      name: 'Sunshine Apartments',
      type: 'APARTMENT',
      currency: '₹',
      distance: '2.5 km',
      rating: 4.8,
      reviewCount: 42,
      verified: false,
      amenities: ['Private Kitchen', 'Balcony', 'Parking'],
      images: [getRandomImage(14), getRandomImage(15)],
      description: '2BHK flats available on sharing basis for students.',
      address: `88, Green Park, ${city}`,
      contact: { phone: '+91 88776 65544', email: 'rent@sunshine.com' },
      coordinates: { lat: baseLat + 0.02, lng: baseLng - 0.02 },
      roomTypes: [
        { type: 'Single Room in 3BHK', price: 15000, description: 'Shared Hall & Kitchen' },
        { type: 'Master Bedroom', price: 20000, description: 'Attached Balcony' }
      ]
    }
  ];
};
