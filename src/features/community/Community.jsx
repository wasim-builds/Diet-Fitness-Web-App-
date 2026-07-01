import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Award, TrendingUp, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, arrayRemove, limit } from 'firebase/firestore';

const MOCK_POSTS = [
  {
    id: 1,
    user: 'Sarah Jenkins',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=22C55E&color=fff',
    time: '2 hours ago',
    content: 'Just finished the 30-Day Shred Challenge! Feeling stronger than ever. Thanks to this amazing community for the support! 💪🔥',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
    likes: 124,
    comments: 18,
    stats: { workout: 'HIIT Cardio', time: '45m', calories: '420 kcal' }
  },
  {
    id: 2,
    user: 'Mike Ross',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=3b82f6&color=fff',
    time: '5 hours ago',
    content: 'New personal record on deadlifts today! 405lbs for 3 reps. The AI diet plan is really helping with the gains.',
    likes: 89,
    comments: 5,
    stats: null
  },
  {
    id: 3,
    user: 'Jessica Alba',
    avatar: 'https://ui-avatars.com/api/?name=Jessica+Alba&background=f97316&color=fff',
    time: '1 day ago',
    content: 'Meal prep Sunday! Got my macros sorted for the whole week. Consistency is key! 🥗🍱',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    likes: 210,
    comments: 32,
    stats: null
  }
];

const LEADERBOARD = [
  { rank: 1, name: 'David Chen', points: 12450, avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=fbbf24&color=fff' },
  { rank: 2, name: 'Sarah Jenkins', points: 11200, avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=22C55E&color=fff' },
  { rank: 3, name: 'Alex Rodriguez', points: 10850, avatar: 'https://ui-avatars.com/api/?name=Alex+Rodriguez&background=8b5cf6&color=fff' },
  { rank: 4, name: 'Emma Wilson', points: 9400, avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=ec4899&color=fff' },
  { rank: 5, name: 'Mike Ross', points: 8900, avatar: 'https://ui-avatars.com/api/?name=Mike+Ross&background=3b82f6&color=fff' },
];

const Community = () => {
  const { userProfile } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(MOCK_POSTS);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        hasLiked: doc.data().likedBy?.includes(auth.currentUser.uid)
      }));
      // Only set if we actually fetch something, otherwise keep mock data for presentation
      if (fetchedPosts.length > 0) {
        setPosts(fetchedPosts);
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() || !auth.currentUser) return;
    
    const postData = {
      user: userProfile?.name || 'User',
      avatar: `https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=22C55E&color=fff`,
      time: 'Just now',
      content: newPost,
      likes: 0,
      likedBy: [],
      comments: 0,
      stats: null,
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, 'posts'), postData);
      setNewPost('');
    } catch (err) {
      console.error("Error adding post:", err);
    }
  };

  const handleLike = async (post) => {
    if (!auth.currentUser || !post.id || typeof post.id === 'number') {
      // Mock like for MOCK_POSTS
      setPosts(posts.map(p => {
        if (p.id === post.id) {
          return { ...p, likes: p.hasLiked ? p.likes - 1 : p.likes + 1, hasLiked: !p.hasLiked };
        }
        return p;
      }));
      return;
    }

    const postRef = doc(db, 'posts', post.id);
    if (post.hasLiked) {
      await updateDoc(postRef, {
        likes: Math.max(0, post.likes - 1),
        likedBy: arrayRemove(auth.currentUser.uid)
      });
    } else {
      await updateDoc(postRef, {
        likes: post.likes + 1,
        likedBy: arrayUnion(auth.currentUser.uid)
      });
    }
  };

  return (
    <div className="animate-in fade-in duration-500 py-6 pb-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Community</h1>
        <p className="text-slate-400 mt-1 font-medium">Connect, share, and grow together.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Post */}
          <div className="glass-card p-6">
            <div className="flex gap-4">
              <img 
                src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=22C55E&color=fff`} 
                alt="Profile" 
                className="w-12 h-12 rounded-full border-2 border-green-500/50"
              />
              <div className="flex-1">
                <textarea 
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your progress or ask a question..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 resize-none h-24"
                ></textarea>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2 text-slate-400">
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-colors hover:text-green-400"><TrendingUp size={20} /></button>
                  </div>
                  <button 
                    onClick={handlePost}
                    className="bg-green-500 hover:bg-green-400 text-slate-950 font-bold px-6 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {posts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full" />
                  <div>
                    <h4 className="text-white font-bold text-sm">{post.user}</h4>
                    <span className="text-slate-500 text-xs">{post.time}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-200 mb-4 text-sm leading-relaxed">{post.content}</p>

              {post.stats && (
                <div className="flex gap-4 mb-4 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Workout</span>
                    <p className="text-white text-sm font-semibold">{post.stats.workout}</p>
                  </div>
                  <div className="flex-1 border-l border-white/10 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Time</span>
                    <p className="text-green-400 text-sm font-semibold">{post.stats.time}</p>
                  </div>
                  <div className="flex-1 border-l border-white/10 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Burned</span>
                    <p className="text-orange-400 text-sm font-semibold">{post.stats.calories}</p>
                  </div>
                </div>
              )}

              {post.image && (
                <div className="rounded-2xl overflow-hidden mb-4 max-h-80">
                  <img src={post.image} alt="Post Attachment" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-6 border-t border-white/10 pt-4 mt-2">
                <button 
                  onClick={() => handleLike(post)}
                  className={`flex items-center gap-2 transition-colors group ${post.hasLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                >
                  <Heart size={18} className={post.hasLiked ? "fill-current" : "group-hover:fill-current"} /> 
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors">
                  <MessageCircle size={18} /> <span className="text-sm font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors ml-auto">
                  <Share2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <div className="glass-panel p-2 flex items-center relative">
            <Search className="text-slate-400 w-5 h-5 absolute left-4" />
            <input 
              type="text" 
              placeholder="Search community..." 
              className="w-full bg-transparent border-none text-white text-sm py-2 pl-10 pr-4 focus:outline-none"
            />
          </div>

          {/* Leaderboard */}
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10"></div>
            
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <Award className="text-yellow-500 w-5 h-5" /> Weekly Leaderboard
            </h3>
            
            <div className="space-y-4 relative z-10">
              {LEADERBOARD.map((user, i) => (
                <div key={user.rank} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                  <div className={`w-6 text-center font-bold text-sm ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                    #{user.rank}
                  </div>
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <h4 className="text-white text-sm font-semibold">{user.name}</h4>
                  </div>
                  <span className="text-green-400 text-xs font-bold">{user.points} pts</span>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-slate-300 text-sm font-medium hover:bg-white/5 transition-colors relative z-10">
              View Full Rankings
            </button>
          </div>

          {/* Upcoming Events */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-sky-900/40 to-[#0B1120] border border-sky-500/20">
                <span className="bg-sky-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Tomorrow</span>
                <h4 className="text-white font-bold text-sm mt-2 mb-1">Live HIIT Session</h4>
                <p className="text-slate-400 text-xs">Join Coach Sarah for a 45m intense cardio session.</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-[#0B1120] border border-purple-500/20">
                <span className="bg-purple-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Sat, 10 AM</span>
                <h4 className="text-white font-bold text-sm mt-2 mb-1">Nutrition Q&A</h4>
                <p className="text-slate-400 text-xs">Learn about macros and meal prep.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Community;
