import { get } from 'http';
import React, { useMemo } from 'react';

interface Fiszki1Props {
  fiszkiText: string;
  setFiszkiText: (text: string) => void;
  getfiszki1: () => void;
    setObecne: (num: number) => void;
    setLos: (los: number[]) => void;
    los: number[];
    Obecne: number;
}

const Fiszki1: React.FC<Fiszki1Props> = ({ fiszkiText, setFiszkiText, getfiszki1, setObecne, setLos, los, Obecne }) => {
  

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
  
  const wylosowanePytania = ()=>{
    if(los.length>1)return Math.floor(Math.random() * (los.length-1));
    else return 0;
  }
  const handleZamkniete=async (odpowiedz:string)=>{
    if(odpowiedz===poprawne[los[Obecne]]){
        alert("Dobra odpowiedź");
        const newLos = [...los];
        newLos.splice(Obecne,1);
        await setLos(newLos);
        setObecne(wylosowanePytania());
        console.log(los);
        console.log(Obecne);
        console.log(los[Obecne]);
    }
    else {alert("Zła odpowiedź. Spróbuj ponownie."); setObecne(wylosowanePytania());}
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
                        <h3>{String(zamkniete[los[Obecne]])}</h3>
                        <p onClick={() => handleZamkniete('A')}>{String(odpowiedziA[los[Obecne]])}</p>
                        <p onClick={() => handleZamkniete('B')}>{String(odpowiedziB[los[Obecne]])}</p>
                        <p onClick={() => handleZamkniete('C')}>{String(odpowiedziC[los[Obecne]])}</p>
                        <p onClick={() => handleZamkniete('D')}>{String(odpowiedziD[los[Obecne]])}</p>
                    </div>
               ) : (
                 <span>Pytanie otwarte</span>
               )}
 
            </div>
        )}
      
      
      
    </div>
  );
};

export default Fiszki1;