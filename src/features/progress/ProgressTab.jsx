import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Camera, TrendingDown, Target, Activity } from 'lucide-react';
import { db } from '../../services/firebase';
import { useAuth } from '../auth/AuthContext';
import { getLocalTodayDateString } from '../../utils/dateHelpers';

const ProgressTab = () => {
  const { userProfile, setUserProfile, currentUser } = useAuth();
  const [weightLogs, setWeightLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState('https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop');

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchWeightLogs = async () => {
      if (!currentUser) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'users', currentUser.uid, 'weight_logs'),
          orderBy('date', 'asc'),
          limit(30)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const logs = [];
          snapshot.forEach((doc) => {
            logs.push({
              date: doc.id.substring(5), // Make date shorter like MM-DD
              weight: doc.data().weight_kg
            });
          });
          
          if (logs.length === 0 && userProfile) {
            logs.push({
              date: getLocalTodayDateString().substring(5),
              weight: userProfile.weight
            });
          }
          
          if (isMounted) {
            setWeightLogs(logs);
          }
        }, (err) => {
          console.error("Error fetching weight logs snapshot:", err);
        });
        
        return unsubscribe;
      } catch (err) {
        console.error("Error setting up weight logs:", err);
      }
    };

    const unsubscribe = fetchWeightLogs();
    return () => { 
      isMounted = false; 
      if (typeof unsubscribe === 'function') unsubscribe();
    }
  }, [userProfile, currentUser]);

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || !currentUser) return;
    setIsLogging(true);

    const weightVal = parseFloat(newWeight);
    const todayStr = getLocalTodayDateString();

    try {
      const logRef = doc(db, 'users', currentUser.uid, 'weight_logs', todayStr);
      await setDoc(logRef, { weight_kg: weightVal, date: todayStr });

      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { weight: weightVal }, { merge: true });

      setUserProfile(prev => ({ ...prev, weight: weightVal }));
      setNewWeight('');
    } catch (err) {
      console.error("Error saving weight:", err);
    }
    
    setIsLogging(false);
  };



  // Calculate BMI
  const heightM = (userProfile?.height || 170) / 100;
  const currentWeight = userProfile?.weight || 70;
  const bmi = (currentWeight / (heightM * heightM)).toFixed(1);
  const goalWeight = userProfile?.targets?.weight || 65;
  const weightLost = 80 - currentWeight; // Assuming start weight was 80 for demo

  // Generate mock heatmap data
  const heatmapData = Array.from({ length: 90 }, () => Math.floor(Math.random() * 5));

  return (
    <div className="py-6 pb-8 animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Progress Tracking</h1>
        <p className="text-slate-400 mt-1 font-medium">Visualize your transformation journey.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Current</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center"><Activity size={16} /></div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{currentWeight} <span className="text-base text-slate-500 font-normal">kg</span></p>
            <p className="text-green-400 text-sm font-medium flex items-center gap-1 mt-1"><TrendingDown size={14} /> -{weightLost} kg total</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Goal</span>
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center"><Target size={16} /></div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{goalWeight} <span className="text-base text-slate-500 font-normal">kg</span></p>
            <p className="text-slate-400 text-sm font-medium mt-1">{Math.abs(currentWeight - goalWeight)} kg remaining</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">BMI</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center"><Activity size={16} /></div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{bmi}</p>
            <p className="text-green-400 text-sm font-medium mt-1">Normal Range</p>
          </div>
        </div>

        {/* Log Weight Widget */}
        <div className="glass-card p-6 border-green-500/30 flex flex-col justify-between bg-gradient-to-br from-green-900/10 to-[#0B1120]">
          <span className="text-white text-sm font-bold mb-4">Log Today's Weight</span>
          <form onSubmit={handleLogWeight} className="flex gap-2">
            <input
              type="number"
              step="0.1"
              required
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder={`${currentWeight} kg`}
              className="w-full bg-black/40 border border-white/10 text-white font-medium rounded-xl px-4 py-2 focus:outline-none focus:border-green-500"
            />
            <button 
              type="submit"
              disabled={isLogging}
              className="bg-green-500 hover:bg-green-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              <Plus size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Weight Trend Chart */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-extrabold text-white text-xl">Weight Trend</h3>
            <select className="bg-white/5 border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          <div className="h-72 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightLogs} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={15}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.9)' }}
                  itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#22c55e" 
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2, fill: '#0B1120', stroke: '#22c55e' }}
                  activeDot={{ r: 8, fill: '#22c55e', stroke: '#0B1120', strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Before & After Photos */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-white text-xl">Transformation</h3>
            <label htmlFor="photo-upload" className="cursor-pointer text-green-500 hover:text-green-400 p-2 bg-green-500/10 rounded-full transition-colors">
              <Camera size={18} />
            </label>
            <input 
              type="file" 
              id="photo-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={handlePhotoUpload} 
            />
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-900 group">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop" alt="Before" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">Day 1</div>
            </div>
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-900 group border-2 border-green-500/50">
              <img src={currentPhoto} alt="Current" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 bg-green-500 text-slate-950 px-3 py-1 rounded-full text-xs font-bold">Today</div>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Heatmap */}
      <div className="glass-card p-6 md:p-8">
        <h3 className="font-extrabold text-white text-xl mb-6 flex items-center gap-2">
          <Activity className="text-green-500 w-5 h-5" /> Activity Heatmap
        </h3>
        <div className="flex gap-2">
          <div className="flex flex-col gap-2 text-xs text-slate-500 font-medium justify-around py-1 pr-2">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="flex-1 grid grid-cols-[repeat(auto-fit,minmax(12px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(14px,1fr))] gap-1.5 md:gap-2">
            {heatmapData.map((val, i) => {
              let bg = 'bg-white/5';
              if (val === 1) bg = 'bg-green-900/40';
              if (val === 2) bg = 'bg-green-700/60';
              if (val === 3) bg = 'bg-green-500/80';
              if (val === 4) bg = 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]';
              
              return (
                <div 
                  key={i} 
                  className={`w-full aspect-square rounded-[3px] md:rounded-[4px] ${bg} hover:ring-2 hover:ring-white/50 transition-all cursor-pointer`}
                  title={`Activity level: ${val}`}
                ></div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 mt-4 text-xs text-slate-400 font-medium">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[3px] bg-white/5"></div>
          <div className="w-3 h-3 rounded-[3px] bg-green-900/40"></div>
          <div className="w-3 h-3 rounded-[3px] bg-green-700/60"></div>
          <div className="w-3 h-3 rounded-[3px] bg-green-500/80"></div>
          <div className="w-3 h-3 rounded-[3px] bg-green-400"></div>
          <span>More</span>
        </div>
      </div>

    </div>
  );
};

export default ProgressTab;
