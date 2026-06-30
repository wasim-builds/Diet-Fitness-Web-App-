import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../auth/AuthContext';
import { calculateBMR, calculateTDEE, calculateTargets } from '../../utils/calculations';

const Wizard = () => {
  const { currentUser, setUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activityLevel: 'sedentary',
    goal: 'maintain',
    dietType: 'mixed'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setLoading(true);
    setError('');

    try {
      const age = parseInt(formData.age, 10);
      const height = parseInt(formData.height, 10);
      const weight = parseFloat(formData.weight);

      const bmr = calculateBMR(formData.gender, weight, height, age);
      const tdee = calculateTDEE(bmr, formData.activityLevel);
      const targets = calculateTargets(tdee, weight, formData.goal);

      const profileData = {
        ...formData,
        age,
        height,
        weight,
        targets,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', currentUser.uid), profileData);
      setUserProfile(profileData); // Update context to trigger routing
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1120] text-slate-50 selection:bg-green-500/30 px-4 py-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-[2rem] p-8 md:p-10 relative z-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold text-white">Setup Profile</h1>
          <span className="text-sm font-bold text-green-400 bg-green-500/20 border border-green-500/20 px-4 py-1.5 rounded-full">Step {step} of 3</span>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm mb-8">{error}</div>}

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-2">Basic Information</h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-[#0B1120]/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white appearance-none">
                  <option value="male" className="bg-[#0B1120]">Male</option>
                  <option value="female" className="bg-[#0B1120]">Female</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Age (years)</label>
                <input type="number" name="age" required min="10" max="120" value={formData.age} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-[#0B1120]/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-slate-500" placeholder="e.g. 25" />
              </div>
              <button type="submit" className="w-full mt-8 bg-green-500 hover:bg-green-400 text-slate-950 font-extrabold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transform hover:-translate-y-0.5">Next Step</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-2">Body Measurements</h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Height (cm)</label>
                <input type="number" name="height" required min="100" max="250" value={formData.height} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-[#0B1120]/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-slate-500" placeholder="e.g. 175" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Weight (kg)</label>
                <input type="number" name="weight" required min="30" max="300" step="0.1" value={formData.weight} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-[#0B1120]/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-slate-500" placeholder="e.g. 70" />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={prevStep} className="w-1/3 glass-card bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl border border-white/10 transition-colors">Back</button>
                <button type="submit" className="w-2/3 bg-green-500 hover:bg-green-400 text-slate-950 font-extrabold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transform hover:-translate-y-0.5">Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-2">Goals & Preferences</h2>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Activity Level</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-[#0B1120]/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white appearance-none">
                  <option value="sedentary" className="bg-[#0B1120]">Sedentary (Office job, little exercise)</option>
                  <option value="light" className="bg-[#0B1120]">Lightly Active (1-3 days/week)</option>
                  <option value="moderate" className="bg-[#0B1120]">Moderately Active (3-5 days/week)</option>
                  <option value="active" className="bg-[#0B1120]">Very Active (6-7 days/week)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Primary Goal</label>
                <select name="goal" value={formData.goal} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-[#0B1120]/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white appearance-none">
                  <option value="loss" className="bg-[#0B1120]">Weight Loss</option>
                  <option value="maintain" className="bg-[#0B1120]">Maintain Weight</option>
                  <option value="gain" className="bg-[#0B1120]">Muscle/Weight Gain</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Diet Preference</label>
                <select name="dietType" value={formData.dietType} onChange={handleChange} className="w-full px-5 py-4 rounded-xl bg-[#0B1120]/60 border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-500 text-white appearance-none">
                  <option value="mixed" className="bg-[#0B1120]">Mixed (Everything)</option>
                  <option value="vegetarian" className="bg-[#0B1120]">Vegetarian</option>
                  <option value="eggetarian" className="bg-[#0B1120]">Eggetarian</option>
                  <option value="non-vegetarian" className="bg-[#0B1120]">Non-Vegetarian</option>
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={prevStep} disabled={loading} className="w-1/3 glass-card bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl border border-white/10 transition-colors disabled:opacity-50">Back</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-green-500 hover:bg-green-400 text-slate-950 font-extrabold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transform hover:-translate-y-0.5 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Finish Setup'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Wizard;
