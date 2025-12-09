
import React, { useState } from 'react';
import Button from './Button';
import { Check, X, Shield, Eye, Trash2, Users, Building, AlertCircle } from 'lucide-react';

const AdminDashboard = ({ submissions, onApproveProperty, onRejectProperty }) => {
  const [activeTab, setActiveTab] = useState('requests');
  
  // Mock users for demonstration
  const [users, setUsers] = useState([
    { id: 'u1', name: 'Rahul Sharma', verified: true, college: 'IIT Madras', email: 'rahul@iitm.ac.in' },
    { id: 'u2', name: 'Priya Verma', verified: false, college: 'SRM', email: 'priya@srm.edu.in' },
    { id: 'u3', name: 'Arun Kumar', verified: true, college: 'Anna Univ', email: 'arun@annauniv.edu' },
  ]);

  const toggleVerification = (index) => {
    const newUsers = [...users];
    newUsers[index].verified = !newUsers[index].verified;
    setUsers(newUsers);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-600">Manage listings, verify students, and moderate content.</p>
        </div>
        <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5" /> Super Admin
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'requests' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
                <Building className="w-4 h-4" /> Property Requests ({submissions.length})
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
                <Users className="w-4 h-4" /> User Verification
            </button>
        </div>

        <div className="p-6">
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {submissions.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <Building className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No pending property submissions.</p>
                        </div>
                    ) : (
                        submissions.map(sub => {
                            const lowestPrice = sub.roomTypes && sub.roomTypes.length > 0 
                                ? Math.min(...sub.roomTypes.map(r => r.price))
                                : 0;
                                
                            return (
                                <div key={sub.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-gray-900">{sub.propertyName}</h3>
                                                <span className="bg-gray-100 text-xs font-bold px-2 py-0.5 rounded text-gray-600">{sub.type}</span>
                                            </div>
                                            <p className="text-sm text-gray-500">{sub.address}, {sub.city}</p>
                                            <p className="text-sm text-gray-500 mt-1">Owner: {sub.ownerName} ({sub.contactPhone})</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-indigo-600">
                                                {lowestPrice > 0 ? `Starts ₹${lowestPrice}` : 'Price N/A'}
                                            </div>
                                            <div className="text-xs text-gray-400">{sub.images.length} photos attached</div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mb-4">
                                        {sub.description}
                                    </div>

                                    <div className="flex gap-3">
                                        <Button size="sm" onClick={() => onApproveProperty(sub)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                            <Check className="w-4 h-4 mr-1" /> Approve & List
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => onRejectProperty(sub.id)} className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
                                            <X className="w-4 h-4 mr-1" /> Reject
                                        </Button>
                                        <Button size="sm" variant="ghost">
                                            <Eye className="w-4 h-4 mr-1" /> View Files
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {activeTab === 'users' && (
                <div>
                     <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm">Verification Policy</h4>
                            <p className="text-xs text-blue-700 mt-1">Only verify users after reviewing their submitted college ID card. Unverified users cannot post with the "Verified Student" badge.</p>
                        </div>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                                    <th className="py-3 pl-2">User</th>
                                    <th className="py-3">College</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3 text-right pr-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => (
                                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                        <td className="py-3 pl-2">
                                            <div className="font-medium text-gray-900">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="py-3 text-sm text-gray-600">{u.college}</td>
                                        <td className="py-3">
                                            {u.verified ? (
                                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                                                    <Shield className="w-3 h-3" /> Verified
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full w-fit">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 text-right pr-2">
                                            <Button 
                                                size="sm" 
                                                variant={u.verified ? 'outline' : 'primary'}
                                                onClick={() => toggleVerification(i)}
                                                className={u.verified ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
                                            >
                                                {u.verified ? 'Revoke' : 'Verify'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
