import React from 'react';

const Loading = ({ size = 'md', color = '#164E63', text = '加载中...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div
        className={`
          ${sizeClasses[size]}
          border-t-transparent
          border-[${color}]
          rounded-full
          animate-spin
          mb-4
        `}
      />
      {text && <p className="text-[${color}] font-medium">{text}</p>}
    </div>
  );
};

export default Loading;