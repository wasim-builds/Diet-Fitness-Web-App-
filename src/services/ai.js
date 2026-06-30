import { GoogleGenAI } from '@google/genai';
import foodsData from '../data/foods.json';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Google GenAI SDK (only if key is provided)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Generates a dynamic 7-day meal plan using the Gemini API.
 * Falls back to static generation if API key is missing or call fails.
 */
export const generateMealPlan = async (profile) => {
  if (!ai) {
    console.warn("No VITE_GEMINI_API_KEY found. Falling back to static meal plan.");
    return generateStaticMealPlan(profile);
  }

  const prompt = `
    You are an expert sports nutritionist. Create a strictly formatted 7-day meal plan for a user with the following profile:
    - Goal: ${profile.goal}
    - Diet Preference: ${profile.dietType}
    - Daily Target Calories: ${profile.targets.calories} kcal
    - Daily Target Protein: ${profile.targets.protein}g
    
    You MUST return the output EXACTLY as a JSON array of 7 objects.
    Each object must represent a day and follow this exact JSON schema:
    [
      {
        "day": 1,
        "meals": {
          "breakfast": {
            "name": "String",
            "items": [ { "name": "String", "amount": 1, "calories_per_100g": 100, "serving_multiplier": 1 } ]
          },
          "lunch": { ... },
          "snack": { ... },
          "dinner": { ... }
        }
      }
    ]
    Do not include any markdown formatting, backticks, or extra text. Only return the raw JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    let rawText = response.text;
    
    // Clean up potential markdown formatting if the model disobeys instructions
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/```/g, '').trim();
    }

    const plan = JSON.parse(rawText);
    
    if (Array.isArray(plan) && plan.length === 7) {
      return plan;
    } else {
      throw new Error("Invalid schema returned by AI");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    console.warn("Falling back to static meal plan.");
    return generateStaticMealPlan(profile);
  }
};

// Fallback / Static Rules Engine Generator
const generateStaticMealPlan = (profile) => {
  const isVeg = profile.dietType === 'vegetarian' || profile.dietType === 'eggetarian';
  
  // Filter foods
  const availableFoods = foodsData.filter(food => {
    if (isVeg && !food.veg_flag && food.name !== 'Eggs (Boiled)') return false;
    if (profile.dietType === 'vegetarian' && food.name === 'Eggs (Boiled)') return false;
    return true;
  });

  const getFood = (nameStr) => availableFoods.find(f => f.name.includes(nameStr)) || availableFoods[0];

  const dayTemplate = {
    breakfast: {
      name: profile.dietType === 'vegetarian' ? 'Oats & Banana' : 'Eggs & Oats',
      items: [
        { ...getFood('Oats'), amount: 1 },
        { ...getFood(profile.dietType === 'vegetarian' ? 'Banana' : 'Eggs'), amount: 1 }
      ]
    },
    lunch: {
      name: isVeg ? 'Rice, Dal & Paneer' : 'Chicken & Rice',
      items: [
        { ...getFood('Rice'), amount: 1 },
        { ...getFood(isVeg ? 'Dal' : 'Chicken'), amount: 1 },
        { ...getFood('Broccoli'), amount: 1 }
      ]
    },
    snack: {
      name: 'Greek Yogurt & Almonds',
      items: [
        { ...getFood('Yogurt'), amount: 1 },
        { ...getFood('Almonds'), amount: 1 }
      ]
    },
    dinner: {
      name: isVeg ? 'Paneer & Veggies' : 'Chicken & Veggies',
      items: [
        { ...getFood(isVeg ? 'Paneer' : 'Chicken'), amount: 1 },
        { ...getFood('Broccoli'), amount: 2 }
      ]
    }
  };

  const plan = [];
  for (let i = 1; i <= 7; i++) {
    plan.push({
      day: i,
      meals: dayTemplate
    });
  }

  return plan;
};
