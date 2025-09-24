import React from 'react';
import { SavedGame } from './types';

interface SavedGamesProps {
  savedGames: SavedGame[];
  showSaves: boolean;
  onToggleSaves: () => void;
  onLoadGame: (save: SavedGame) => void;
  onDeleteSave: (index: number) => void;
}

const SavedGames: React.FC<SavedGamesProps> = ({
  savedGames,
  showSaves,
  onToggleSaves,
  onLoadGame,
  onDeleteSave
}) => {
  return (
    <div className="save-controls">
        <div className='button-group'>
      <button 
        className='przycisk save-button roboto' 
        onClick={onToggleSaves}
      >
        Zapisane Przygody ({savedGames.length})
      </button>
      {savedGames.length > 0 && (
        <button 
          className='przycisk load-last-button roboto'
          onClick={() => onLoadGame(savedGames[0])}
        >
          Kontynuuj Ostatnią
        </button>
      )}
      </div>

      {showSaves && (
        <div className="saved-games roboto">
          <h4>Zapisane Przygody</h4>
          {savedGames.length === 0 ? (
            <p>Brak zapisanych gier</p>
          ) : (
            <div className="saves-list">
              {savedGames.map((save, index) => (
                <div key={index} className="save-item">
                  <div className="save-info">
                    <div className="save-title">{save.gameTitle}</div>
                    <div>
                      <a className='saved-url' href={save.websiteUrl} target='_blank'>
                        {save.websiteUrl}
                      </a>
                    </div>
                    <div className="save-details roboto">
                      📖 Rozdział {save.gameState.chapter} | ⭐ Poziom {save.gameState.level}
                    </div>
                    <div className="save-date">
                      {new Date(save.savedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="save-actions">
                    <button 
                      className="load-button roboto"
                      onClick={() => onLoadGame(save)}
                    >
                      📂 Wczytaj
                    </button>
                    <button 
                      className="delete-button roboto"
                      onClick={() => onDeleteSave(index)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedGames;