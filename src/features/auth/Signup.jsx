import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!auth) {
      setError('Firebase configuration is missing.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to create an account. ' + err.message);
      console.error(err);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    if (!auth) {
      setError('Firebase configuration is missing.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError('Failed to sign up with Google.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-slate-50 selection:bg-green-500/30">
      {/* Left side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop" 
          alt="Fitness Training" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/80 to-[#0B1120] via-[#0B1120]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent"></div>
        
        <div className="absolute bottom-20 left-16 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            <Activity className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold tracking-tight">FitPlan<span className="text-green-500">.</span></span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-4 leading-tight"
          >
            Unlock your full potential today.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-lg"
          >
            Create an account to get personalized workout and diet plans built specifically for your body and goals.
          </motion.p>
        </div>
      </div>

      {/* Right side: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md glass-card p-10 relative z-10"
        >
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Activity className="w-8 h-8 text-green-500" />
            <span className="text-3xl font-bold tracking-tight">FitPlan<span className="text-green-500">.</span></span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400 mb-8">Join FitPlan and reach your goals</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm mb-6">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0B1120]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white placeholder-slate-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#0B1120]/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white placeholder-slate-500"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-medium">Or sign up with</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-semibold py-3.5 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>

          <p className="mt-8 text-center text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-green-500 font-bold hover:text-green-400 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
