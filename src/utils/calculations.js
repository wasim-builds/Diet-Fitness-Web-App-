// Mifflin-St Jeor formula
export const calculateBMR = (gender, weightKg, heightCm, ageYears) => {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
  }
};

export const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  };
  return bmr * (multipliers[activityLevel] || 1.2);
};

export const calculateTargets = (tdee, weightKg, goal) => {
  let calories = Math.round(tdee);
  let proteinPerKg = 1.2;

  switch (goal) {
    case 'loss':
      calories = Math.round(tdee - 500);
      proteinPerKg = 1.6;
      break;
    case 'gain':
      calories = Math.round(tdee + 300);
      proteinPerKg = 2.0;
      break;
    case 'maintain':
    default:
      calories = Math.round(tdee);
      proteinPerKg = 1.2;
      break;
  }

  // Minimum safe calorie limits
  if (calories < 1200) calories = 1200;

  const proteinGrams = Math.round(weightKg * proteinPerKg);

  return {
    calories,
    protein: proteinGrams
  };
};
