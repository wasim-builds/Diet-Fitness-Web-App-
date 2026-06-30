import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import useAppStore from '../../store/useAppStore';
import { useAuth } from '../auth/AuthContext';
import { getLocalTodayDateString } from '../../utils/dateHelpers';
import exercisesData from '../../data/exercises.json';

const ExerciseList = () => {
  const { userProfile } = useAuth();
  const { addExerciseToLog } = useAppStore();
  const [selectedDurations, setSelectedDurations] = useState({});
  const [isLogging, setIsLogging] = useState(false);

  // Filter exercises to match user goal if possible, otherwise show all
  const filteredExercises = exercisesData.filter(ex => 
    ex.goal_tags.includes(userProfile?.goal || 'maintain')
  );

  const handleDurationChange = (exId, duration) => {
    setSelectedDurations(prev => ({ ...prev, [exId]: parseInt(duration, 10) }));
  };

  const handleComplete = async (exercise) => {
    if (!auth.currentUser || !userProfile) return;
    
    // Default to the first duration option if none selected
    const durationMins = selectedDurations[exercise.id] || exercise.duration_options[0];
    
    // Formula: Calories = MET * weight(kg) * (duration_mins / 60)
    const weightKg = userProfile.weight;
    const caloriesBurned = Math.round(exercise.met_value * weightKg * (durationMins / 60));

    setIsLogging(true);

    // Optimistic Update
    addExerciseToLog(durationMins, caloriesBurned);

    // Persist to DB
    try {
      const todayStr = getLocalTodayDateString();
      const logRef = doc(db, 'users', auth.currentUser.uid, 'daily_logs', todayStr);
      await updateDoc(logRef, {
        exercise_minutes: increment(durationMins),
        calories_burned: increment(caloriesBurned)
      });
    } catch (err) {
      console.error("Error logging exercise:", err);
    }

    setIsLogging(false);
  };

  return (
    <div className="py-6 pb-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Workouts</h1>
        <p className="text-slate-500 text-sm mt-1">Recommended for your {userProfile?.goal || 'fitness'} goal.</p>
      </div>

      <div className="space-y-4">
        {filteredExercises.map(ex => {
          const currentDuration = selectedDurations[ex.id] || ex.duration_options[0];
          // Calculate estimate for display
          const estBurn = Math.round(ex.met_value * (userProfile?.weight || 70) * (currentDuration / 60));

          return (
            <div key={ex.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-800 text-lg leading-tight w-3/4">{ex.name}</h3>
                <div className="bg-orange-50 text-orange-500 font-semibold text-xs px-2 py-1 rounded-lg flex items-center">
                  ~{estBurn} kcal
                </div>
              </div>
              
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">{ex.instructions}</p>
              
              <div className="flex items-center justify-between gap-4 border-t border-slate-50 pt-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</label>
                  <select 
                    value={currentDuration}
                    onChange={(e) => handleDurationChange(ex.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {ex.duration_options.map(opt => (
                      <option key={opt} value={opt}>{opt} mins</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">&nbsp;</label>
                  <button 
                    onClick={() => handleComplete(ex)}
                    disabled={isLogging}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    Complete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseList;
