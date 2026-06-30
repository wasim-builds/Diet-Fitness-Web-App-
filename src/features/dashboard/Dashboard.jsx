import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Plus, Minus, Flame, Activity } from 'lucide-react';
import { db } from '../../services/firebase';
import { useAuth } from '../auth/AuthContext';
import useAppStore from '../../store/useAppStore';
import { getLocalTodayDateString } from '../../utils/dateHelpers';
import ProgressRing from '../../components/ProgressRing';

const Dashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const { todayLog, setTodayLog, addWaterGlass, removeWaterGlass } = useAppStore();
  const [loading, setLoading] = useState(true);

  const todayStr = getLocalTodayDateString();

  useEffect(() => {
    const fetchTodayLog = async () => {
      if (!currentUser) return;
      
      const logRef = doc(db, 'users', currentUser.uid, 'daily_logs', todayStr);
      try {
        const logSnap = await getDoc(logRef);
        if (logSnap.exists()) {
          setTodayLog(logSnap.data());
        } else {
          // Initialize empty log for today
          const initialLog = {
            date: todayStr,
            calories_consumed: 0,
            protein_consumed: 0,
            carbs_consumed: 0,
            fat_consumed: 0,
            water_glasses: 0,
            exercise_minutes: 0,
            calories_burned: 0
          };
          await setDoc(logRef, initialLog);
          setTodayLog(initialLog);
        }
      } catch (err) {
        console.error('Error fetching today log:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayLog();
  }, [currentUser, todayStr, setTodayLog]);

  const handleWaterUpdate = async (increment) => {
    if (!todayLog) return;
    
    // Optimistic UI update
    if (increment > 0) addWaterGlass();
    else removeWaterGlass();

    // Persist to Firestore
    try {
      const logRef = doc(db, 'users', currentUser.uid, 'daily_logs', todayStr);
      const newWater = Math.max(0, (todayLog.water_glasses || 0) + increment);
      await updateDoc(logRef, { water_glasses: newWater });
    } catch (err) {
      console.error('Error updating water:', err);
      // Rollback would go here in a production app if the request failed
    }
  };

  if (loading || !userProfile || !todayLog) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { targets } = userProfile;
  const calProgress = (todayLog.calories_consumed / targets.calories) * 100 || 0;
  const proProgress = (todayLog.protein_consumed / targets.protein) * 100 || 0;

  return (
    <div className="py-6 pb-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hi, {userProfile.name || 'there'}! 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Here is your daily summary.</p>
      </div>

      {/* Primary Progress Rings */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center">
          <ProgressRing 
            progress={calProgress} 
            value={todayLog.calories_consumed} 
            label="Kcal" 
            color={calProgress > 100 ? "text-red-500" : "text-sky-500"} 
          />
          <div className="mt-4 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Target</p>
            <p className="text-sm font-bold text-slate-700">{targets.calories} kcal</p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center">
          <ProgressRing 
            progress={proProgress} 
            value={`${todayLog.protein_consumed}g`} 
            label="Protein" 
            color="text-emerald-500" 
          />
          <div className="mt-4 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Target</p>
            <p className="text-sm font-bold text-slate-700">{targets.protein}g</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Water Tracker */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.5C8.962 21.5 6.5 19.038 6.5 16C6.5 11.5 12 3.5 12 3.5C12 3.5 17.5 11.5 17.5 16C17.5 19.038 15.038 21.5 12 21.5Z"/></svg>
              </div>
              <span className="font-semibold text-slate-700">Water</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-2">{todayLog.water_glasses} <span className="text-sm font-medium text-slate-400">glasses</span></p>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => handleWaterUpdate(-1)}
              className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl py-2 flex justify-center items-center transition-colors"
            >
              <Minus size={18} />
            </button>
            <button 
              onClick={() => handleWaterUpdate(1)}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl py-2 flex justify-center items-center transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Exercise Burned */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <Flame size={18} />
              </div>
              <span className="font-semibold text-slate-700">Burned</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-2">{todayLog.calories_burned} <span className="text-sm font-medium text-slate-400">kcal</span></p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-50 px-3 py-2 rounded-xl">
            <Activity size={16} className="text-orange-400" />
            {todayLog.exercise_minutes} mins
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
