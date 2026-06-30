import React, { useState } from 'react';
import MealPlanView from './MealPlanView';
import FoodLogView from './FoodLogView';

const DietTab = () => {
  const [activeTab, setActiveTab] = useState('mealplan');

  return (
    <div className="py-6 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Diet & Nutrition</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your meals and log food.</p>
      </div>

      {/* Toggle */}
      <div className="flex p-1 bg-slate-200/50 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('mealplan')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'mealplan' 
              ? 'bg-white text-slate-800 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          My Meal Plan
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'log' 
              ? 'bg-white text-slate-800 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Log Food
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'mealplan' ? <MealPlanView /> : <FoodLogView />}
      </div>
    </div>
  );
};

export default DietTab;
