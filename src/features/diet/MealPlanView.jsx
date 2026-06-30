import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { generateMealPlan } from '../../services/ai';
import { Sparkles, RefreshCw } from 'lucide-react';

const MealPlanView = () => {
  const { userProfile } = useAuth();
  const [mealPlan, setMealPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPlan = async () => {
    if (!userProfile) return;
    setIsGenerating(true);
    try {
      const plan = await generateMealPlan(userProfile);
      setMealPlan(plan);
    } catch (err) {
      console.error("Failed to generate plan", err);
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    fetchPlan();
  }, [userProfile]);

  if (isGenerating || !mealPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-in fade-in">
        <Sparkles className="text-sky-500 animate-pulse mb-4" size={32} />
        <p className="text-slate-500 font-medium">Generating your personalized AI meal plan...</p>
      </div>
    );
  }

  const currentDayPlan = mealPlan.find(p => p.day === activeDay)?.meals;

  if (!currentDayPlan) return null;

  const renderMeal = (mealType, mealData) => {
    return (
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-800 capitalize">{mealType}</h3>
        </div>
        <p className="text-sm font-semibold text-sky-500 mb-3">{mealData.name}</p>
        <ul className="space-y-2">
          {mealData.items.map((item, idx) => {
            // Check if amount is string or number for AI compatibility
            const amountStr = typeof item.amount === 'number' ? `${item.amount}x` : item.amount;
            const cals = item.calories_per_100g 
              ? Math.round((item.calories_per_100g * (item.serving_multiplier || 1)) * (typeof item.amount === 'number' ? item.amount : 1))
              : null;

            return (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-slate-600">{amountStr} {item.name}</span>
                {cals && <span className="font-medium text-slate-700">{cals} kcal</span>}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {[1, 2, 3, 4, 5, 6, 7].map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`min-w-[4rem] py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeDay === day ? 'bg-sky-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2">
        {renderMeal('breakfast', currentDayPlan.breakfast)}
        {renderMeal('lunch', currentDayPlan.lunch)}
        {renderMeal('snack', currentDayPlan.snack)}
        {renderMeal('dinner', currentDayPlan.dinner)}
      </div>
      
      <div className="mt-6 flex flex-col items-center pb-6">
        <button 
          onClick={fetchPlan}
          className="flex items-center gap-2 bg-slate-100 text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <RefreshCw size={16} /> Regenerate Plan
        </button>
        <p className="text-xs text-center text-slate-400 mt-4 max-w-xs">
          Plan powered by Google Gemini AI. Make sure you log your actual food in the Food Log tab!
        </p>
      </div>
    </div>
  );
};

export default MealPlanView;
