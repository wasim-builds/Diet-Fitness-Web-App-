import React, { useState } from 'react';
import { Play, CheckCircle, Clock, Flame, Dumbbell, ArrowLeft } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import useAppStore from '../../store/useAppStore';
import { useAuth } from '../auth/AuthContext';
import { getLocalTodayDateString } from '../../utils/dateHelpers';
import { motion, AnimatePresence } from 'framer-motion';

const workoutCategories = [
  { 
    id: 'chest', 
    name: 'Chest', 
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop', 
    difficulty: 'Intermediate', 
    duration: '45 Min', 
    calories: '350 kcal',
    youtubeId: 'rxD321l2svE', // Placeholder Chest workout video
    exercises: [
      { name: 'Warmup Jog', sets: 1, reps: '5 Min', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=200' },
      { name: 'Barbell Bench Press', sets: 4, reps: '8-10 Reps', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12 Reps', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200' },
      { name: 'Cable Crossovers', sets: 3, reps: '15 Reps', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=200' }
    ]
  },
  { 
    id: 'back', 
    name: 'Back', 
    image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=600&auto=format&fit=crop', 
    difficulty: 'Advanced', 
    duration: '50 Min', 
    calories: '400 kcal',
    youtubeId: 'RjexvOAsVtI', // Placeholder Back workout video
    exercises: [
      { name: 'Deadlifts', sets: 4, reps: '6-8 Reps', image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=200' },
      { name: 'Pull-Ups', sets: 4, reps: 'Until Failure', image: 'https://images.unsplash.com/photo-1598971639058-fab354c68115?q=80&w=200' },
      { name: 'Barbell Rows', sets: 3, reps: '10 Reps', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200' },
      { name: 'Lat Pulldowns', sets: 3, reps: '12 Reps', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200' }
    ]
  },
  { 
    id: 'legs', 
    name: 'Legs', 
    image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=600&auto=format&fit=crop', 
    difficulty: 'Hard', 
    duration: '60 Min', 
    calories: '500 kcal',
    youtubeId: 'RjexvOAsVtI', 
    exercises: [
      { name: 'Barbell Squats', sets: 4, reps: '8 Reps', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=200' },
      { name: 'Leg Press', sets: 3, reps: '12 Reps', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200' },
      { name: 'Walking Lunges', sets: 3, reps: '20 Steps', image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=200' },
      { name: 'Calf Raises', sets: 4, reps: '15 Reps', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200' }
    ]
  }
];

const ExerciseList = () => {
  const { userProfile, currentUser } = useAuth();
  const { addExerciseToLog } = useAppStore();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const handleStartWorkout = async (workout) => {
    if (!currentUser || !userProfile) return;
    
    setIsLogging(true);
    // Simulate workout completion and logging
    setTimeout(async () => {
      const caloriesBurned = parseInt(workout.calories);
      const durationMins = parseInt(workout.duration);

      addExerciseToLog(durationMins, caloriesBurned);

      try {
        const todayStr = getLocalTodayDateString();
        const logRef = doc(db, 'users', currentUser.uid, 'daily_logs', todayStr);
        await updateDoc(logRef, {
          exercise_minutes: increment(durationMins),
          calories_burned: increment(caloriesBurned)
        });
      } catch (err) {
        console.error("Error logging exercise:", err);
      }
      setIsLogging(false);
      setSelectedWorkout(null);
      setIsPlayingVideo(false);
    }, 1500);
  };

  return (
    <div className="py-6 pb-8 animate-in fade-in duration-300">
      
      <AnimatePresence mode="wait">
        {!selectedWorkout ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-white mb-2">Workouts</h1>
              <p className="text-slate-400">Select a category to begin your training.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workoutCategories.map((cat, i) => (
                <motion.div 
                  key={cat.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-[2rem] overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedWorkout(cat)}
                >
                  <div className="h-48 w-full relative">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 image-overlay-gradient"></div>
                    <div className="absolute top-4 right-4 bg-green-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                      {cat.difficulty}
                    </div>
                    <div className="absolute bottom-4 left-5 right-5">
                      <h3 className="font-extrabold text-white text-2xl">{cat.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-slate-300 text-sm font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-green-400" /> {cat.duration}</span>
                        <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-400" /> {cat.calories}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-4xl mx-auto"
          >
            <button 
              onClick={() => { setSelectedWorkout(null); setIsPlayingVideo(false); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Categories
            </button>

            <div className="glass-card rounded-[2rem] overflow-hidden">
              <div className="relative aspect-video w-full bg-slate-900 group">
                {isPlayingVideo && selectedWorkout.youtubeId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedWorkout.youtubeId}?autoplay=1`}
                    title={`${selectedWorkout.name} Tutorial`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    <img src={selectedWorkout.image} alt="Video Thumbnail" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        onClick={() => setIsPlayingVideo(true)}
                        className="w-20 h-20 bg-green-500/90 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors shadow-[0_0_30px_rgba(34,197,94,0.5)] pl-2"
                      >
                        <Play className="w-10 h-10 text-slate-950" fill="currentColor" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{selectedWorkout.difficulty}</span>
                      <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full">{selectedWorkout.name} Day</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">Shred & Tone</h2>
                  </div>
                  
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Time</p>
                      <p className="text-white font-bold flex items-center gap-1"><Clock className="w-4 h-4 text-green-500" /> {selectedWorkout.duration}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Burn</p>
                      <p className="text-white font-bold flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {selectedWorkout.calories}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                    <Dumbbell className="text-green-500 w-5 h-5" /> Exercises
                  </h3>
                  {selectedWorkout.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        {ex.image ? (
                          <img src={ex.image} alt={ex.name} className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-slate-400">{i+1}</div>
                        )}
                        <div>
                          <span className="text-white font-bold block">{ex.name}</span>
                          <span className="text-slate-400 text-sm font-medium">{ex.sets} Sets × {ex.reps}</span>
                        </div>
                      </div>
                      <div className="text-green-400 pr-2">
                        <CheckCircle className="w-6 h-6 opacity-30 hover:opacity-100 cursor-pointer transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handleStartWorkout(selectedWorkout)}
                  disabled={isLogging}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 text-slate-950 font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                >
                  {isLogging ? (
                    <><span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span> Finishing Workout...</>
                  ) : (
                    <><CheckCircle className="w-6 h-6" /> Complete Workout</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseList;
