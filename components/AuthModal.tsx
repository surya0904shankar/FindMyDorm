
import React, { useState } from 'react';
import { X, Mail, Lock, User, Upload, CheckCircle, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [studentId, setStudentId] = useState('');
  const [idFile, setIdFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isSupabaseConfigured()) {
            if (isLogin) {
                // Supabase Login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                
                if (error) throw error;
                // Session listener in App.tsx will handle the state update
                onClose();
            } else {
                // Supabase Signup
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: username,
                            college: college,
                            verified: false // Defaults to false
                        }
                    }
                });

                if (error) throw error;
                
                if (data.user) {
                    // Create Profile Entry
                    await supabase.from('profiles').insert({
                        id: data.user.id,
                        name: username,
                        email: email,
                        college: college,
                        verified: false
                    });
                    
                    alert("Check your email for confirmation link!");
                    onClose();
                }
            }
        } else {
            // Mock Fallback Logic (If Supabase not connected)
            const isVerified = !isLogin && !!idFile && !!year && !!studentId;
            onLogin({
                id: 'mock-user-id',
                name: username || email.split('@')[0] || 'Student',
                verified: isVerified, 
                college: college || 'University',
                isAdmin: false, 
                email: email
            });
            onClose();
        }
    } catch (err) {
        setError(err.message || "An error occurred");
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 h-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {isLogin ? 'Welcome Back' : 'Student Registration'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
              </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Student Registration Fields */}
            {!isLogin && (
              <>
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-gray-700">Full Name</label>
                   <div className="relative">
                     <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                     <input 
                       type="text" 
                       required
                       value={username}
                       onChange={(e) => setUsername(e.target.value)}
                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                       placeholder="Rahul Sharma"
                     />
                   </div>
                 </div>
                 
                 <div className="space-y-1">
                   <label className="text-sm font-medium text-gray-700">College Name</label>
                   <input 
                     type="text" 
                     required
                     value={college}
                     onChange={(e) => setCollege(e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                     placeholder="e.g. IIT Madras"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Year</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                required
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="2024"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Student ID #</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                required
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="CS101"
                            />
                        </div>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Verification Document</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2">
                            {idFile ? (
                                <>
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    <span className="text-sm text-emerald-600 font-medium">{idFile.name}</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-gray-400" />
                                    <span className="text-sm text-gray-500">Upload College ID Card</span>
                                    <span className="text-xs text-gray-400">(Required for "Verified Student" badge)</span>
                                </>
                            )}
                        </div>
                    </div>
                 </div>
               </>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="student@college.edu"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5 mt-2" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up & Verify')}
            </Button>
          </form>
            
          <div className="mt-6 flex flex-col gap-3 text-center text-sm text-gray-600">
            <div>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                {isLogin ? 'Sign up' : 'Log in'}
                </button>
            </div>
            {!isSupabaseConfigured() && (
                <div className="text-xs text-orange-500 mt-2">
                    Note: Database not connected. Using local mock mode.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
