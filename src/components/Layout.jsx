import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Utensils, Dumbbell, TrendingUp, User } from 'lucide-react';

const Layout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Diet', path: '/diet', icon: Utensils },
    { name: 'Exercise', path: '/exercise', icon: Dumbbell },
    { name: 'Progress', path: '/progress', icon: TrendingUp },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto h-full p-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 safe-area-pb">
        <div className="max-w-md mx-auto flex justify-between items-center px-6 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center space-y-1 transition-colors ${
                    isActive ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'
                  }`
                }
              >
                <Icon size={24} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
