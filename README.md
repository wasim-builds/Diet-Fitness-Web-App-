# FitPlan - Premium Fitness & Diet Tracker 🏋️‍♂️🥗

![FitPlan Dashboard Preview](https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop)

FitPlan is a mobile-first, high-performance web application designed to help users track their fitness journey with a premium, state-of-the-art interface. Built using modern web technologies and featuring a stunning glassmorphic design system, FitPlan transforms the daily chore of tracking calories and exercises into a visually rewarding experience.

## ✨ Key Features

- **Premium Glassmorphism UI**: A stunning, modern dark-mode aesthetic with vibrant neon green accents.
- **Real-Time Authentication**: Fully integrated Firebase Auth system allowing seamless user account creation and switching.
- **Dynamic Onboarding**: A beautiful 3-step wizard that calculates your BMR, TDEE, and daily macro targets based on your exact body measurements and goals.
- **Interactive Workout Module**: Built-in exercise library featuring interactive YouTube tutorial integration, specific set/rep tracking, and exercise thumbnails.
- **AI-Powered Nutrition Coach**: Seamlessly connected to the Gemini AI to provide personalized macro tracking and meal suggestions based on your profile targets.
- **Global State Management**: Powered by Zustand for lightning-fast, reactive updates across the entire application without prop-drilling.
- **Progress Tracking**: Upload transformation photos and visualize your fitness journey securely.

## 🛠 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Custom Glassmorphism tokens)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **AI Integration**: Google Gemini API (`@google/genai`)
- **PWA Ready**: Integrated `vite-plugin-pwa` for offline capabilities and mobile installation.

## 🚀 Getting Started

### Prerequisites

You will need **Node.js** installed on your system and your own Firebase/Gemini API keys.

1. Clone the repository:
   ```bash
   git clone https://github.com/wasim-builds/Diet-Fitness-Web-App-.git
   cd Diet-Fitness-Web-App-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   VITE_GEMINI_API_KEY="your_gemini_api_key"
   VITE_FIREBASE_API_KEY="your_firebase_api_key"
   VITE_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
   VITE_FIREBASE_PROJECT_ID="your_firebase_project_id"
   VITE_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   VITE_FIREBASE_APP_ID="your_app_id"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

FitPlan is configured to be easily deployed via Firebase Hosting.
```bash
npm run build
npx firebase-tools deploy --only hosting
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/wasim-builds/Diet-Fitness-Web-App-/issues).

## 📝 License

This project is MIT licensed.
