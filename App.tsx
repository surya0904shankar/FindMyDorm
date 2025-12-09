
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import ListPropertyModal from './components/ListPropertyModal';
import ListingCard from './components/ListingCard';
import ListingDetail from './components/ListingDetail';
import CommunityFeed from './components/CommunityFeed';
import AdminDashboard from './components/AdminDashboard';
import FilterBar from './components/FilterBar';
import Button from './components/Button';
import { Search, MapPin, School, Loader2 } from 'lucide-react';
import { CITIES } from './types';
import { supabase, isSupabaseConfigured, fetchHostels } from './services/supabaseService';

const App = () => {
  // State
  const [view, setView] = useState('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [listPropertyOpen, setListPropertyOpen] = useState(false);
  
  const [user, setUser] = useState(null);
  
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedUni, setSelectedUni] = useState(null);
  
  const [hostels, setHostels] = useState([]);
  const [propertySubmissions, setPropertySubmissions] = useState([]);
  
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 20000,
    minRating: 0,
    maxDistance: 5
  });

  // Supabase Auth Listener (Syncs across devices/tabs)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
            fetchProfile(session.user.id, session.user.email);
        }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId, email) => {
      // In a real app, verify details from 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
          setUser({
              id: userId,
              name: data.name || email?.split('@')[0] || 'User',
              email: email,
              verified: data.verified,
              college: data.college,
              isAdmin: data.is_admin
          });
      } else {
           setUser({
              id: userId,
              name: email?.split('@')[0] || 'User',
              email: email,
              verified: false,
              isAdmin: false
          });
      }
  };

  const handleLogin = (userProfile) => {
      setUser(userProfile);
      if (userProfile.isAdmin) {
          setView('admin');
      }
  };
  
  const handleLogout = async () => {
      if (isSupabaseConfigured()) {
          await supabase.auth.signOut();
      }
      setUser(null);
      setView('home');
  };

  const handleSearch = async () => {
    if (!selectedCity) return;
    
    setLoading(true);
    setView('listings');
    
    // Fetch from Supabase
    const dbHostels = await fetchHostels(selectedCity.name);
    setHostels(dbHostels);
    
    setLoading(false);
  };

  // Filter Logic
  const filteredHostels = useMemo(() => {
      return hostels.filter(hostel => {
          // 1. Price Filter (Check if any room type is within budget)
          const lowestPrice = hostel.roomTypes.length > 0 
            ? Math.min(...hostel.roomTypes.map(r => r.price))
            : 0;
          const isPriceMatch = lowestPrice <= filters.maxPrice;

          // 2. Rating Filter
          const isRatingMatch = hostel.rating >= filters.minRating;

          // 3. Distance Filter (Parse "1.2 km" -> 1.2)
          const distanceVal = parseFloat(hostel.distance.replace(/[^\d.]/g, ''));
          const isDistanceMatch = !isNaN(distanceVal) ? distanceVal <= filters.maxDistance : true;

          return isPriceMatch && isRatingMatch && isDistanceMatch;
      });
  }, [hostels, filters]);

  const handleHostelClick = (hostel) => {
    setSelectedHostel(hostel);
    setView('detail');
    window.scrollTo(0,0);
  };
  
  const handlePropertySubmit = (submission) => {
      setPropertySubmissions([...propertySubmissions, submission]);
      alert("Property submitted successfully! Admin will review it shortly.");
  };

  const handleApproveProperty = (sub) => {
      // In a real implementation, this would insert into 'hostels' table in Supabase
      alert("Please implement Supabase insert for Admin Approval in production.");
      setPropertySubmissions(propertySubmissions.filter(s => s.id !== sub.id));
  };

  const handleRejectProperty = (id) => {
      setPropertySubmissions(propertySubmissions.filter(s => s.id !== id));
  };

  const resetSearch = () => {
    setView('home');
    setHostels([]);
    setSelectedHostel(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header 
        onLoginClick={() => user ? handleLogout() : setAuthOpen(true)} 
        onHomeClick={resetSearch}
        onCommunityClick={() => setView('community')}
        onListPropertyClick={() => setListPropertyOpen(true)}
        onAdminClick={() => setView('admin')}
        isLoggedIn={!!user}
        username={user?.name}
        isAdmin={user?.isAdmin}
        activeView={view}
      />

      <main className="container mx-auto px-4 py-8">
        
        {/* VIEW: HOME / HERO SEARCH */}
        {view === 'home' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-in fade-in zoom-in duration-500">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Find your hostel <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                near your campus.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12">
              Discover verified PGs & Dorms in Chennai, Bangalore, Mumbai & more. Read reviews from verified students.
            </p>

            <div className="w-full max-w-4xl bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  onChange={(e) => {
                    const city = CITIES.find(c => c.id === e.target.value) || null;
                    setSelectedCity(city);
                    setSelectedUni(null);
                  }}
                  value={selectedCity?.id || ''}
                >
                  <option value="" disabled>Select City</option>
                  {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex-1 relative">
                <School className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none disabled:opacity-50"
                  disabled={!selectedCity}
                  onChange={(e) => {
                    const uni = selectedCity?.universities.find(u => u.id === e.target.value) || null;
                    setSelectedUni(uni);
                  }}
                  value={selectedUni?.id || ''}
                >
                  <option value="" disabled>Select University</option>
                  {selectedCity?.universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <Button 
                size="lg" 
                onClick={handleSearch} 
                disabled={!selectedCity || !selectedUni}
                className="w-full md:w-auto"
              >
                <Search className="w-5 h-5 mr-2" /> Search
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-gray-400">
               {!isSupabaseConfigured() && (
                   <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full">Database connection missing. Search will return empty results.</span>
               )}
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">50+</span>
                    <span className="text-sm">Indian Cities</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">10k+</span>
                    <span className="text-sm">Verified Students</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">0%</span>
                    <span className="text-sm">Brokerage</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-gray-900">24/7</span>
                    <span className="text-sm">Safety Support</span>
                </div>
            </div>
          </div>
        )}

        {/* VIEW: LISTINGS */}
        {view === 'listings' && (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 border-b border-gray-200 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {loading ? 'Searching...' : `Stays near ${selectedUni?.name}`}
                    </h2>
                    <p className="text-gray-500">{loading ? 'Searching database...' : `Found ${filteredHostels.length} verified listings`}</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="outline" size="sm" onClick={resetSearch}>Change Search</Button>
                </div>
             </div>

             <FilterBar 
                filters={filters} 
                onFilterChange={setFilters} 
                resultCount={filteredHostels.length}
             />

             {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                    <p className="text-gray-500">Curating the best hostels for you...</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredHostels.map(hostel => (
                        <ListingCard 
                            key={hostel.id} 
                            hostel={hostel} 
                            onClick={() => handleHostelClick(hostel)} 
                        />
                    ))}
                    {filteredHostels.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                             No hostels found in database for this location. 
                             <br/><span className="text-xs">Tip: Add hostels via Admin or populate the 'hostels' table.</span>
                        </div>
                    )}
                </div>
             )}
          </div>
        )}

        {/* VIEW: DETAIL */}
        {view === 'detail' && selectedHostel && (
            <ListingDetail 
                key={selectedHostel.id}
                hostel={selectedHostel} 
                onBack={() => setView('listings')}
                user={user}
                onRequireAuth={() => setAuthOpen(true)}
                onUpdateHostel={(updated) => {
                    const updatedHostels = hostels.map(h => h.id === updated.id ? updated : h);
                    setHostels(updatedHostels);
                    setSelectedHostel(updated);
                }}
            />
        )}

        {/* VIEW: COMMUNITY */}
        {view === 'community' && (
            <CommunityFeed user={user} />
        )}
        
        {/* VIEW: ADMIN */}
        {view === 'admin' && (
            <AdminDashboard 
                submissions={propertySubmissions}
                onApproveProperty={handleApproveProperty}
                onRejectProperty={handleRejectProperty}
            />
        )}

      </main>

      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onLogin={handleLogin} 
      />
      
      <ListPropertyModal
        isOpen={listPropertyOpen}
        onClose={() => setListPropertyOpen(false)}
        onSubmit={handlePropertySubmit}
      />

      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>&copy; 2024 FindMyDorm. Made with ❤️ in India.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
