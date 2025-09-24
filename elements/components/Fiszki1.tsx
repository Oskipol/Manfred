import { get } from 'http';
import React, { useMemo, useState } from 'react';
import FiszkaFeedback from './FiszkaFeedback';

interface Fiszki1Props {
  fiszkiText: string;
  setFiszkiText: (text: string) => void;
  getfiszki1: () => void;
  Powrot: () => void;
  setObecne: (num: number) => void;
  setLos: (los: number[]) => void;
  dodajpkt: () => void;
  los: number[];
  Obecne: number;
}

const Fiszki1: React.FC<Fiszki1Props> = ({ fiszkiText, dodajpkt, setFiszkiText, getfiszki1, setObecne, setLos, los, Obecne, Powrot }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [pendingQuestionChange, setPendingQuestionChange] = useState<(() => void) | null>(null);

  const showFiszkaFeedback = (message: string, isCorrect: boolean, onNext?: () => void) => {
    setFeedback(`${isCorrect ? '1' : '0'};${message}`);
    setShowFeedback(true);
    if (onNext) {
      setPendingQuestionChange(() => onNext);
    }
  };

  const closeFeedback = () => {
    setShowFeedback(false);
    if (pendingQuestionChange) {
      pendingQuestionChange();
      setPendingQuestionChange(null);
    }
  };

  const { zamkniete, otwarte, odpowiedziA, odpowiedziB, odpowiedziC, odpowiedziD, poprawne } = useMemo(() => {
    if (!fiszkiText || fiszkiText === "Gotowy?") {
      return {
        zamkniete: [],
        otwarte: [],
        odpowiedziA: [],
        odpowiedziB: [],
        odpowiedziC: [],
        odpowiedziD: [],
        poprawne: []
      };
    }

    try {

      const data = JSON.parse(fiszkiText);
      

      const zamkniete = [];
      const otwarte = [];
      const odpowiedziA = [];
      const odpowiedziB = [];
      const odpowiedziC = [];
      const odpowiedziD = [];
      const poprawne = [];

      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('zamkniete')) {
          const num = parseInt(key.replace('zamkniete', '')) - 1;
          zamkniete[num] = value;
        } else if (key.startsWith('otwarte')) {
          const num = parseInt(key.replace('otwarte', '')) - 1;
          otwarte[num] = value;
        } else if (key.startsWith('A')) {
          const num = parseInt(key.substring(1)) - 1;
          odpowiedziA[num] = value;
        } else if (key.startsWith('B')) {
          const num = parseInt(key.substring(1)) - 1;
          odpowiedziB[num] = value;
        } else if (key.startsWith('C')) {
          const num = parseInt(key.substring(1)) - 1;
          odpowiedziC[num] = value;
        } else if (key.startsWith('D')) {
          const num = parseInt(key.substring(1)) - 1;
          odpowiedziD[num] = value;
        } else if (key.startsWith('poprawne')) {
          const num = parseInt(key.replace('poprawne', '')) - 1;
          poprawne[num] = value;
        }
      }

      return { zamkniete, otwarte, odpowiedziA, odpowiedziB, odpowiedziC, odpowiedziD, poprawne };
      
    } catch (error) {
      console.error('Błąd parsowania:', error);
      return {
        zamkniete: [],
        otwarte: [],
        odpowiedziA: [],
        odpowiedziB: [],
        odpowiedziC: [],
        odpowiedziD: [],
        poprawne: []
      };
    }
  }, [fiszkiText]);
  

  const handleZamkniete=async (odpowiedz:string)=>{
    if(odpowiedz===poprawne[los[Obecne]]){
        const nextQuestion = async () => {
          const newLos = [...los];
          newLos.splice(Obecne,1);
          await setLos(newLos);
          
          if(newLos.length === 0) {
            dodajpkt();
            Powrot();
          } else {
            setObecne(Math.floor(Math.random() * newLos.length));
          }
        };
        showFiszkaFeedback("Dobra odpowiedź", true, nextQuestion);
    }
    else {
        const nextQuestion = () => {
          setObecne(Math.floor(Math.random() * los.length));
        };
        showFiszkaFeedback("Zła odpowiedź. Spróbuj ponownie.", false, nextQuestion);
    }
  }
  const handleOtwarte=(odpowiedz:string)=>{
    const pytanie = otwarte[los[Obecne]-7];
    chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
      chrome.tabs.sendMessage(tabs[0].id!,{type: "tekscik"},
        (response)=>{
          chrome.runtime.sendMessage({type: "sprawdz", tekst: response, pytanie: pytanie, odpowiedz: odpowiedz },
            async(res)=> {
              const odp=res.split(";");
              if(odp[0]==="1"){ 
                const nextQuestion = async () => {
                  const newLos = [...los];
                  newLos.splice(Obecne,1);
                  await setLos(newLos);
                  
                  if(newLos.length === 0) {
                    dodajpkt();
                    Powrot();
                  } else {
                    setObecne(Math.floor(Math.random() * newLos.length));
                  }
                };
                showFiszkaFeedback(odp[1] || "Dobra odpowiedź!", true, nextQuestion);
              }
              else {
                const nextQuestion = () => {
                  setObecne(Math.floor(Math.random() * los.length));
                };
                showFiszkaFeedback(odp[1] || "Zła odpowiedź", false, nextQuestion);
              }
            }
          );
          

        }
      )
    });
    }
  return (
    <div className='fiszki1'>
        {!fiszkiText&&(
            <button className='przycisk' onClick={() => {getfiszki1()}}>Generuj Quiz</button>
            )}
        {fiszkiText&&(
            <div>

               {los[Obecne] < 7 ? (
                    <div>
                        <h3 className='roboto'>{String(zamkniete[los[Obecne]])}</h3>
                        <div className='odd'>
                        <p onClick={() => handleZamkniete('A')}>{String(odpowiedziA[los[Obecne]])}</p>
                        <p onClick={() => handleZamkniete('B')}>{String(odpowiedziB[los[Obecne]])}</p>
                        <p onClick={() => handleZamkniete('C')}>{String(odpowiedziC[los[Obecne]])}</p>
                        <p onClick={() => handleZamkniete('D')}>{String(odpowiedziD[los[Obecne]])}</p>
                        </div>
                    </div>
               ) : (
                 <div className='otwarte roboto'>
                 <h3 className='roboto'>{String(otwarte[los[Obecne]-7])}</h3>
                  <input className='input-odpowiedz' type="text" placeholder='Twoja odpowiedź' id='odpowiedz'/>
                  <button className='przycisk' onClick={() => {
                    const input = document.getElementById('odpowiedz') as HTMLInputElement | null;
                    if (input) {
                      handleOtwarte(input.value);
                    } else {
                      showFiszkaFeedback('Nie znaleziono pola odpowiedzi.', false);
                    }
                  }}>Sprawdź</button>
                 </div>
               )}
 
            </div>
        )}
      
      <FiszkaFeedback 
        feedback={feedback}
        isVisible={showFeedback}
        onClose={closeFeedback}
      />
<button onClick={Powrot} className='przycisk powroty'>Powrót do menu</button>
    </div>
  );
};

export default Fiszki1;