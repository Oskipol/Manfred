import React from 'react';

interface StartMenuProps {
  onStartFiszki: () => void;
  onStartStory: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStartFiszki, onStartStory }) => {
  return (
    <div className="start-section">
      <div className='pocz'>
        <button className='przycisk fantasy-start roboto' onClick={onStartFiszki}>
          Fiszki 1
        </button>
        <button className='przycisk fantasy-start roboto' onClick={onStartStory}>
          Rozpocznij Przygodę!
        </button>
      </div>
    </div>
  );
};

export default StartMenu;