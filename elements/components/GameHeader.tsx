import React from 'react';
import { GameState } from './types';

interface GameHeaderProps {
  gameState: GameState;
}

const GameHeader: React.FC<GameHeaderProps> = ({ gameState }) => {
  return (
    <div className="game-header roboto">
      <h3>Fiszki</h3>
      {gameState.currentStory && (
        <div className="game-stats">
          <span>📖 Rozdział: {gameState.chapter}</span>
          <span>⭐ Poziom: {gameState.level}/100</span>
        </div>
      )}
    </div>
  );
};

export default GameHeader;