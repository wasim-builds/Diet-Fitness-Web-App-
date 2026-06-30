import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { LogOut, Bell, User, Edit3, Save, X } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { useAuth } from '../auth/AuthContext';
import { calculateBMR, calculateTDEE, calculateTargets } from '../../utils/calculations';

const ProfileTab = () => {
  const { userProfile, setUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Local state for editing
  const [formData, setFormData] = useState({
    age: userProfile?.age || '',
    height: userProfile?.height || '',
    weight: userProfile?.weight || '',
    goal: userProfile?.goal || 'maintain',
    activityLevel: userProfile?.activityLevel || 'sedentary',
    dietType: userProfile?.dietType || 'mixed'
  });

  // Mock reminders state
  const [reminders, setReminders] = useState({
    water: true,
    meals: true,
    workout: false
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleReminder = (key) => {
    setReminders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      const age = parseInt(formData.age, 10);
      const height = parseInt(formData.height, 10);
      const weight = parseFloat(formData.weight);

      // Recalculate everything
      const bmr = calculateBMR(userProfile.gender, weight, height, age);
      const tdee = calculateTDEE(bmr, formData.activityLevel);
      const targets = calculateTargets(tdee, weight, formData.goal);

      const updatedProfile = {
        ...userProfile,
        ...formData,
        age,
        height,
        weight,
        targets,
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid), updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
    setLoading(false);
  };

  if (!userProfile) return null;

  return (
    <div className="py-6 pb-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your settings.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-sky-500 bg-sky-50 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors"
          >
            <Edit3 size={16} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X size={16} /> Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1 text-sm font-semibold text-white bg-sky-500 px-3 py-1.5 rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : <><Save size={16} /> Save</>}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{auth.currentUser?.email}</h2>
            <p className="text-sm text-slate-500 capitalize">{userProfile.gender} • {userProfile.dietType} Diet</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Age</label>
            {isEditing ? (
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-semibold" />
            ) : (
              <p className="font-semibold text-slate-800">{userProfile.age} yrs</p>
            )}
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Height</label>
            {isEditing ? (
              <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-semibold" />
            ) : (
              <p className="font-semibold text-slate-800">{userProfile.height} cm</p>
            )}
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Weight</label>
            {isEditing ? (
              <input type="number" name="weight" step="0.1" value={formData.weight} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-semibold" />
            ) : (
              <p className="font-semibold text-slate-800">{userProfile.weight} kg</p>
            )}
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Goal</label>
            {isEditing ? (
              <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-semibold text-sm">
                <option value="loss">Loss</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain</option>
              </select>
            ) : (
              <p className="font-semibold text-slate-800 capitalize">{userProfile.goal}</p>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-4 bg-slate-50 p-4 rounded-2xl">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Activity Level</label>
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-semibold text-sm">
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="active">Very Active</option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-sky-500" /> Notifications
        </h3>
        <div className="space-y-4">
          {Object.entries(reminders).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700 capitalize">{key} Reminders</span>
              <button 
                onClick={() => handleToggleReminder(key)}
                className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-sky-500' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${value ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold py-3.5 rounded-2xl hover:bg-red-100 transition-colors"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
};

export default ProfileTab;
