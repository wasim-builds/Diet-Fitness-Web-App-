import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { 
  Activity, Flame, Droplets, Dumbbell, TrendingUp, Heart, 
  Calendar, Award, Target, ChevronRight, Utensils
} from 'lucide-react';
import { db } from '../../services/firebase';
import { useAuth } from '../auth/AuthContext';
import useAppStore from '../../store/useAppStore';
import { getLocalTodayDateString } from '../../utils/dateHelpers';
import { 
  LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const mockWeeklyData = [
  { name: 'Mon', calories: 2100, burned: 400 },
  { name: 'Tue', calories: 2400, burned: 600 },
  { name: 'Wed', calories: 2200, burned: 300 },
  { name: 'Thu', calories: 2600, burned: 800 },
  { name: 'Sun', calories: 2000, burned: 200 },
];

const Dashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const { todayLog, setTodayLog } = useAppStore();
  const todayStr = getLocalTodayDateString();
  const navigate = useNavigate();

  const handleAddWater = async () => {
    if (!currentUser) return;
    const logRef = doc(db, 'users', currentUser.uid, 'daily_logs', todayStr);
    try {
      await setDoc(logRef, {
        water_glasses: (displayLog.water_glasses || 0) + 1
      }, { merge: true });
    } catch (error) {
      console.error("Error updating water:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    const logRef = doc(db, 'users', currentUser.uid, 'daily_logs', todayStr);
    const unsubscribe = onSnapshot(logRef, (logSnap) => {
      if (logSnap.exists()) {
        setTodayLog(logSnap.data());
      } else {
        setTodayLog({
          date: todayStr, calories_consumed: 0, protein_consumed: 0,
          water_glasses: 0, exercise_minutes: 0, calories_burned: 0
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser, todayStr, setTodayLog]);

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayLog = todayLog || {
    calories_consumed: 0, protein_consumed: 0, water_glasses: 0, exercise_minutes: 0, calories_burned: 0
  };

  const targets = userProfile.targets || { calories: 2000, protein: 150 };
  const calProgress = (displayLog.calories_consumed / targets.calories) * 100 || 0;
  const proProgress = (displayLog.protein_consumed / targets.protein) * 100 || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Hero Welcome */}
      <div className="glass-card p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="relative z-10">
          <p className="text-green-400 font-bold uppercase tracking-widest text-sm mb-2">Welcome Back</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Ready to <span className="text-gradient">crush it</span> today, {userProfile.name?.split(' ')[0] || 'User'}?
          </h1>
          <p className="text-slate-400 font-medium">You are <span className="text-white font-bold">{userProfile.streak || 1} days</span> into your current streak. Keep it up!</p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 flex gap-4">
          <button onClick={() => navigate('/dashboard/exercise')} className="bg-green-500 hover:bg-green-400 text-slate-950 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:-translate-y-0.5">
            Log Workout
          </button>
          <button onClick={() => navigate('/dashboard/diet')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10">
            Log Meal
          </button>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
      </div>

      {/* KPI Widgets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { icon: <Flame className="text-orange-400" />, label: 'Calories', value: `${displayLog.calories_consumed} kcal`, desc: `Target: ${targets.calories}` },
          { icon: <Activity className="text-green-400" />, label: 'Workout Time', value: `${displayLog.exercise_minutes} min`, desc: 'Today' },
          { icon: <TrendingUp className="text-blue-400" />, label: 'Weight', value: `${userProfile.weight || userProfile.weight_kg} kg`, desc: `Target: ${userProfile.target_weight_kg || targets.weight || 65}` },
          { icon: <Droplets className="text-sky-400" />, label: 'Water', value: `${displayLog.water_glasses} glasses`, desc: 'Target: 8' },
          { icon: <Heart className="text-red-400" />, label: 'Avg HR', value: '112 bpm', desc: 'Active' },
        ].map((stat, i) => (
          <div key={i} onClick={stat.label === 'Water' ? handleAddWater : undefined} className="glass-panel p-5 flex flex-col justify-between group hover:bg-white/5 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">{stat.icon}</div>
              <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stat.label === 'Water' ? (
                  <span className="flex items-center gap-2">
                    {stat.value} 
                    <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      + Add
                    </span>
                  </span>
                ) : stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Chart: Weekly Progress */}
        <div className="xl:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="text-green-500 w-5 h-5" /> Weekly Activity
            </h2>
            <select className="bg-slate-900/50 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: '#94a3b8', fontSize: 12}} dy={10} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={3} dot={{r: 4, fill: '#22c55e'}} activeDot={{r: 6}} name="Intake" />
                <Line type="monotone" dataKey="burned" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316'}} name="Burned" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nutrition Breakdown */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Utensils className="text-green-500 w-5 h-5" /> Today's Nutrition
          </h2>
          <div className="flex-1 flex flex-col justify-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 relative flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${calProgress}, 100`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white">{Math.round(calProgress)}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{todayLog.calories_consumed}</p>
                <p className="text-sm text-slate-400">/ {targets.calories} kcal</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 font-medium">Protein</span>
                  <span className="text-white font-bold">{todayLog.protein_consumed}g <span className="text-slate-500 font-normal">/ {targets.protein}g</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, proProgress)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 font-medium">Carbs</span>
                  <span className="text-white font-bold">{todayLog.carbs_consumed || 0}g <span className="text-slate-500 font-normal">/ 250g</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 font-medium">Fats</span>
                  <span className="text-white font-bold">{todayLog.fat_consumed || 0}g <span className="text-slate-500 font-normal">/ 60g</span></span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Today's Workout */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Dumbbell className="text-green-500 w-5 h-5" /> Today's Workout
            </h2>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer">
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop" alt="Workout" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-green-500 text-slate-950 text-xs font-bold px-2 py-1 rounded inline-block mb-2">HIIT CARDIO</div>
              <h3 className="text-xl font-bold text-white">Full Body Shred</h3>
              <p className="text-sm text-slate-300 flex items-center gap-2 mt-1">
                <span>45 Min</span> • <span>Intense</span>
              </p>
            </div>
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-slate-950 pl-1 shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="text-green-500 w-5 h-5" /> Upcoming Schedule
          </h2>
          <div className="space-y-4">
            {[
              { time: '08:00 AM', title: 'Breakfast', desc: 'Oatmeal & Protein Shake', type: 'meal' },
              { time: '05:30 PM', title: 'Workout', desc: 'Full Body Shred (45m)', type: 'workout' },
              { time: '07:30 PM', title: 'Dinner', desc: 'Grilled Chicken & Rice', type: 'meal' },
            ].map((event, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                <div className="w-16 flex-shrink-0 text-sm font-bold text-slate-400 pt-1">{event.time}</div>
                <div>
                  <h4 className="text-white font-bold">{event.title}</h4>
                  <p className="text-sm text-slate-400">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges & Achievements */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="text-green-500 w-5 h-5" /> Challenges
          </h2>
          
          <div className="bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] text-green-500/10">
              <Award size={100} />
            </div>
            <div className="relative z-10">
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded inline-block mb-2">ACTIVE</span>
              <h3 className="text-white font-bold mb-1">30-Day Shred Challenge</h3>
              <p className="text-sm text-slate-400 mb-3">Complete 20 HIIT workouts</p>
              
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-white font-bold">12/20 <span className="text-slate-400 font-normal">Workouts</span></span>
                <span className="text-green-400 font-bold">60%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
          
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-slate-400">Your Badges</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-2 shadow-lg shadow-orange-500/20">
                <Flame className="text-white w-5 h-5" />
              </div>
              <span className="text-xs text-white font-bold">7-Day Streak</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 flex items-center justify-center mb-2 shadow-lg shadow-sky-500/20">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="text-xs text-white font-bold">Protein Pro</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors opacity-50 grayscale">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-2">
                <Award className="text-white w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400 font-bold text-wrap">30-Day Shred</span>
            </div>
          </div>

          <button className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
            View All Achievements
          </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
