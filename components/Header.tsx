
import React from 'react';
import { Home, User, Menu, ShieldCheck, MessageCircle, Shield } from 'lucide-react';
import Button from './Button';

const Header = ({ 
  onLoginClick, 
  onHomeClick, 
  onCommunityClick,
  onListPropertyClick,
  onAdminClick,
  isLoggedIn, 
  username,
  isAdmin,
  activeView
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onHomeClick}>
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Home className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            FindMyDorm
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={onHomeClick} 
            className={`text-sm font-medium transition-colors ${activeView === 'home' || activeView === 'listings' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            Find Dorms
          </button>
          <button 
            onClick={onCommunityClick}
            className={`text-sm font-medium transition-colors ${activeView === 'community' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            Community QA
          </button>
          
          {isAdmin ? (
             <button 
                onClick={onAdminClick}
                className={`text-sm font-bold flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${activeView === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'}`}
             >
                <Shield className="w-4 h-4" /> Admin Dashboard
             </button>
          ) : (
             <button onClick={onListPropertyClick} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                List Your Property
             </button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
             <div className="flex items-center gap-2 cursor-pointer group relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold relative ${isAdmin ? 'bg-gray-800 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                    {username ? username[0].toUpperCase() : 'U'}
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white">
                        <ShieldCheck className="w-2.5 h-2.5 text-white" />
                    </div>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{username}</span>
                <button onClick={onLoginClick} className="absolute top-full right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg p-2 text-sm text-red-500 w-24 hidden group-hover:block">
                    Logout
                </button>
             </div>
          ) : (
            <>
              <Button variant="ghost" onClick={onLoginClick} className="hidden sm:inline-flex">Log In</Button>
              <Button variant="primary" onClick={onLoginClick}>Sign Up</Button>
            </>
          )}
          <button className="md:hidden p-2 text-gray-600" onClick={onCommunityClick}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
