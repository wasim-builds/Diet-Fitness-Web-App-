import React, { useState } from 'react';
import MealPlanView from './MealPlanView';
import FoodLogView from './FoodLogView';
import GroceryListView from './GroceryListView';

const DietTab = () => {
  const [activeTab, setActiveTab] = useState('mealplan');

  return (
    <div className="py-6 pb-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white">Diet & Nutrition</h1>
        <p className="text-slate-400 mt-1 font-medium">Manage your meals and log food.</p>
      </div>

      {/* Toggle */}
      <div className="flex p-1.5 glass-card rounded-[1.5rem] mb-8 border border-white/10">
        <button
          onClick={() => setActiveTab('mealplan')}
          className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${
            activeTab === 'mealplan' 
              ? 'bg-green-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          AI Diet Planner
        </button>
        <button
          onClick={() => setActiveTab('grocery')}
          className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${
            activeTab === 'grocery' 
              ? 'bg-green-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Grocery List
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all ${
            activeTab === 'log' 
              ? 'bg-green-500 text-slate-950 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Food Log
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'mealplan' && <MealPlanView />}
        {activeTab === 'grocery' && <GroceryListView />}
        {activeTab === 'log' && <FoodLogView />}
      </div>
    </div>
  );
};

export default DietTab;
