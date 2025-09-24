import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading roboto">
      <p>⏳ Tworzę historię...</p>
      <div className="loading-animation">🌟✨🔮✨🌟</div>
    </div>
  );
};

export default LoadingScreen;