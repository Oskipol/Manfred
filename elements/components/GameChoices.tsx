import React from 'react';
import { GameState } from './types';

interface GameChoicesProps {
  gameState: GameState;
  isLoading: boolean;
  onMakeChoice: (choiceIndex: number) => void;
  getChoiceColor: (choiceIndex: number) => string;
  onResetGame: () => void;
}

const GameChoices: React.FC<GameChoicesProps> = ({
  gameState,
  isLoading,
  onMakeChoice,
  getChoiceColor,
  onResetGame
}) => {
  if (!gameState.currentStory) return null;

  if (gameState.isFinished) {
    return (
      <div className="game-finished roboto">
        <h4>🎉 Koniec Przygody!</h4>
        <p>🏆 Gratulacje! Ukończyłeś epicką historię fantasy.</p>
        <p>⭐ Ostateczny poziom: <strong>{gameState.level}/100</strong></p>
        <button className='przycisk roboto' onClick={onResetGame}>
          🔄 Nowa Przygoda
        </button>
      </div>
    );
  }

  return (
    <div className="choices roboto">
      <p><strong>⚔️ Wybierz swoją ścieżkę:</strong></p>
      {gameState.currentStory.choices.map((choice, index) => {
        const choiceLevel = gameState.currentStory!.choice_levels?.[index] || gameState.currentStory!.required_level;
        const canChoose = gameState.level >= choiceLevel;
        const colorClass = getChoiceColor(index);
        const choiceText = typeof choice === 'object' && choice !== null 
          ? (choice.choice || choice.text || JSON.stringify(choice))
          : choice;
        
        return (
          <button
            key={index}
            className={`choice-button ${colorClass} ${!canChoose ? 'disabled' : ''}`}
            onClick={() => onMakeChoice(index)}
            disabled={!canChoose || isLoading}
          >
            <span className="choice-text">{choiceText}</span>
            <span className="choice-level roboto">
              {!canChoose ? `🔒 Wymagany lvl ${choiceLevel}` : 
               choiceLevel === gameState.level ? '💀 Trudny' :
               choiceLevel < gameState.level - 10 ? '😊 Łatwy' : '⚖️ Normalny'}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default GameChoices;