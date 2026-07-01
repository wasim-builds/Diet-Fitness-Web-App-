import { create } from 'zustand';

const useAppStore = create((set) => ({
  todayLog: null,
  weeklyMealPlan: null,
  
  setTodayLog: (log) => set({ todayLog: log }),
  setWeeklyMealPlan: (plan) => set({ weeklyMealPlan: plan }),
  
  // Optimistic update for water
  addWaterGlass: () => set((state) => ({
    todayLog: state.todayLog ? {
      ...state.todayLog,
      water_glasses: (state.todayLog.water_glasses || 0) + 1
    } : null
  })),

  // Optimistic update for removing water
  removeWaterGlass: () => set((state) => {
    if (!state.todayLog || !state.todayLog.water_glasses) return state;
    return {
      todayLog: {
        ...state.todayLog,
        water_glasses: Math.max(0, state.todayLog.water_glasses - 1)
      }
    };
  }),

  // Optimistic update for logging food
  addFoodToLog: (macros) => set((state) => {
    if (!state.todayLog) return state;
    return {
      todayLog: {
        ...state.todayLog,
        calories_consumed: (state.todayLog.calories_consumed || 0) + macros.calories,
        protein_consumed: (state.todayLog.protein_consumed || 0) + macros.protein,
        carbs_consumed: (state.todayLog.carbs_consumed || 0) + macros.carbs,
        fat_consumed: (state.todayLog.fat_consumed || 0) + macros.fat,
      }
    };
  }),

  // Optimistic update for logging exercise
  addExerciseToLog: (minutes, caloriesBurned) => set((state) => {
    if (!state.todayLog) return state;
    return {
      todayLog: {
        ...state.todayLog,
        exercise_minutes: (state.todayLog.exercise_minutes || 0) + minutes,
        calories_burned: (state.todayLog.calories_burned || 0) + caloriesBurned
      }
    };
  })
}));

export default useAppStore;
