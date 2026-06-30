import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { LogOut, Bell, User, Edit3, Save, X, Shield, Activity, Users } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { useAuth } from '../auth/AuthContext';
import { calculateBMR, calculateTDEE, calculateTargets } from '../../utils/calculations';

const ProfileTab = () => {
  const { userProfile, setUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // profile, preferences, admin
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    age: userProfile?.age || '',
    height: userProfile?.height || '',
    weight: userProfile?.weight || '',
    goal: userProfile?.goal || 'maintain',
    activityLevel: userProfile?.activityLevel || 'sedentary',
    dietType: userProfile?.dietType || 'mixed'
  });

  const [reminders, setReminders] = useState({
    water: true,
    meals: true,
    workout: false,
    aiCoach: true
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
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

      const bmr = calculateBMR(userProfile.gender, weight, height, age);
      const tdee = calculateTDEE(bmr, formData.activityLevel);
      const targets = calculateTargets(tdee, weight, formData.goal);

      const updatedProfile = {
        ...userProfile,
        ...formData,
        age, height, weight, targets,
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
    <div className="py-6 pb-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Settings</h1>
        <p className="text-slate-400 mt-1 font-medium">Manage your account and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 glass-card rounded-[1.5rem] mb-8 border border-white/10">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'profile' ? 'bg-green-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        ><User size={16} /> Profile</button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'preferences' ? 'bg-green-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        ><Bell size={16} /> Preferences</button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'admin' ? 'bg-green-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        ><Shield size={16} /> Admin</button>
      </div>

      {activeTab === 'profile' && (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Personal Information</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-slate-950 bg-green-500 px-4 py-2 rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-sm font-bold text-slate-300 bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
                  <X size={16} /> Cancel
                </button>
                <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 text-sm font-bold text-slate-950 bg-green-500 px-4 py-2 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  {loading ? '...' : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            )}
          </div>

          <div className="glass-card p-6 md:p-8 rounded-[2rem] mb-6">
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
              <img src={`https://ui-avatars.com/api/?name=${userProfile?.name || 'User'}&background=22C55E&color=fff`} alt="Profile" className="w-20 h-20 rounded-full border-2 border-green-500/50" />
              <div>
                <h2 className="text-2xl font-bold text-white">{auth.currentUser?.email}</h2>
                <p className="text-slate-400 capitalize">{userProfile.gender} • {userProfile.dietType} Diet</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Age', name: 'age', type: 'number', suffix: 'yrs', val: formData.age, display: userProfile.age },
                { label: 'Height', name: 'height', type: 'number', suffix: 'cm', val: formData.height, display: userProfile.height },
                { label: 'Weight', name: 'weight', type: 'number', suffix: 'kg', val: formData.weight, display: userProfile.weight, step: '0.1' },
              ].map(field => (
                <div key={field.name} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{field.label}</label>
                  {isEditing ? (
                    <input type={field.type} step={field.step} name={field.name} value={field.val} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-green-500 text-white font-bold" />
                  ) : (
                    <p className="font-bold text-white text-lg">{field.display} <span className="text-sm text-slate-500 font-normal">{field.suffix}</span></p>
                  )}
                </div>
              ))}

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Goal</label>
                {isEditing ? (
                  <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-green-500 text-white font-bold">
                    <option value="loss">Weight Loss</option>
                    <option value="maintain">Maintain</option>
                    <option value="gain">Muscle Gain</option>
                  </select>
                ) : (
                  <p className="font-bold text-white text-lg capitalize">{userProfile.goal}</p>
                )}
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Activity Level</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-green-500 text-white font-bold">
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="active">Very Active</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          <div className="glass-card p-6 md:p-8 rounded-[2rem] mb-6">
            <h3 className="font-extrabold text-white text-xl mb-6 flex items-center gap-2">
              <Bell className="text-green-500 w-5 h-5" /> Notification Preferences
            </h3>
            <div className="space-y-6">
              {Object.entries(reminders).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <span className="text-base font-bold text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <p className="text-xs text-slate-400 mt-1">Receive alerts for {key.toLowerCase()} updates.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleReminder(key)}
                    className={`w-14 h-8 rounded-full transition-colors relative border ${value ? 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-slate-800 border-white/10'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full absolute top-[3px] transition-transform shadow-md ${value ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            <LogOut size={20} /> Sign Out of FitPlan
          </button>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-green-900/20 to-[#0B1120] border-green-500/20 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] text-green-500/10"><Shield size={150} /></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold text-white mb-2">System Admin</h2>
              <p className="text-green-400 font-medium">Platform Analytics & Moderation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center"><Users size={24} /></div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users</p>
                <p className="text-2xl font-extrabold text-white">12,458</p>
              </div>
            </div>
            <div className="glass-panel p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-500 flex items-center justify-center"><Activity size={24} /></div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Today</p>
                <p className="text-2xl font-extrabold text-white">3,205</p>
              </div>
            </div>
            <div className="glass-panel p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center"><Shield size={24} /></div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Reports</p>
                <p className="text-2xl font-extrabold text-white">12</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Activity Logs</h3>
            <div className="space-y-3">
              {[
                { time: '10:45 AM', action: 'New User Registered', detail: 'user1029@example.com' },
                { time: '10:30 AM', action: 'Community Post Flagged', detail: 'Post ID: #8492' },
                { time: '09:15 AM', action: 'System Backup', detail: 'Completed Successfully' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-400 text-sm font-medium w-20">{log.time}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{log.action}</p>
                    <p className="text-slate-500 text-xs">{log.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileTab;
