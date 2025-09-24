import React from 'react';
import GameChoices from './components/GameChoices';
import { GameState } from './components/types';

interface WyboryProps {
  gameState: GameState;
  isLoading: boolean;
  onMakeChoice: (choiceIndex: number) => void;
  getChoiceColor: (choiceIndex: number) => string;
  onResetGame: () => void;
}

const Wybory: React.FC<WyboryProps> = ({
  gameState,
  isLoading,
  onMakeChoice,
  getChoiceColor,
  onResetGame
}) => {
  return (
    <GameChoices
      gameState={gameState}
      isLoading={isLoading}
      onMakeChoice={onMakeChoice}
      getChoiceColor={getChoiceColor}
      onResetGame={onResetGame}
    />
  );
};

export default Wybory;