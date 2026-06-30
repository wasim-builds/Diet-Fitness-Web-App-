import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { generateMealPlan } from '../../services/ai';
import { Sparkles, RefreshCw, ChevronRight, Droplets, Flame, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import useAppStore from '../../store/useAppStore';

const COLORS = ['#22c55e', '#f97316', '#3b82f6']; // Protein, Carbs, Fat

const MealPlanView = () => {
  const { userProfile } = useAuth();
  const [mealPlan, setMealPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    breakfast: 0, lunch: 0, snack: 0, dinner: 0
  });
  const [loggedMeals, setLoggedMeals] = useState({});
  const { addFoodToLog } = useAppStore();

  const handleLogMeal = (mealType, mealData) => {
    let totalCals = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    mealData.items.forEach(item => {
      const amount = typeof item.amount === 'number' ? item.amount : 1;
      const mult = item.serving_multiplier || 1;
      const factor = amount * mult;
      
      totalCals += (item.calories_per_100g || 0) * factor;
      totalProtein += (item.protein_per_100g || 0) * factor;
      totalCarbs += (item.carbs_per_100g || 0) * factor;
      totalFat += (item.fat_per_100g || 0) * factor;
    });

    addFoodToLog({
      calories: Math.round(totalCals),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat)
    });

    setLoggedMeals(prev => ({ ...prev, [`${activeDay}-${mealType}`]: true }));
    setTimeout(() => {
      setLoggedMeals(prev => ({ ...prev, [`${activeDay}-${mealType}`]: false }));
    }, 2000);
  };

  useEffect(() => {
    setSelectedOptions({ breakfast: 0, lunch: 0, snack: 0, dinner: 0 });
  }, [activeDay]);

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
      <div className="flex flex-col items-center justify-center h-96 animate-in fade-in">
        <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-6"></div>
        <Sparkles className="text-green-500 animate-pulse mb-2" size={32} />
        <h2 className="text-xl font-bold text-white mb-2">AI is crafting your diet</h2>
        <p className="text-slate-400 font-medium text-center max-w-sm">Analyzing your goals and preferences to create the perfect nutrition plan.</p>
      </div>
    );
  }

  const currentDayPlan = mealPlan.find(p => p.day === activeDay)?.meals;
  if (!currentDayPlan) return null;

  // Mock macro data for the Pie Chart based on user targets
  const macroData = [
    { name: 'Protein', value: userProfile?.targets?.protein || 150 },
    { name: 'Carbs', value: 250 },
    { name: 'Fat', value: 70 },
  ];

  const renderMealCard = (mealType, mealOptions) => {
    const isArray = Array.isArray(mealOptions);
    const options = isArray ? mealOptions : [mealOptions];
    const currentIndex = selectedOptions[mealType];
    const mealData = options[currentIndex] || options[0];

    const images = {
      breakfast: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=600&auto=format&fit=crop',
      lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
      snack: 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=600&auto=format&fit=crop',
      dinner: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=600&auto=format&fit=crop'
    };

    return (
      <div className="glass-card rounded-[2rem] overflow-hidden mb-6 group hover:border-white/20 transition-colors">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
            <img src={images[mealType]} alt={mealType} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] md:bg-gradient-to-r md:from-transparent md:to-[#0B1120] pointer-events-none"></div>
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 uppercase tracking-wider">
              {mealType}
            </div>
            {options.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button 
                  onClick={() => setSelectedOptions(prev => ({...prev, [mealType]: (prev[mealType] - 1 + options.length) % options.length}))}
                  className="w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center text-white hover:bg-green-500 transition-colors border border-white/10"
                >&lt;</button>
                <button 
                  onClick={() => setSelectedOptions(prev => ({...prev, [mealType]: (prev[mealType] + 1) % options.length}))}
                  className="w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center text-white hover:bg-green-500 transition-colors border border-white/10"
                >&gt;</button>
              </div>
            )}
          </div>
          
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">{mealData.name}</h3>
              {options.length > 1 && <span className="text-sm font-medium text-green-400">Option {currentIndex + 1} of {options.length}</span>}
            </div>
            
            <ul className="space-y-3 mb-6">
              {mealData.items.map((item, idx) => {
                const amountStr = typeof item.amount === 'number' ? `${item.amount}x` : item.amount;
                const cals = item.calories_per_100g 
                  ? Math.round((item.calories_per_100g * (item.serving_multiplier || 1)) * (typeof item.amount === 'number' ? item.amount : 1))
                  : null;

                return (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span className="text-slate-300">{amountStr} {item.name}</span>
                    </div>
                    {cals && <span className="font-bold text-white">{cals} kcal</span>}
                  </li>
                );
              })}
            </ul>

            <button 
              onClick={() => handleLogMeal(mealType, mealData)}
              className="text-green-400 font-bold text-sm flex items-center gap-1 hover:text-green-300 w-max transition-colors"
            >
              {loggedMeals[`${activeDay}-${mealType}`] ? 'Logged! ✓' : <><ChevronRight className="w-4 h-4" /> Log this meal</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* Top Section: Macros & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Macros Pie Chart */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center">
          <h3 className="text-white font-bold mb-4">Daily Macros</h3>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 w-full">
            {macroData.map((m, i) => (
              <div key={m.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                {m.name}
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Targets */}
        <div className="glass-panel p-6 flex flex-col justify-center">
          <h3 className="text-white font-bold mb-6">Nutrition Targets</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center"><Flame /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Calories</p>
                <p className="text-2xl font-bold text-white">{userProfile?.targets?.calories || 2000} <span className="text-sm font-normal text-slate-500">kcal</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-500 flex items-center justify-center"><Activity /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Protein</p>
                <p className="text-2xl font-bold text-white">{userProfile?.targets?.protein || 150} <span className="text-sm font-normal text-slate-500">g</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-500 flex items-center justify-center"><Droplets /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Water Intake</p>
                <p className="text-2xl font-bold text-white">8 <span className="text-sm font-normal text-slate-500">glasses</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass-card p-6 bg-gradient-to-br from-[#0B1120] to-green-900/20 border-green-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-green-500/10"><Sparkles size={100} /></div>
          <div className="relative z-10">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-green-500 w-5 h-5" /> AI Recommendation
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Based on your goal to <strong>{userProfile?.goal}</strong>, today's plan is high in protein and features low-GI carbs to maintain steady energy levels throughout the day.
            </p>
            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
              <p className="text-green-400 font-bold text-sm mb-1">Tip of the day</p>
              <p className="text-slate-400 text-xs">Drink a glass of water 30 minutes before your meals to improve digestion.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Days Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-4">
        {[1, 2, 3, 4, 5, 6, 7].map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`min-w-[5rem] py-3 rounded-2xl text-sm font-bold transition-all ${
              activeDay === day 
                ? 'bg-green-500 text-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            Day {day}
          </button>
        ))}
      </div>

      {/* Meals List */}
      <div className="mt-4">
        {renderMealCard('breakfast', currentDayPlan.breakfast)}
        {renderMealCard('lunch', currentDayPlan.lunch)}
        {renderMealCard('snack', currentDayPlan.snack)}
        {renderMealCard('dinner', currentDayPlan.dinner)}
      </div>
      
      {/* Footer Actions */}
      <div className="mt-8 flex flex-col items-center">
        <button 
          onClick={fetchPlan}
          className="flex items-center gap-2 glass-card hover:bg-white/5 text-white font-bold px-6 py-3 rounded-2xl transition-all"
        >
          <RefreshCw size={18} /> Regenerate Weekly Plan
        </button>
      </div>
    </div>
  );
};

export default MealPlanView;
