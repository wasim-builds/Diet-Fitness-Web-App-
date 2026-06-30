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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Setup Profile</h1>
          <span className="text-sm font-medium text-sky-500 bg-sky-50 px-3 py-1 rounded-full">Step {step} of 3</span>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">{error}</div>}

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Age (years)</label>
                <input type="number" name="age" required min="10" max="120" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. 25" />
              </div>
              <button type="submit" className="w-full mt-6 bg-sky-500 text-white font-semibold py-3 rounded-xl hover:bg-sky-600 transition-colors">Next Step</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Body Measurements</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                <input type="number" name="height" required min="100" max="250" value={formData.height} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. 175" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <input type="number" name="weight" required min="30" max="300" step="0.1" value={formData.weight} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. 70" />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={prevStep} className="w-1/3 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-colors">Back</button>
                <button type="submit" className="w-2/3 bg-sky-500 text-white font-semibold py-3 rounded-xl hover:bg-sky-600 transition-colors">Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Goals & Preferences</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Activity Level</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                  <option value="sedentary">Sedentary (Office job, little exercise)</option>
                  <option value="light">Lightly Active (1-3 days/week)</option>
                  <option value="moderate">Moderately Active (3-5 days/week)</option>
                  <option value="active">Very Active (6-7 days/week)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Goal</label>
                <select name="goal" value={formData.goal} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                  <option value="loss">Weight Loss</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Muscle/Weight Gain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diet Preference</label>
                <select name="dietType" value={formData.dietType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                  <option value="mixed">Mixed (Everything)</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                </select>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={prevStep} disabled={loading} className="w-1/3 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50">Back</button>
                <button type="submit" disabled={loading} className="w-2/3 bg-sky-500 text-white font-semibold py-3 rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50">
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
