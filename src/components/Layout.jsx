import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, Utensils, Dumbbell, TrendingUp,
  Settings, Search, Bell, Activity, LogOut, Users, Bot, Flame
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { auth } from '../services/firebase';

const Layout = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  React.useEffect(() => {
    // Simulate gamification nudge after 3 seconds
    const timer = setTimeout(() => setShowToast(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Workouts', path: '/dashboard/exercise', icon: Dumbbell },
    { name: 'Nutrition', path: '/dashboard/diet', icon: Utensils },
    { name: 'Progress', path: '/dashboard/progress', icon: TrendingUp },
    { name: 'Community', path: '/dashboard/community', icon: Users },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0B1120] text-slate-100 overflow-hidden font-sans selection:bg-green-500/30">
      
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 w-full z-50 md:relative md:w-64 glass-panel md:border-r border-t md:border-t-0 border-white/5 md:flex flex-col flex-shrink-0 transition-all duration-300">
        
        {/* Logo Section */}
        <div className="hidden md:flex items-center gap-2 p-6 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30 neon-glow">
            <Activity className="w-6 h-6 text-green-500" />
          </div>
          <span className="text-2xl font-bold tracking-tight">FitPlan<span className="text-green-500">.</span></span>
        </div>

        {/* Navigation Links */}
        <div className="flex md:flex-col justify-around md:justify-start flex-1 p-2 md:p-4 gap-1 md:gap-2 overflow-x-auto md:overflow-y-auto hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all duration-300 min-w-[64px] md:min-w-0 ${
                    isActive 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-[10px] md:text-sm font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Logout (Desktop) */}
        <div className="hidden md:block p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Topbar */}
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-40 sticky top-0">
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center w-96 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4" />
            <input 
              type="text" 
              placeholder="Search workouts, meals..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
            />
          </div>
          
          <div className="md:hidden flex items-center gap-2">
             <Activity className="w-8 h-8 text-green-500" />
             <span className="text-xl font-bold tracking-tight">FitPlan<span className="text-green-500">.</span></span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {isNotifOpen && (
              <div className="absolute top-full right-16 mt-2 w-72 glass-card rounded-2xl p-4 shadow-xl z-50 animate-in slide-in-from-top-2 border border-white/10">
                <h4 className="text-white font-bold mb-3">Notifications</h4>
                <div className="space-y-3">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-sm text-white font-medium">Time for lunch! 🥗</p>
                    <p className="text-xs text-slate-400 mt-1">Don't forget to log your meal in the diet tab.</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-sm text-white font-medium">Goal reached! 🎯</p>
                    <p className="text-xs text-slate-400 mt-1">You hit your daily water target.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div onClick={() => navigate('/dashboard/settings')} className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{userProfile?.name || 'User'}</p>
                <p className="text-xs text-slate-400">{userProfile?.goal || 'Fitness Enthusiast'}</p>
              </div>
              <img 
                src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=22C55E&color=fff`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-green-500/50 group-hover:border-green-400 transition-colors"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative scroll-smooth hide-scrollbar">
           {/* Decorative Background Elements */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
           
           <div className="relative z-10 max-w-7xl mx-auto h-full">
             <Outlet />
           </div>
        </main>
      </div>

      {/* Floating AI Coach Bubble */}
      <button 
        onClick={() => navigate('/dashboard/aicoach')} 
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-110 transition-transform z-40 group"
      >
        <Bot size={28} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0B1120]"></span>
      </button>

      {/* Mock Gamification Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-500">
          <div className="bg-gradient-to-r from-green-500/90 to-green-600/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-green-400/50 flex items-center gap-4 max-w-sm">
            <div className="bg-white/20 p-2 rounded-full">
              <Flame size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">Streak Maintained! 🔥</h4>
              <p className="text-xs text-white/80 mt-0.5">You're doing great! Keep logging daily to earn the Protein Master badge.</p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-white/60 hover:text-white transition-colors">
              <span className="sr-only">Close</span>
              &times;
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Layout;
