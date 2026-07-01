import React, { useState } from 'react';
import { Search, Plus, ScanLine, X, Camera } from 'lucide-react';
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
  const [isScanning, setIsScanning] = useState(false);
  
  const { addFoodToLog } = useAppStore();

  const filteredFoods = foodsData.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (food) => {
    setSelectedFood(food);
    setServings(1);
    setIsScanning(false);
  };

  const simulateScan = () => {
    // Pick a random food item to simulate a successful barcode scan
    const randomFood = foodsData[Math.floor(Math.random() * foodsData.length)];
    setTimeout(() => {
      handleSelect(randomFood);
    }, 1500); // 1.5s delay to simulate scanning
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
          className="w-full pl-11 pr-14 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-white placeholder-slate-400"
        />
        <button 
          onClick={() => setIsScanning(true)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-green-500 transition-colors"
          title="Scan Barcode"
        >
          <ScanLine size={20} />
        </button>
      </div>

      {isScanning && !selectedFood && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 mb-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          <button 
            onClick={() => setIsScanning(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
            {/* Mock Camera Viewfinder */}
            <div className="absolute inset-0 border-2 border-green-500/30 rounded-2xl"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-2xl"></div>
            
            {/* Scanning Laser Animation */}
            <div className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,1)] animate-scan-laser"></div>
            <Camera className="text-slate-500/30 w-16 h-16" />
          </div>

          <p className="text-slate-300 font-medium mb-4 text-center">Point camera at a barcode</p>
          
          <button 
            onClick={simulateScan}
            className="bg-green-500/20 text-green-400 hover:bg-green-500/30 px-6 py-2 rounded-xl font-bold transition-colors border border-green-500/30"
          >
            Simulate Successful Scan
          </button>
        </div>
      )}

      {!selectedFood && searchTerm && !isScanning && (
        <div className="space-y-3">
          {filteredFoods.length > 0 ? (
            filteredFoods.map(food => (
              <button 
                key={food.id}
                onClick={() => handleSelect(food)}
                className="w-full flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm hover:border-green-500/50 hover:bg-white/10 transition-colors text-left"
              >
                <div>
                  <p className="font-bold text-white">{food.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{Math.round(food.calories_per_100g * food.serving_multiplier)} kcal per {food.serving_unit}</p>
                </div>
                <div className="text-green-400 bg-green-500/10 p-2 rounded-full">
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
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-md">
          <h3 className="text-xl font-bold text-white mb-1">{selectedFood.name}</h3>
          <p className="text-sm text-slate-400 mb-6">Serving size: {selectedFood.serving_unit}</p>
          
          <div className="flex items-center justify-between mb-6">
            <span className="font-bold text-slate-300">Number of servings</span>
            <input 
              type="number" 
              min="0.5" 
              step="0.5" 
              value={servings} 
              onChange={(e) => setServings(parseFloat(e.target.value) || 0)}
              className="w-20 text-center py-2 px-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="bg-white/5 p-4 rounded-2xl grid grid-cols-4 gap-2 mb-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">Kcal</p>
              <p className="font-bold text-white">{Math.round(selectedFood.calories_per_100g * selectedFood.serving_multiplier * servings)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">Pro</p>
              <p className="font-bold text-white">{Math.round(selectedFood.protein * selectedFood.serving_multiplier * servings)}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">Carb</p>
              <p className="font-bold text-white">{Math.round(selectedFood.carbs * selectedFood.serving_multiplier * servings)}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">Fat</p>
              <p className="font-bold text-white">{Math.round(selectedFood.fat * selectedFood.serving_multiplier * servings)}g</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setSelectedFood(null)}
              className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleLog}
              disabled={isLogging || servings <= 0}
              className="flex-1 py-3 bg-green-500 text-slate-950 font-bold rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              {isLogging ? 'Logging...' : 'Log Food'}
            </button>
          </div>
        </div>
      )}

      {!selectedFood && !searchTerm && !isScanning && (
        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl mt-4">
          <Search size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Search for food to add to your daily log.</p>
        </div>
      )}
    </div>
  );
};

export default FoodLogView;
