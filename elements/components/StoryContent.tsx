import React from 'react';
import { GameState } from './types';

interface StoryContentProps {
  gameState: GameState;
  onSaveGame: (title?: string) => void;
  onReturnToMenu: () => void;
}

const StoryContent: React.FC<StoryContentProps> = ({
  gameState,
  onSaveGame,
  onReturnToMenu
}) => {
  if (!gameState.currentStory) return null;

  return (
    <>
      <button 
        className='przycisk roboto' 
        style={{height: "40px", width: "80px"}} 
        onClick={onReturnToMenu}
      >
        Powrót
      </button>
      
      <div className="chapter-info roboto">
        <h4>📜 Rozdział {gameState.currentStory.chapter}</h4>
        <div className="chapter-controls">
          <span className="required-level roboto">
            🎯 Min. poziom: {gameState.currentStory.required_level}
          </span>
          <button 
            className="save-game-button roboto"
            onClick={() => onSaveGame(`Rozdział ${gameState.chapter} - ${new Date().toLocaleTimeString()}`)}
            title="Zapisz postęp gry"
          >
            💾
          </button>
        </div>
      </div>

      <div className="narration roboto">
        <p><strong>🏰 Opowieść:</strong></p>
        <p>{gameState.currentStory.narration}</p>
      </div>

      <div className="knowledge roboto">
        <p><strong>📖 Poznaj:</strong></p>
        <p>{gameState.currentStory.knowledge}</p>
      </div>

      {gameState.imageUrl && (
        <div className="image-preview" style={{
          backgroundImage: `url(${gameState.imageUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center'
        }}>
        </div>
      )}
    </>
  );
};

export default StoryContent;