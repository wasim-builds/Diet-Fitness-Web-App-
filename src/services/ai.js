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
    For EACH meal type (breakfast, lunch, snack, dinner), you MUST provide an array of 3 different options so the user can choose what they want to eat.
    Make sure the options reflect their goal (e.g. if goal is loss, include green tea/low cal options. If gain, include high protein/dense options).
    
    Follow this exact JSON schema for the array of 7 objects:
    [
      {
        "day": 1,
        "meals": {
          "breakfast": [
            { "name": "Option 1 String", "items": [ { "name": "String", "amount": 1, "calories_per_100g": 100, "serving_multiplier": 1 } ] },
            { "name": "Option 2 String", "items": [ ... ] },
            { "name": "Option 3 String", "items": [ ... ] }
          ],
          "lunch": [ ...3 options... ],
          "snack": [ ...3 options... ],
          "dinner": [ ...3 options... ]
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

  // Dynamic Options Based on Goal
  const getBreakfastOptions = () => {
    const baseOpts = [
      {
        name: profile.dietType === 'vegetarian' ? 'Oats & Banana' : 'Eggs & Oats',
        items: [
          { ...getFood('Oats'), amount: 1 },
          { ...getFood(profile.dietType === 'vegetarian' ? 'Banana' : 'Eggs'), amount: 1 }
        ]
      },
      {
        name: profile.dietType === 'vegetarian' ? 'Tofu Scramble & Toast' : 'Omelette & Toast',
        items: [
          { ...getFood('Bread'), amount: 2 },
          { ...getFood(profile.dietType === 'vegetarian' ? 'Paneer' : 'Eggs'), amount: 1 } // Tofu is mocked by Paneer
        ]
      },
      {
        name: profile.goal === 'loss' ? 'Green Tea & Fruit Bowl' : 'Protein Smoothie Bowl',
        items: [
          { ...getFood(profile.goal === 'loss' ? 'Broccoli' : 'Yogurt'), amount: 1, name: profile.goal === 'loss' ? 'Green Tea' : 'Protein Powder' }, // Mock item
          { ...getFood('Apple'), amount: 1 },
          { ...getFood(profile.goal === 'gain' ? 'Almonds' : 'Banana'), amount: 1 }
        ]
      }
    ];
    return baseOpts;
  };

  const getLunchOptions = () => {
    return [
      {
        name: isVeg ? 'Rice, Dal & Paneer' : 'Chicken & Rice',
        items: [
          { ...getFood('Rice'), amount: 1 },
          { ...getFood(isVeg ? 'Dal' : 'Chicken'), amount: 1 },
          { ...getFood('Broccoli'), amount: 1 }
        ]
      },
      {
        name: isVeg ? 'Quinoa Salad & Paneer' : 'Tuna Salad Wrap',
        items: [
          { ...getFood('Bread'), amount: 1 },
          { ...getFood(isVeg ? 'Paneer' : 'Chicken'), amount: 1 },
          { ...getFood('Broccoli'), amount: 1 } // Mock salad
        ]
      },
      {
        name: profile.goal === 'loss' ? 'Clear Soup & Veggies' : 'Pasta & Meatballs',
        items: [
          { ...getFood(profile.goal === 'loss' ? 'Broccoli' : 'Rice'), amount: profile.goal === 'loss' ? 2 : 1 },
          { ...getFood(isVeg ? 'Dal' : 'Chicken'), amount: profile.goal === 'loss' ? 1 : 2 }
        ]
      }
    ];
  };

  const getSnackOptions = () => {
    return [
      {
        name: 'Greek Yogurt & Almonds',
        items: [
          { ...getFood('Yogurt'), amount: 1 },
          { ...getFood('Almonds'), amount: 1 }
        ]
      },
      {
        name: profile.goal === 'gain' ? 'Peanut Butter Toast' : 'Apple & Walnuts',
        items: [
          { ...getFood(profile.goal === 'gain' ? 'Bread' : 'Apple'), amount: 1 },
          { ...getFood('Almonds'), amount: 1 } // Mock nuts/peanut butter
        ]
      },
      {
        name: profile.goal === 'loss' ? 'Green Tea & Rice Cake' : 'Protein Shake',
        items: [
          { ...getFood(profile.goal === 'loss' ? 'Broccoli' : 'Yogurt'), amount: 1, name: profile.goal === 'loss' ? 'Green Tea' : 'Whey Protein' },
          { ...getFood('Oats'), amount: 0.5 }
        ]
      }
    ];
  };

  const getDinnerOptions = () => {
    return [
      {
        name: isVeg ? 'Paneer & Veggies' : 'Chicken & Veggies',
        items: [
          { ...getFood(isVeg ? 'Paneer' : 'Chicken'), amount: 1 },
          { ...getFood('Broccoli'), amount: 2 }
        ]
      },
      {
        name: isVeg ? 'Dal Tadka & Roti' : 'Grilled Fish & Sweet Potato',
        items: [
          { ...getFood('Bread'), amount: 2 },
          { ...getFood(isVeg ? 'Dal' : 'Chicken'), amount: 1 }
        ]
      },
      {
        name: profile.goal === 'loss' ? 'Light Salad Bowl' : 'Heavy Steak Dinner',
        items: [
          { ...getFood('Broccoli'), amount: profile.goal === 'loss' ? 3 : 1 },
          { ...getFood(isVeg ? 'Paneer' : 'Chicken'), amount: profile.goal === 'loss' ? 0.5 : 2 }
        ]
      }
    ];
  };

  const dayTemplate = {
    breakfast: getBreakfastOptions(),
    lunch: getLunchOptions(),
    snack: getSnackOptions(),
    dinner: getDinnerOptions()
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
