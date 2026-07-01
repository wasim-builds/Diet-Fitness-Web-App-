import React, { useMemo } from 'react';
import useAppStore from '../../store/useAppStore';
import { ShoppingCart, Check, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const GroceryListView = () => {
  const { weeklyMealPlan } = useAppStore();
  const [checkedItems, setCheckedItems] = React.useState({});

  const toggleItem = (name) => {
    setCheckedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const groceryList = useMemo(() => {
    if (!weeklyMealPlan) return {};

    const list = {};

    weeklyMealPlan.forEach(dayPlan => {
      // For the grocery list, we'll just aggregate the FIRST option of each meal for simplicity
      const meals = ['breakfast', 'lunch', 'snack', 'dinner'];
      
      meals.forEach(mealType => {
        const options = dayPlan.meals[mealType];
        if (options && options.length > 0) {
          const selectedOption = options[0]; // Aggregate first option
          
          selectedOption.items.forEach(item => {
            if (!list[item.name]) {
              list[item.name] = { ...item, totalAmount: 0 };
            }
            list[item.name].totalAmount += (typeof item.amount === 'number' ? item.amount : 1);
          });
        }
      });
    });

    // Categorize ingredients (mock categorization based on common terms)
    const categorized = {
      'Produce': [],
      'Proteins & Meats': [],
      'Dairy & Eggs': [],
      'Pantry & Grains': [],
      'Other': []
    };

    Object.values(list).forEach(item => {
      const name = item.name.toLowerCase();
      if (name.includes('apple') || name.includes('banana') || name.includes('broccoli')) {
        categorized['Produce'].push(item);
      } else if (name.includes('chicken') || name.includes('tuna') || name.includes('whey')) {
        categorized['Proteins & Meats'].push(item);
      } else if (name.includes('egg') || name.includes('paneer') || name.includes('yogurt')) {
        categorized['Dairy & Eggs'].push(item);
      } else if (name.includes('rice') || name.includes('bread') || name.includes('oat') || name.includes('dal')) {
        categorized['Pantry & Grains'].push(item);
      } else {
        categorized['Other'].push(item);
      }
    });

    return categorized;
  }, [weeklyMealPlan]);

  if (!weeklyMealPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <ShoppingCart size={48} className="mb-4 opacity-50" />
        <p>Generate a meal plan first to view your grocery list.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-green-500/20 text-green-500 rounded-2xl">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your Weekly Grocery List</h2>
            <p className="text-slate-400 text-sm">Based on your personalized 7-day AI meal plan.</p>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          {Object.entries(groceryList).map(([category, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="text-lg font-bold text-green-400 mb-4 border-b border-white/10 pb-2">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item, idx) => {
                    const isChecked = checkedItems[item.name];
                    return (
                      <motion.div 
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleItem(item.name)}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors border ${
                          isChecked 
                            ? 'bg-green-500/10 border-green-500/30 text-slate-400' 
                            : 'glass-panel border-transparent hover:border-white/10 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={isChecked ? 'text-green-500' : 'text-slate-500'}>
                            {isChecked ? <Check size={20} /> : <Circle size={20} />}
                          </div>
                          <div>
                            <p className={`font-bold ${isChecked ? 'line-through' : ''}`}>{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.totalAmount} {item.serving_unit || 'servings'}</p>
                          </div>
                        </div>
                        {item.calories_per_100g && (
                          <div className="text-xs font-medium bg-slate-900/50 px-2 py-1 rounded-lg border border-white/5 opacity-70">
                            {item.calories_per_100g} kcal/100g
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GroceryListView;
