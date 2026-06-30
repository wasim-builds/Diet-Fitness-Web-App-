import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import useAppStore from '../../store/useAppStore';
import { getLocalTodayDateString } from '../../utils/dateHelpers';
import foodsData from '../../data/foods.json';

const FoodLogView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);
  const [isLogging, setIsLogging] = useState(false);
  
  const { addFoodToLog } = useAppStore();

  const filteredFoods = foodsData.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (food) => {
    setSelectedFood(food);
    setServings(1);
  };

  const handleLog = async () => {
    if (!selectedFood || !auth.currentUser) return;
    setIsLogging(true);

    const multiplier = selectedFood.serving_multiplier * servings;
    const macros = {
      calories: Math.round(selectedFood.calories_per_100g * multiplier),
      protein: Math.round(selectedFood.protein * multiplier),
      carbs: Math.round(selectedFood.carbs * multiplier),
      fat: Math.round(selectedFood.fat * multiplier)
    };

    // Optimistic Update
    addFoodToLog(macros);
    
    // Clear selection
    setSelectedFood(null);
    setSearchTerm('');

    // Persist to DB
    try {
      const todayStr = getLocalTodayDateString();
      const logRef = doc(db, 'users', auth.currentUser.uid, 'daily_logs', todayStr);
      await updateDoc(logRef, {
        calories_consumed: increment(macros.calories),
        protein_consumed: increment(macros.protein),
        carbs_consumed: increment(macros.carbs),
        fat_consumed: increment(macros.fat)
      });
    } catch (err) {
      console.error("Error logging food:", err);
    }
    
    setIsLogging(false);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search for food..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
        />
      </div>

      {!selectedFood && searchTerm && (
        <div className="space-y-3">
          {filteredFoods.length > 0 ? (
            filteredFoods.map(food => (
              <button 
                key={food.id}
                onClick={() => handleSelect(food)}
                className="w-full flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-300 transition-colors text-left"
              >
                <div>
                  <p className="font-semibold text-slate-800">{food.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{Math.round(food.calories_per_100g * food.serving_multiplier)} kcal per {food.serving_unit}</p>
                </div>
                <div className="text-sky-500 bg-sky-50 p-2 rounded-full">
                  <Plus size={18} />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">No foods found.</div>
          )}
        </div>
      )}

      {selectedFood && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
          <h3 className="text-xl font-bold text-slate-800 mb-1">{selectedFood.name}</h3>
          <p className="text-sm text-slate-500 mb-6">Serving size: {selectedFood.serving_unit}</p>
          
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-slate-700">Number of servings</span>
            <input 
              type="number" 
              min="0.5" 
              step="0.5" 
              value={servings} 
              onChange={(e) => setServings(parseFloat(e.target.value) || 0)}
              className="w-20 text-center py-2 px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-4 gap-2 mb-6">
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">Kcal</p>
              <p className="font-bold text-slate-800">{Math.round(selectedFood.calories_per_100g * selectedFood.serving_multiplier * servings)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">Pro</p>
              <p className="font-bold text-slate-800">{Math.round(selectedFood.protein * selectedFood.serving_multiplier * servings)}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">Carb</p>
              <p className="font-bold text-slate-800">{Math.round(selectedFood.carbs * selectedFood.serving_multiplier * servings)}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">Fat</p>
              <p className="font-bold text-slate-800">{Math.round(selectedFood.fat * selectedFood.serving_multiplier * servings)}g</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setSelectedFood(null)}
              className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleLog}
              disabled={isLogging || servings <= 0}
              className="flex-1 py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              {isLogging ? 'Logging...' : 'Log Food'}
            </button>
          </div>
        </div>
      )}

      {!selectedFood && !searchTerm && (
        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl mt-4">
          <Search size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Search for food to add to your daily log.</p>
        </div>
      )}
    </div>
  );
};

export default FoodLogView;
