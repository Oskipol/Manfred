import React from 'react';
import GameHeader from './components/GameHeader';
import ErrorMessage from './components/ErrorMessage';
import LoadingScreen from './components/LoadingScreen';
import StartMenu from './components/StartMenu';
import SavedGames from './components/SavedGames';
import Fiszki1 from './components/Fiszki1';
import StoryContent from './components/StoryContent';
import GameChoices from './components/GameChoices';
import GameHistory from './components/GameHistory';
import { useGameLogic } from './components/useGameLogic';

const Fiszki = () => {
  const {
    fiszkiText,
    gameState,
    isLoading,
    error,
    savedGames,
    showSaves,
    fiszki1,
    Obecne,
    los,
    setObecne,
    Powrot,
    setLos,
    setShowSaves,
    getfiszki1,
    setFiszkiText,
    setFiszki1,
    loadGame,
    deleteSave,
    startStory,
    makeChoice,
    resetGame,
    getChoiceColor,
    saveGame,
    dodajpkt,
    handleReturnToMenu
  } = useGameLogic();




  return (
    <div className='fisz'>
      <GameHeader gameState={gameState} />
      <ErrorMessage error={error} />

      {!gameState.currentStory && !isLoading && !fiszki1 && (
        <>
          <StartMenu 
            onStartFiszki={() => setFiszki1(true)}
            onStartStory={startStory}
          />
          <SavedGames
            savedGames={savedGames}
            showSaves={showSaves}
            onToggleSaves={() => setShowSaves(!showSaves)}
            onLoadGame={loadGame}
            onDeleteSave={deleteSave}
          />
        </>
      )}

      {isLoading && <LoadingScreen />}

      {fiszki1 && <Fiszki1 dodajpkt={dodajpkt} Powrot={Powrot} fiszkiText={fiszkiText} setFiszkiText={setFiszkiText} getfiszki1={getfiszki1} setObecne={setObecne} setLos={setLos} los={los} Obecne={Obecne} />}

      {gameState.currentStory && (
        <div className="story-section">
          <StoryContent
            gameState={gameState}
            onSaveGame={saveGame}
            onReturnToMenu={handleReturnToMenu}
          />
          
          <GameChoices
            gameState={gameState}
            isLoading={isLoading}
            onMakeChoice={makeChoice}
            getChoiceColor={getChoiceColor}
            onResetGame={resetGame}
          />

          <GameHistory gameState={gameState} />
        </div>
      )}
    </div>
  );
};

export default Fiszki;