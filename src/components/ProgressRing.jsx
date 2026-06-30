import React from 'react';

const ProgressRing = ({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 10, 
  color = 'text-sky-500', 
  trackColor = 'text-slate-100',
  label = '',
  value = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Cap progress at 100% for the visual ring
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full" width={size} height={size}>
        {/* Track */}
        <circle
          className={`${trackColor} transition-all duration-300 ease-in-out`}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress */}
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold text-slate-800">{value}</span>
        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mt-0.5">{label}</span>
      </div>
    </div>
  );
};

export default ProgressRing;
