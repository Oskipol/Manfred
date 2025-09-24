import React from 'react';
import { GameState } from './types';

interface GameHistoryProps {
  gameState: GameState;
}

const GameHistory: React.FC<GameHistoryProps> = ({ gameState }) => {
  if (gameState.history.length === 0) return null;

  return (
    <div className="history roboto">
      <details>
        <summary>📚 Historia twoich wyborów ({gameState.history.length})</summary>
        <div className="history-list">
          {gameState.history.map((item, index) => (
            <div key={index} className="history-item">
              <span className="history-number">{index + 1}.</span>
              <span className="history-text">{item}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default GameHistory;