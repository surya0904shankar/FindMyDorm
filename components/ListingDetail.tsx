
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star, ShieldCheck, User, MessageCircle, Send, CheckCircle2, Phone, Mail, Image as ImageIcon, Trash2, Upload, BedDouble, Calendar } from 'lucide-react';
import Button from './Button';
import { fetchReviews, postReview, fetchHostelQuestions, postQuestion, postAnswer, fileToBase64 } from '../services/supabaseService';

const ListingDetail = ({ hostel, onBack, user, onRequireAuth, onUpdateHostel }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingQA, setLoadingQA] = useState(false);

  // QA Input State
  const [newQuestion, setNewQuestion] = useState('');
  const [qaImage, setQaImage] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [replyOpen, setReplyOpen] = useState({});

  // Review Input State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState([]);

  // Initial Fetch
  useEffect(() => {
    const loadData = async () => {
        setLoadingReviews(true);
        setLoadingQA(true);
        
        // Parallel Fetch
        const [fetchedReviews, fetchedQuestions] = await Promise.all([
            fetchReviews(hostel.id),
            fetchHostelQuestions(hostel.id)
        ]);

        setReviews(fetchedReviews);
        setQuestions(fetchedQuestions);
        
        setLoadingReviews(false);
        setLoadingQA(false);
    };

    loadData();
  }, [hostel.id]);

  // Calculate price range
  const prices = hostel.roomTypes.map(r => r.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  // --- Handlers ---

  const handlePostQuestion = async (e) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!newQuestion.trim()) return;

    let imgUrl = undefined;
    if (qaImage) {
        imgUrl = await fileToBase64(qaImage);
    }

    await postQuestion({
        hostel_id: hostel.id,
        user_id: user.id,
        question: newQuestion,
        image_url: imgUrl
    });

    // Refresh
    const updated = await fetchHostelQuestions(hostel.id);
    setQuestions(updated);
    setNewQuestion('');
    setQaImage(null);
  };

  const handlePostAnswer = async (questionId) => {
      if (!user) { onRequireAuth(); return; }
      const text = replyText[questionId];
      if (!text?.trim()) return;

      await postAnswer({
          question_id: questionId,
          user_id: user.id,
          answer: text
      });

      const updated = await fetchHostelQuestions(hostel.id);
      setQuestions(updated);
      setReplyText({ ...replyText, [questionId]: '' });
      setReplyOpen({ ...replyOpen, [questionId]: false });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Convert images to base64
    const base64Images = await Promise.all(reviewImages.map(fileToBase64));

    await postReview({
        hostel_id: hostel.id,
        user_id: user.id,
        rating: reviewRating,
        text: reviewText,
        images: base64Images
    });

    const updated = await fetchReviews(hostel.id);
    setReviews(updated);
    setIsWritingReview(false);
    setReviewText('');
    setReviewImages([]);
  };

  const formatTime = (isoString) => {
      return new Date(isoString).toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in slide-in-from-right-4 duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      {/* Header Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-8">
        <img src={hostel.images[0]} className="w-full h-full object-cover" alt="Main" />
        <div className="grid grid-rows-2 gap-4 h-full">
            <img src={hostel.images[1] || hostel.images[0]} className="w-full h-full object-cover" alt="Secondary" />
            <div className="bg-indigo-900 flex items-center justify-center text-white flex-col">
                <span className="text-3xl font-bold">+{hostel.images.length}</span>
                <span className="text-sm opacity-70">More Photos</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{hostel.name}</h1>
                {hostel.verified && (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-1 text-gray-600 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {hostel.address}</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {hostel.rating} ({reviews.length} reviews)</span>
                {hostel.listed_since && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" /> Listed since {new Date(hostel.listed_since).getFullYear()}
                    </span>
                )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              {['overview', 'reviews', 'qa'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium border-b-2 capitalize transition-colors ${
                    activeTab === tab 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'qa' ? 'Community Q&A' : tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About this place</h3>
                  <p className="text-gray-600 leading-relaxed">{hostel.description}</p>
                </div>
                
                <div className="lg:hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Room Options</h3>
                    <div className="space-y-2">
                         {hostel.roomTypes.map((room, i) => (
                             <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                                 <div>
                                     <div className="font-bold text-gray-800">{room.type}</div>
                                     <div className="text-xs text-gray-500">{room.description}</div>
                                 </div>
                                 <div className="font-bold text-indigo-600">{hostel.currency}{room.price}</div>
                             </div>
                         ))}
                    </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hostel.amenities.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {item}
                        </div>
                    ))}
                  </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Location</h3>
                    <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight={0} 
                            marginWidth={0} 
                            src={`https://maps.google.com/maps?q=${hostel.coordinates.lat},${hostel.coordinates.lng}&hl=en&z=15&output=embed`}
                        >
                        </iframe>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Student Reviews</h3>
                        <p className="text-sm text-gray-500">Based on {reviews.length} verified experiences</p>
                    </div>
                    {!isWritingReview && (
                        <Button variant="secondary" size="sm" onClick={() => user ? setIsWritingReview(true) : onRequireAuth()}>Write a Review</Button>
                    )}
                </div>

                {isWritingReview && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                        <h4 className="font-bold text-gray-900 mb-4">Share your experience</h4>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map(r => (
                                        <button type="button" key={r} onClick={() => setReviewRating(r)}>
                                            <Star className={`w-6 h-6 ${r <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                <textarea 
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                                    placeholder="How was the food? Is it clean? How is the wifi?"
                                    required
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Add Photos</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                                        <Upload className="w-4 h-4" /> Upload
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={e => e.target.files && setReviewImages(Array.from(e.target.files))} 
                                        />
                                    </label>
                                    <span className="text-sm text-gray-500">{reviewImages.length} files selected</span>
                                </div>
                             </div>
                             <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsWritingReview(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">Submit Review</Button>
                             </div>
                        </form>
                    </div>
                )}

                {loadingReviews && <p>Loading reviews...</p>}

                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 relative group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <span className="font-bold text-indigo-700">{review.author?.name[0] || 'U'}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                            {review.author?.name}
                            {review.author?.verified && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold">
                                    <ShieldCheck className="w-3 h-3" /> Verified Student
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">{formatTime(review.created_at)}</div>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.text}</p>
                    
                    {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {review.images.map((img, idx) => (
                                <img key={idx} src={img} alt="Review" className="h-20 w-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform" />
                            ))}
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-6 animate-in fade-in">
                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6">
                    <h4 className="font-bold text-blue-900 mb-1">Community Q&A</h4>
                    <p className="text-sm text-blue-700 mb-4">Ask verified residents about food, rules, or environment.</p>
                    
                    <form onSubmit={handlePostQuestion} className="space-y-3">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="What would you like to know?"
                                className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            />
                             <div className="absolute right-2 top-2">
                                <label className="cursor-pointer p-1.5 hover:bg-gray-100 rounded-full inline-flex text-gray-500 hover:text-indigo-600 transition-colors">
                                    <ImageIcon className="w-5 h-5" />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setQaImage(e.target.files[0])} />
                                </label>
                             </div>
                        </div>
                        {qaImage && (
                            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded w-fit">
                                <CheckCircle2 className="w-3 h-3" /> Image attached: {qaImage.name}
                                <button type="button" onClick={() => setQaImage(null)} className="text-red-500 hover:underline ml-2">Remove</button>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button type="submit" variant="primary" size="sm" disabled={!newQuestion.trim()}>
                                Post Question
                            </Button>
                        </div>
                    </form>
                 </div>

                 {loadingQA && <p>Loading questions...</p>}

                 <div className="space-y-6">
                    {questions.map((q) => (
                        <div key={q.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                            <div className="flex gap-3 mb-2">
                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm h-fit">Q</span>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-lg">{q.question}</p>
                                    {q.image_url && (
                                        <img src={q.image_url} alt="Attached" className="mt-2 rounded-lg max-h-48 object-cover border border-gray-200" />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 ml-10 mb-4">
                                <span>Asked by {q.author?.name}</span>
                                {q.author?.verified && (
                                    <span className="text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-1.5 rounded-full font-bold">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </span>
                                )}
                                <span>• {formatTime(q.created_at)}</span>
                                <button 
                                    className="text-indigo-600 font-medium hover:underline ml-2"
                                    onClick={() => setReplyOpen({...replyOpen, [q.id]: !replyOpen[q.id]})}
                                >
                                    Reply
                                </button>
                            </div>
                            
                            {/* Answers List */}
                            {q.answers && q.answers.map(a => (
                                <div key={a.id} className="ml-8 border-l-2 border-indigo-200 pl-4 py-2 bg-gray-50/50 rounded-r-lg mb-2">
                                    <p className="text-gray-700 text-sm mb-1">{a.answer}</p>
                                    <div className="text-xs text-gray-500">Answered by {a.author?.name} • {formatTime(a.created_at)}</div>
                                </div>
                            ))}

                            {/* Reply Input */}
                            {replyOpen[q.id] && (
                                <div className="ml-8 mt-2 flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none" 
                                        placeholder="Write an answer..."
                                        value={replyText[q.id] || ''}
                                        onChange={(e) => setReplyText({...replyText, [q.id]: e.target.value})}
                                    />
                                    <Button size="sm" onClick={() => handlePostAnswer(q.id)}>Send</Button>
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="mb-6">
                    <span className="text-sm text-gray-500">Price Range</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-indigo-900">{hostel.currency}{minPrice.toLocaleString()}</span>
                        {minPrice !== maxPrice && (
                             <span className="text-gray-500 text-sm">- {maxPrice.toLocaleString()}</span>
                        )}
                        <span className="text-xs text-gray-500 ml-1">/mo</span>
                    </div>
                </div>

                <div className="mb-6 border-t border-gray-100 pt-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-indigo-500" /> Available Rooms
                    </h4>
                    <div className="space-y-3">
                        {hostel.roomTypes.map((room, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm text-gray-800">{room.type}</span>
                                    <span className="font-bold text-sm text-indigo-600">{hostel.currency}{room.price}</span>
                                </div>
                                <p className="text-xs text-gray-500">{room.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Button variant="primary" size="lg" className="w-full mb-3">Book Visit</Button>
                
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="font-bold text-gray-900">Contact Details</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-medium">{hostel.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="break-all">{hostel.contact.email}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
