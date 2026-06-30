import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ArrowRight, Brain, ChevronDown, Dumbbell, 
  Menu, Play, Star, Users, X, Zap 
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleCTA = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const navLinks = ['Home', 'Features', 'Community', 'About'];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-50 font-sans selection:bg-green-500/30">
      {/* Sticky Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30 neon-glow">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-xl font-bold tracking-tight">FitPlan<span className="text-green-500">.</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-slate-300 hover:text-green-400 transition-colors text-sm font-medium">
                {link}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!currentUser && (
              <button onClick={() => navigate('/login')} className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                Log In
              </button>
            )}
            <button 
              onClick={handleCTA}
              className="bg-green-500 hover:bg-green-400 text-slate-950 px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5"
            >
              {currentUser ? 'Dashboard' : 'Get Started'}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-full left-0 w-full glass-panel border-t border-white/5 py-4 px-6 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-slate-300 text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                {link}
              </a>
            ))}
            <div className="h-px bg-white/10 my-2" />
            <button onClick={() => navigate(currentUser ? '/dashboard' : '/login')} className="w-full bg-green-500 text-slate-950 py-3 rounded-xl font-bold">
              {currentUser ? 'Go to Dashboard' : 'Log In'}
            </button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[128px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] -z-10" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-green-500/30">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-400">AI-Powered Fitness Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Transform Your Body,<br />
              <span className="text-gradient">Transform Your Life</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
              Achieve your fitness goals with personalized AI coaching, tailored nutrition plans, and a community that pushes you forward.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate(currentUser ? '/dashboard' : '/login')} className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-green-500 hover:bg-green-400 text-slate-950 font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transform hover:-translate-y-1">
                <Play className="w-5 h-5" fill="currentColor" /> Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-12 h-12 rounded-full border-2 border-[#0B1120]" />
                ))}
              </div>
              <div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-slate-400 mt-1"><span className="text-white font-bold">10,000+</span> active users</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Visuals */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Main Image Placeholder (You would use an actual AI generated image here) */}
            <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden neon-border">
              <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop" alt="Athlete" className="w-full h-full object-cover" />
              <div className="absolute inset-0 image-overlay-gradient"></div>
            </div>

            {/* Floating Stats Cards */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-10 -left-10 glass-card p-4 rounded-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Zap className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Calories Burned</p>
                <p className="text-xl font-bold">1,240 kcal</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute bottom-20 -right-10 glass-card p-4 rounded-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Activity className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Workout Streak</p>
                <p className="text-xl font-bold">12 Days</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Everything you need to <span className="text-gradient">succeed</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Our premium suite of tools is designed to cover every aspect of your fitness journey, from intelligent workout planning to diet tracking.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Dumbbell />, title: 'Workout Plans', desc: 'Customized routines adapted to your goals, equipment, and schedule.' },
              { icon: <Brain />, title: 'AI Coach', desc: 'Get real-time feedback and adjustments from our advanced AI engine.' },
              { icon: <Activity />, title: 'Nutrition', desc: 'Personalized meal plans and macro tracking to fuel your progress.' },
              { icon: <Zap />, title: 'Progress Analytics', desc: 'Beautiful charts and insights to visualize your transformation.' },
              { icon: <Users />, title: 'Community', desc: 'Connect with like-minded individuals, share workouts, and compete.' }
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="glass-card p-8 rounded-3xl group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 group-hover:bg-green-500/20 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Visual Showcase Section */}
          <div className="mt-24 grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-[2rem] overflow-hidden group"
            >
              <div className="h-64 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" alt="Exercise" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent pointer-events-none"></div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Intelligent Workouts</h3>
                <p className="text-slate-400 leading-relaxed">Whether you're lifting weights, running, or practicing yoga, our AI adapts to your progress to ensure you never hit a plateau.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-[2rem] overflow-hidden group border-green-500/20"
            >
              <div className="h-64 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop" alt="Diet and Nutrition" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent pointer-events-none"></div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">Precision Nutrition</h3>
                <p className="text-slate-400 leading-relaxed">Delicious, macro-optimized meal plans designed to complement your training and accelerate your fitness goals.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <Activity className="w-6 h-6 text-green-500" />
             <span className="text-xl font-bold tracking-tight">FitPlan<span className="text-green-500">.</span></span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 FitPlan. All rights reserved.</p>
          <div className="flex gap-6 text-slate-400 text-sm">
            <a href="#" className="hover:text-green-400">Privacy</a>
            <a href="#" className="hover:text-green-400">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
