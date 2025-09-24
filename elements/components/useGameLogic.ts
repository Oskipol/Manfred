import { useState, useEffect } from 'react';
import { GameState, SavedGame, StoryChapter } from './types';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    text: "",
    chapter: 0,
    level: 1,
    history: [],
    choices: [],
    currentStory: undefined,
    isFinished: false,
    imageUrl: ""
  });
  const [Obecne, setObecne] = useState(0);
  const [los, setLos] = useState<number[]>([0,1,2,3,4,5,6,7,8,9]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [showSaves, setShowSaves] = useState(false);
  const [fiszki1, setFiszki1] = useState(false);
  const [imageCache, setImageCache] = useState<{[key: string]: string}>({});
  const [fiszkiText, setFiszkiText] = useState<string>("");

  useEffect(() => {
    loadSavedGames();
  }, []);

  useEffect(() => {
    if (gameState.currentStory && gameState.chapter > 0) {
      autoSaveGame();
      
      const cacheKey = `ch${gameState.chapter}-${gameState.currentStory.title}`;
      
      if (imageCache[cacheKey] && !gameState.imageUrl) {
        console.log('Używam cache obrazu dla rozdziału:', gameState.chapter);
        setGameState(prev => ({
          ...prev,
          imageUrl: imageCache[cacheKey]
        }));
      } else if (gameState.currentStory.image_prompt && !gameState.imageUrl && !imageCache[cacheKey]) {
        generateImage(gameState.currentStory.image_prompt);
      }
    }
  }, [gameState.chapter]);

  const generateImage = async (prompt: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "obraz",
        prompt: prompt
      });
      if (response && response.success) {
        const cacheKey = `ch${gameState.chapter}-${gameState.currentStory?.title}`;
        
        setImageCache(prev => ({
          ...prev,
          [cacheKey]: response.url
        }));
        
        setGameState(prev => ({
          ...prev,
          imageUrl: response.url 
        }));
      } else {
        console.error("Błąd generowania obrazu:", response?.error);
      }
    } catch (error) {
      console.error("Błąd w generowaniu obrazu:", error);
    }
  };

  const loadSavedGames = async () => {
    try {
      const result = await chrome.storage.local.get(['fantasyGames']);
      const saves = result.fantasyGames || [];
      setSavedGames(saves);
    } catch (error) {
      console.error('Błąd wczytywania zapisów:', error);
    }
  };

  const saveGame = async (gameTitle?: string) => {
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const currentUrl = tabs[0]?.url || '';
      
      const savedGame: SavedGame = {
        gameState: {
          ...gameState,
          savedAt: new Date().toISOString()
        },
        savedAt: new Date().toISOString(),
        websiteUrl: currentUrl,
        gameTitle: gameTitle || `Przygoda ${gameState.chapter} (${new Date().toLocaleString()})`
      };

      const existingSaves = await chrome.storage.local.get(['fantasyGames']);
      const saves = existingSaves.fantasyGames || [];
      
      const existingIndex = saves.findIndex((save: SavedGame) => 
        save.websiteUrl === currentUrl && Math.abs(save.gameState.chapter - gameState.chapter) <= 1
      );
      
      if (existingIndex >= 0) {
        saves[existingIndex] = savedGame;
      } else {
        saves.unshift(savedGame);
      }
    
      const limitedSaves = saves.slice(0, 10);
      
      await chrome.storage.local.set({ fantasyGames: limitedSaves });
      setSavedGames(limitedSaves);
      
    } catch (error) {
      console.error('Błąd zapisywania gry:', error);
      setError('Nie można zapisać gry');
    }
  };

  const autoSaveGame = async () => {
    if (gameState.chapter > 0 && gameState.currentStory) {
      await saveGame(`Auto ${gameState.chapter} ${gameState.currentStory.title || ''}`);
    }
  };

  const loadGame = async (savedGame: SavedGame) => {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const currentUrl = tabs[0]?.url || '';
    if (savedGame.websiteUrl === currentUrl) {
      setGameState(savedGame.gameState);
      setShowSaves(false);
      setError("");
    } else {
      setError("Ten zapis pochodzi z innej strony - nie można go wczytać.");
    }
  };

  const getfiszki1 = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
        if (!tabs[0]?.id) {
          reject(new Error('Nie można uzyskać dostępu do aktywnej karty'));
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id,{type: "tekscik"},
          (response)=>{
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            chrome.runtime.sendMessage({type: "fisz", tekst: response},
              (res)=> {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                  return;
                }
                if (res) {
                  setFiszkiText(res);
                  resolve();
                } else {
                  reject(new Error('Nie otrzymano odpowiedzi z serwera'));
                }
              }
            );
          }
        )
      });
    });
  }

  const deleteSave = async (index: number) => {
    try {
      const newSaves = savedGames.filter((_, i) => i !== index);
      await chrome.storage.local.set({ fantasyGames: newSaves });
      setSavedGames(newSaves);
    } catch (error) {
      console.error('Błąd usuwania zapisu:', error);
    }
  };

  const startStory = () => {
    setIsLoading(true);
    setError("");
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, {type: "tekscik"}, (response) => {
        if (!response) {
          setError("Nie można pobrać treści strony");
          setIsLoading(false);
          return;
        }
        
        const initialState: GameState = {
          text: response,
          chapter: 1,
          level: 2,
          history: [],
          choices: [],
          isFinished: false,
        };

        chrome.runtime.sendMessage({
          type: "generateStory",
          gameState: initialState
        }, (res) => {
          setIsLoading(false);
          if (res?.success) {
            setGameState({
              ...initialState,
              currentStory: res.story
            });
          } else {
            setError(res?.error || "Błąd generowania historii");
          }
        });
      });
    });
  };

  const makeChoice = (choiceIndex: number) => {
    if (!gameState.currentStory || isLoading) return;
    
    const choiceLevel = gameState.currentStory.choice_levels?.[choiceIndex] || gameState.currentStory.required_level;
    
    if (gameState.level < choiceLevel) {
      setError(`Potrzebujesz poziomu ${choiceLevel} aby wybrać tę opcję!`);
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    const selectedChoice = gameState.currentStory.choices[choiceIndex];
    const levelGain = Math.floor(choiceLevel / 10) + Math.floor(Math.random() * 5) + 1;
    
    const choiceText = typeof selectedChoice === 'object' && selectedChoice !== null
      ? (selectedChoice.choice || selectedChoice.text || 'Wybór bez nazwy')
      : selectedChoice;
    
    const newGameState: GameState = {
      ...gameState,
      chapter: gameState.chapter + 1,
      level: Math.min(gameState.level + levelGain, 100),
      history: [...gameState.history, `Rozdział ${gameState.chapter}: ${choiceText}`],
      choices: [...gameState.choices, selectedChoice],
      imageUrl: "" 
    };
    
    chrome.runtime.sendMessage({
      type: "generateStory",
      gameState: newGameState
    }, (res) => {
      setIsLoading(false);
      if (res?.success) {
        setGameState({
          ...newGameState,
          currentStory: res.story,
          isFinished: res.isFinished || false
        });
      } else {
        setError(res?.error || "Błąd kontynuacji historii");
      }
    });
  };

  const resetGame = () => {
    setGameState({
      text: "",
      chapter: 0,
      level: 1,
      history: [],
      choices: [],
      currentStory: undefined,
      isFinished: false,
      imageUrl: ""
    });
    setImageCache({});
    setError("");
  };

  const getChoiceColor = (choiceIndex: number) => {
    if (!gameState.currentStory?.choice_levels) return 'choice-normal';
    const reqLevel = gameState.currentStory.choice_levels[choiceIndex];
    const playerLevel = gameState.level;
    
    if (reqLevel > playerLevel) return 'choice-locked';
    if (reqLevel <= playerLevel - 10) return 'choice-easy';
    if (reqLevel === playerLevel) return 'choice-hard';
    return 'choice-normal';
  };

  const dodajpkt = async () => {
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const currentUrl = tabs[0]?.url || '';
      console.log('Current URL:', currentUrl);

      const existingSave = savedGames.find(save => save.websiteUrl === currentUrl);
      console.log('Existing Save:', existingSave?.websiteUrl);
      
      if (existingSave) {
        const levelBonus = 3;
        const updatedGameState = {
          ...existingSave.gameState,
          level: Math.min(existingSave.gameState.level + levelBonus, 100),
          history: [...existingSave.gameState.history, `🎓 Trening Fiszek: +${levelBonus} poziomów`]
        };

        const updatedSave: SavedGame = {
          ...existingSave,
          gameState: updatedGameState,
          savedAt: new Date().toISOString()
        };
        
        const newSaves = savedGames.map(save => 
          save.websiteUrl === currentUrl ? updatedSave : save
        );
        
        await chrome.storage.local.set({ fantasyGames: newSaves });
        setSavedGames(newSaves);
      } else {
        const newGameState: GameState = {
          text: "",
          chapter: 0,
          level: 4, 
          history: [`🎓 Trening Fiszek: +3 poziomy (start)`],
          choices: [],
          currentStory: undefined,
          isFinished: false
        };
        
        const newSave: SavedGame = {
          gameState: newGameState,
          savedAt: new Date().toISOString(),
          websiteUrl: currentUrl,
          gameTitle: `Fiszki ${new Date().toLocaleString()}`
        };
        
        const newSaves = [newSave, ...savedGames].slice(0, 10);
        await chrome.storage.local.set({ fantasyGames: newSaves });
        setSavedGames(newSaves);
        
        setError(`🎓 Utworzono nowy save z poziomem 4! Rozpocznij przygodę aby wykorzystać swój poziom.`);
      }
      
    } catch (error) {
      console.error('Błąd treningu fiszek:', error);
      setError('Błąd podczas treningu fiszek');
    }
  };

  const handleReturnToMenu = () => {
    if (gameState.chapter > 0) {
      saveGame(`Auto ${gameState.chapter} ${gameState.currentStory?.title || ''}`);
    }
    setIsLoading(false); 
    setGameState(prev => ({ ...prev, currentStory: undefined }));
  };
  const Powrot=()=>{
    setFiszki1(false);
    setFiszkiText("");
  }

  return {
    fiszkiText,
    gameState,
    isLoading,
    error,
    savedGames,
    showSaves,
    fiszki1,
    imageCache,
    Obecne,
    los,
    setFiszkiText,
    setShowSaves,
    getfiszki1,
    setFiszki1,
    setLos,
    loadGame,
    setObecne,
    deleteSave,
    startStory,
    makeChoice,
    resetGame,
    getChoiceColor,
    Powrot,
    saveGame,
    handleReturnToMenu,
    dodajpkt
  };
};