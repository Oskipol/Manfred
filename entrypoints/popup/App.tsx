import { useState, useRef, useEffect } from 'react';
import './App.css';
import { PiSpeakerLowFill } from "react-icons/pi";
import Changemode from '@/elements/changemode';
import Fiszki from '@/elements/fiszki';
import Roadmapa from '@/elements/roadmapa';
function App() {
  const [text, setText]=useState("Tutaj pojawi się streszczenie");
  const [isHidden, setIsHidden] = useState(true);
  const [isRoad, setIsRoad] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [Mymodel, setMymodel] = useState("");
  const [summaryLength, setSummaryLength] = useState(0);
  const slider =document.querySelector('.length-slider');
  const [znajdz, setZnajdz]=useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFindingLoading, setIsFindingLoading] = useState(false);

  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('volume');
    return savedVolume ? parseInt(savedVolume) : 50;
  });
 const snapToNearest = (value: number) => {
    if (value <= 33) { return 0;}
    if (value <= 66) return 1;
    return 2;
  };
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const wasLongPress = useRef(false);
  const getLengthLabel = (value: number) => {
    switch(value) {
      case 0: return "Short";
      case 1: return "Medium";
      case 2: return "Detailed";
      default: return "Short";
    }
  };

  const getLengthKey = (value: number) => {
    switch(value) {
      case 0: return "l1";
      case 1: return "l2";
      case 2: return "l3";
      default: return "l1";
    }
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const snappedValue = snapToNearest(value);
    (slider as HTMLElement)?.style.setProperty('--slider-value', snappedValue*50 +"%");
    setSummaryLength(snappedValue);
  };

  useEffect(() => {
    localStorage.setItem('summaryLength', summaryLength.toString());
  }, [summaryLength]);

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.speaker-container')) {
        setShowVolumeSlider(false);
      }
    };

    if (showVolumeSlider) {
      document.addEventListener('click', handleGlobalClick);
    }

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [showVolumeSlider]);

  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);
  
  const pokazOpis = () => {
    setIsHidden(true);
    setIsRoad(true);
  };
  
  const pokazFiszki = () => {
    setIsHidden(false);
    setIsRoad(true);
  };
  
  const pokazRoadmap = () => {
    setIsHidden(true);
    setIsRoad(false);
  };
  const handleMouseDown = () => {
    pressTimer.current = setTimeout(() => {
      setShowVolumeSlider(true);
    }, 500); 
  };

  const handleMouseUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("click");
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value));
  };

  const handleSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const przycisk=()=>{
    setIsLoading(true);
    chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
      chrome.tabs.sendMessage(tabs[0].id!,{type: "tekscik"},
        (response)=>{
          chrome.runtime.sendMessage({type: "ustaw", tekst: response, Mymodel: Mymodel, ll: getLengthKey(summaryLength), znajdz: znajdz },
            (res)=> {
              setText(res);
              setZnajdz(false);
              setIsLoading(false);
            }
          );
          

        }
      )
    });
    }
    
    const znajdzPodobne = () => {
      setIsFindingLoading(true);
      chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
        chrome.tabs.sendMessage(tabs[0].id!,{type: "tekscik"},
          (response)=>{
            chrome.runtime.sendMessage({type: "ustaw", tekst: response, Mymodel: Mymodel, ll: getLengthKey(summaryLength), znajdz: true },
              (res)=> {
                setText(res);
                setIsFindingLoading(false);
              }
            );
          }
        )
      });
    }
    const przycisk2=()=>{
    setIsLoading(true);
    chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
      chrome.tabs.sendMessage(tabs[0].id!, {type: "tekscik2"},
        (response)=>{
          chrome.runtime.sendMessage({type: "ustaw", tekst: response, Mymodel: Mymodel, ll: getLengthKey(summaryLength), znajdz: znajdz},
            (res)=> {
              setText(res);
              setIsLoading(false);
            }
          );

        }
      )
    });
    }

  return (
    <>
        <div className='nav'>
        <div className='tabs roboto' onClick={pokazRoadmap}>RoadMapa</div>
        <div className='tabs roboto' id='desc' onClick={pokazOpis}>OPIS</div>
        <div className='tabs roboto' onClick={pokazFiszki}>FISZKI</div>
        </div>
        <div style={{scale:0.7, position:"absolute", right: "0"}}><Changemode /></div>
        <div id='opis'>
          <div className='wybor'>
          <select 
            id="type" 
            value={Mymodel}
            onChange={(e) => setMymodel(e.target.value)}
          >
            <option className='roboto' value="" disabled >Wybierz model</option>
            <option className='roboto' value="prof_eng">Professional English</option>
            <option className='roboto' value="prof_pl">Professional Polish</option>
            <option className='roboto' value="casual_eng">Casual English</option>
            <option className='roboto' value="casual_pl">Casual Polish</option>
          </select>
          
          </div>
          <div className="slider-container">
            <label>{getLengthLabel(summaryLength)}</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={summaryLength * 50} 
              onChange={handleLengthChange}
              className="length-slider"
            />
          </div>
          
          <div className='przyciski'>
        <button className={`przycisk roboto ${isLoading ? 'button-loading' : ''}`} onClick={przycisk} disabled={isLoading}>
          {isLoading && <span className="loading-spinner"></span>}
          Streść Całość
        </button>
        <button className={`przycisk roboto ${isLoading ? 'button-loading' : ''}`} onClick={przycisk2} disabled={isLoading}>
          {isLoading && <span className="loading-spinner"></span>}
          Streść Zaznaczone
        </button>
          </div>
        </div>
        <div className='tekst roboto'>
        {text}
        <div className='speaker-container'>
          <PiSpeakerLowFill 
            className='icon'
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          />
          {showVolumeSlider && (
            <div className="volume-slider" onClick={handleSliderClick}>
              <input 
                type="range" 
                id="volume" 
                min={0} 
                max={100} 
                value={volume}
                onChange={handleVolumeChange}
                onClick={handleSliderClick}
              />
            </div>
          )}
        </div>
      </div>
          <div className='znajdz'>
            <button 
              style={{width: "70%"}} 
              onClick={znajdzPodobne} 
              className={`przycisk roboto ${isFindingLoading ? 'button-loading' : ''}`}
              disabled={isFindingLoading}
            >
              {isFindingLoading && <span className="loading-spinner"></span>}
              Znajdź podobne
            </button>
          </div>
        <div id='fiszki' className={isHidden ? 'ukryj' : 'pokaz'}>
        <Fiszki />
        </div>
        <div id='roadmap' className={isRoad ? 'ukryj2' : 'pokaz2'}>
        < Roadmapa />
        </div>

    </>
  );
}

export default App;
