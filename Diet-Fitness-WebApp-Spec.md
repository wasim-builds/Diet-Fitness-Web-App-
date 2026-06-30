# Diet & Fitness Web App — Build Spec + Prompt for Antigravity (Gemini)

## 1. What you're missing (gap check before you build)

Your idea covers the core (goal selection, diet type, exercise, calorie/protein tracking, login). Here's what's missing or under-specified, which will bite you later if not planned now:

**User profile data you haven't mentioned:**
- Age, gender, height, current weight, target weight — without these you cannot calculate calories (BMR/TDEE) at all. This is the actual engine of the app.
- Activity level (sedentary/desk job vs active) — changes calorie needs significantly.
- Allergies / medical conditions (diabetes, thyroid, PCOS) — many users will need this and it's a liability issue if ignored.
- Budget/cuisine region (North Indian, South Indian, etc.) — meal suggestions are useless if not regionally relevant.

**Core logic gaps:**
- How is BMR/TDEE calculated? (Mifflin-St Jeor formula is the standard — needed for "how much intake protein/calories" to mean anything.)
- How is "calorie burned" calculated for home exercises with no wearable? You'll need MET-value based estimates (e.g., bodyweight HIIT ≈ 8 MET) using time + weight.
- Protein target formula: typically 1.6-2.2g/kg bodyweight for muscle gain, 1.2-1.6g/kg for fat loss — needs to be a formula, not a guess.
- Progress tracking: weight log over time, photos (optional), measurements (waist, etc.) — you didn't mention this but it's essential for any fitness app; people quit apps that don't show progress.

**Product/UX gaps:**
- Onboarding flow — a wizard to capture goal + time + diet pref + body stats, not a settings page buried later.
- Meal plan needs to *regenerate* based on selections, not be static — you'll need either a rules engine or AI generation (Gemini API fits well here since you're using Antigravity/Gemini stack).
- Reminders/notifications (meal time, exercise time, water intake) — you mentioned tracking but not nudging; nudges are what drive retention.
- Streak/gamification — small but matters a lot for habit apps.
- Free-time vs work-time logic: you said "select work and free time" — clarify exactly what this changes (exercise timing slots? meal timing? both?).

**Technical/business gaps:**
- Authentication method (email/password, Google OAuth, or both).
- Data privacy — storing weight/health data requires you to think about basic data protection, even as an MVP.
- Mobile responsiveness — most users will use this on phone, not desktop.
- Admin/backend — who manages food database content, exercise database content?
- Monetization (free vs premium) — decide now even if you launch free, since it affects what features gate behind login.

I've folded all of this into the spec below.

---

## 2. Recommended Tech Stack (for Antigravity/Gemini)

- Frontend: React + Tailwind CSS
- Backend: Node.js/Express or Firebase Functions
- Database: Firebase Firestore (fastest with Gemini/Antigravity) or PostgreSQL if you want relational queries for food/exercise databases
- Auth: Firebase Auth (email/password + Google sign-in)
- AI layer: Gemini API for dynamic meal-plan generation and chat-based diet Q&A
- Hosting: Firebase Hosting or Vercel

---

## 3. Core Modules

1. **Onboarding wizard**: age, gender, height, current weight, target weight, activity level, work schedule (start/end time), free time slots, goal (weight loss/gain/muscle gain/maintenance), diet type (veg/non-veg/eggetarian/mixed), allergies, region/cuisine.
2. **Dashboard**: today's calorie target vs consumed, protein target vs consumed, water intake, next meal/exercise, streak counter, weight trend chart.
3. **Diet plan engine**: generates a weekly meal plan based on TDEE, protein target, diet preference, cuisine; user can swap meals from alternatives; logs what was actually eaten.
4. **Calorie & macro tracker**: search/log food (manual entry or small food database), auto-totals calories/protein/carbs/fat per day.
5. **Home exercise module**: filtered by available free time (15/30/45/60 min) and goal, video/GIF demo per exercise, logs completed sessions, estimates calories burned via MET formula.
6. **Progress tracker**: weight log over time with chart, optional measurements, before/after photo upload (private).
7. **Reminders**: meal times, exercise times, water intake, configurable per user's actual schedule.
8. **User profile & settings**: edit goals, recalculate targets when weight/activity changes.
9. **Auth & account**: signup/login, password reset, profile data stored securely per user.

---

## 4. Suggested Database Schema (high-level)

- `users`: id, email, name, age, gender, height_cm, weight_kg, target_weight_kg, activity_level, goal, diet_type, work_start, work_end, free_slots[], created_at
- `daily_logs`: user_id, date, calories_consumed, protein_consumed, carbs, fat, water_glasses, exercise_minutes, calories_burned
- `meal_plans`: user_id, week_start, day, meal_type, food_items[], calories, protein
- `foods`: id, name, calories_per_100g, protein, carbs, fat, veg_flag
- `exercises`: id, name, duration_options[], met_value, target_goal[], equipment(none), video_url
- `weight_logs`: user_id, date, weight_kg

---

## 5. Calculation Formulas (build these in first — they're the actual product)

- BMR (Mifflin-St Jeor):
  Men: `10×weight(kg) + 6.25×height(cm) − 5×age + 5`
  Women: `10×weight(kg) + 6.25×height(cm) − 5×age − 161`
- TDEE = BMR × activity multiplier (1.2 sedentary, 1.375 light, 1.55 moderate, 1.725 active)
- Calorie target: weight loss = TDEE − 500; muscle gain = TDEE + 300; maintenance = TDEE
- Protein target: fat loss 1.6g/kg, muscle gain 2.0g/kg, maintenance 1.2-1.4g/kg
- Calories burned (home exercise): `MET × weight(kg) × duration(hrs)`

---

## 6. Prompt to paste into Antigravity (Gemini)

```
Build a full-stack diet and fitness web application called "FitPlan" (placeholder name) using React + Tailwind for the frontend and Firebase (Auth + Firestore) for backend and authentication.

USER FLOW:
1. Signup/Login screen using Firebase Auth (email/password + Google sign-in).
2. After first login, run an onboarding wizard that collects: age, gender, height (cm), current weight (kg), target weight (kg), activity level (sedentary/light/moderate/active), goal (weight loss / weight gain / muscle gain / maintenance), diet preference (vegetarian / eggetarian / non-vegetarian / mixed), work start time, work end time, and available free time slots for exercise (morning/evening, with duration: 15/30/45/60 min). Save this profile to Firestore under the user's document.
3. On submission, calculate BMR using the Mifflin-St Jeor formula, then TDEE using the activity multiplier, then a daily calorie target and daily protein target (g/kg) based on the selected goal. Store these calculated targets in the user profile and recalculate whenever the user updates weight or activity level.

CORE SCREENS (after onboarding):
- Dashboard: shows today's calorie target vs. calories logged so far, protein target vs. protein logged, water glasses logged, a button to log exercise, and a weight trend line chart (using Recharts) pulling from a weight_logs collection.
- Diet Plan tab: generates a 7-day meal plan (breakfast/lunch/snack/dinner) matching the user's diet preference, calorie target, and protein target. Build this as a rules-based engine first (use a static foods JSON dataset with calories/protein/carbs per 100g, veg/non-veg flags), with each meal swappable from 2-3 alternatives. Leave a clearly marked function `generateMealPlan()` that can later call the Gemini API to dynamically generate more varied meals.
- Food Log tab: a search-and-log interface where users search a foods collection in Firestore and log quantity; auto-calculates calories/protein/carbs/fat added to today's totals.
- Exercise tab: lists home/bodyweight exercises (no equipment) filtered by the user's selected free-time duration and fitness goal. Each exercise has a name, MET value, demo description, and a "Mark Complete" button that logs duration and calculates calories burned using calories = MET × weight(kg) × duration(hours), saved to daily_logs.
- Progress tab: weight log entry form + line chart of weight over time; optional body measurements (waist, chest, hips) as additional fields.
- Profile/Settings tab: edit any onboarding field, triggers recalculation of calorie/protein targets.

DATABASE STRUCTURE (Firestore):
- users/{uid}: profile fields + calculated targets
- users/{uid}/daily_logs/{date}: calories_consumed, protein_consumed, water_glasses, exercise_minutes, calories_burned
- users/{uid}/weight_logs/{date}: weight_kg
- foods (top-level collection): name, calories_per_100g, protein, carbs, fat, veg_flag
- exercises (top-level collection): name, duration_options, met_value, goal_tags, instructions

DESIGN REQUIREMENTS:
- Mobile-first responsive design, clean modern UI with a teal/navy color scheme, card-based dashboard layout, bottom navigation bar on mobile.
- Use Tailwind CSS for all styling. Use Recharts for charts.
- Include loading states and empty states for all data-driven screens.

AUTH REQUIREMENTS:
- Protect all routes except login/signup using Firebase Auth state.
- Add password reset flow.

Build this incrementally: first set up auth + onboarding + profile calculation, then dashboard, then food log, then exercise tab, then diet plan generator, then progress tracking. After each module, verify it works end-to-end before moving to the next.
```

---

## 7. Suggested Build Order (MVP first, don't try to build everything at once)

1. Auth + onboarding + calorie/protein calculation engine (this alone is a usable MVP core)
2. Dashboard with manual food + exercise logging
3. Static rules-based diet plan generator
4. Exercise library filtered by time/goal
5. Progress tracking charts
6. Reminders/notifications
7. AI-powered dynamic meal generation (Gemini API) as a v2 upgrade once the rules-based version works
