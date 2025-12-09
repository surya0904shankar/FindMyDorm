
import React, { useState, useEffect } from 'react';
import { MessageCircle, ShieldCheck, MapPin, ThumbsUp, MessageSquare, Plus, X, Image as ImageIcon } from 'lucide-react';
import Button from './Button';
import { fetchCommunityPosts, createCommunityPost, createCommunityComment, fileToBase64 } from '../services/supabaseService';

const CommunityFeed = ({ user }) => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({ topic: '', content: '' });
  const [newPostImage, setNewPostImage] = useState(null);
  
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Posts
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
      setLoading(true);
      const posts = await fetchCommunityPosts();
      setCommunityPosts(posts);
      setLoading(false);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
        alert("Please login to post");
        return;
    }

    let imgUrl = undefined;
    if (newPostImage) {
        imgUrl = await fileToBase64(newPostImage);
    }

    await createCommunityPost({
        user_id: user.id,
        topic: newPost.topic,
        content: newPost.content,
        tags: ['General'],
        image_url: imgUrl
    });

    await loadPosts();
    setIsCreatingPost(false);
    setNewPost({ topic: '', content: '' });
    setNewPostImage(null);
  };

  const formatTime = (isoString) => {
      return new Date(isoString).toLocaleString('en-IN', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Student Community QA</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect with verified students from colleges across India. Ask questions, share reviews, and help juniors find their home away from home.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium shadow-sm">All Topics</button>
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50">Accommodation</button>
        </div>
        <button 
            onClick={() => user ? setIsCreatingPost(true) : alert('Login required')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
        >
            <Plus className="w-4 h-4" />
            Start Discussion
        </button>
      </div>

      {isCreatingPost && (
          <div className="mb-8 bg-white p-6 rounded-xl border border-indigo-100 shadow-md">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-gray-900">Create New Discussion</h3>
                  <button onClick={() => setIsCreatingPost(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                  </button>
              </div>
              <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                      <input 
                        required
                        type="text" 
                        placeholder="Topic Title (e.g. Best mess in Adyar?)" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        value={newPost.topic}
                        onChange={e => setNewPost({...newPost, topic: e.target.value})}
                      />
                  </div>
                  <div>
                      <textarea 
                        required
                        placeholder="What's on your mind?" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                        value={newPost.content}
                        onChange={e => setNewPost({...newPost, content: e.target.value})}
                      />
                  </div>
                  <div className="flex items-center justify-between">
                       <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600">
                           <ImageIcon className="w-5 h-5" />
                           {newPostImage ? <span className="text-emerald-600">{newPostImage.name}</span> : "Add Photo"}
                           <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files && setNewPostImage(e.target.files[0])} />
                       </label>
                       <Button type="submit" variant="primary">Post Discussion</Button>
                  </div>
              </form>
          </div>
      )}

      {loading && <p className="text-center text-gray-500">Loading discussions...</p>}

      <div className="space-y-4">
        {communityPosts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold">
                    {post.author?.name[0] || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{post.author?.name}</span>
                    {post.author?.verified && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{post.author?.college || 'University'}</span>
                    <span>• {formatTime(post.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                 {post.tags.map((tag, i) => (
                     <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">{tag}</span>
                 ))}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{post.topic}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.content}</p>
            
            {post.image_url && (
                <div className="mb-4">
                    <img src={post.image_url} alt="Post Attachment" className="rounded-lg max-h-64 object-cover border border-gray-200" />
                </div>
            )}

            <div className="flex items-center gap-6 border-t border-gray-100 pt-4">
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors">
                    <ThumbsUp className="w-4 h-4" /> {post.likes || 0} Helpful
                </button>
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors">
                    <MessageSquare className="w-4 h-4" /> {post.comment_count} Replies
                </button>
            </div>
            
            {/* Display comments preview if any */}
            {post.comments && post.comments.length > 0 && (
                <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                    <span className="font-bold">{post.comments[0].author?.name}:</span> {post.comments[0].content}
                    {post.comments.length > 1 && <div className="text-xs text-indigo-600 mt-1 cursor-pointer">View all comments</div>}
                </div>
            )}
          </div>
        ))}
        
        {!loading && communityPosts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                No discussions yet. Be the first to start one!
            </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
