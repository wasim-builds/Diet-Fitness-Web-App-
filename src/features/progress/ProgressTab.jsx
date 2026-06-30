import React, { useState, useEffect } from 'react';
import { doc, getDocs, setDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { useAuth } from '../auth/AuthContext';
import { getLocalTodayDateString } from '../../utils/dateHelpers';

const ProgressTab = () => {
  const { userProfile, setUserProfile } = useAuth();
  const [weightLogs, setWeightLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeightLogs = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, 'users', auth.currentUser.uid, 'weight_logs'),
          orderBy('date', 'asc'),
          limit(30)
        );
        const snapshot = await getDocs(q);
        const logs = [];
        snapshot.forEach((doc) => {
          logs.push({
            date: doc.id.substring(5), // Make date shorter like MM-DD
            weight: doc.data().weight_kg
          });
        });
        
        // If empty, add current profile weight as a starting point
        if (logs.length === 0 && userProfile) {
          logs.push({
            date: getLocalTodayDateString().substring(5),
            weight: userProfile.weight
          });
        }
        
        setWeightLogs(logs);
      } catch (err) {
        console.error("Error fetching weight logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeightLogs();
  }, [userProfile]);

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || !auth.currentUser) return;
    setIsLogging(true);

    const weightVal = parseFloat(newWeight);
    const todayStr = getLocalTodayDateString();

    try {
      // Save to subcollection
      const logRef = doc(db, 'users', auth.currentUser.uid, 'weight_logs', todayStr);
      await setDoc(logRef, { weight_kg: weightVal, date: todayStr });

      // Update main profile document
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, { weight: weightVal }, { merge: true });

      // Update local context & state
      setUserProfile(prev => ({ ...prev, weight: weightVal }));
      setNewWeight('');
      
      // Refresh chart data optimistic
      setWeightLogs(prev => {
        const newEntry = { date: todayStr.substring(5), weight: weightVal };
        // Replace if same date, else append
        const exists = prev.findIndex(p => p.date === newEntry.date);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = newEntry;
          return updated;
        }
        return [...prev, newEntry];
      });

    } catch (err) {
      console.error("Error saving weight:", err);
    }
    
    setIsLogging(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading progress...</div>;

  return (
    <div className="py-6 pb-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Progress Tracker</h1>
        <p className="text-slate-500 text-sm mt-1">Keep track of your journey.</p>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <h3 className="font-bold text-slate-800 mb-4">Log Today's Weight</h3>
        <form onSubmit={handleLogWeight} className="flex gap-3">
          <input
            type="number"
            step="0.1"
            required
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder={`e.g. ${userProfile?.weight || 70}`}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button 
            type="submit"
            disabled={isLogging}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-5 rounded-xl transition-colors disabled:opacity-50 flex flex-col items-center justify-center"
          >
            {isLogging ? '...' : <Plus size={20} />}
          </button>
        </form>
      </div>

      <div className="bg-white p-5 pt-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800">Weight History</h3>
          <span className="text-xs font-semibold text-sky-500 bg-sky-50 px-2 py-1 rounded-lg uppercase tracking-wide">LBS / KG</span>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightLogs} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}
                itemStyle={{ color: '#0ea5e9', fontWeight: '600' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#0ea5e9' }}
                activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;
