import { useState } from 'react';
import reactLogo from '@/assets/react.svg';
import wxtLogo from '/wxt.svg';
import './App.css';

function App() {
  const [text, setText]=useState("COS");
  const przycisk=()=>{
    chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
      chrome.tabs.sendMessage(tabs[0].id!,{type: "tekscik"},
        (response)=>{
          chrome.runtime.sendMessage({type: "ustaw", tekst: response},
            (res)=> setText(res)
          );

        }
      )
    });
    }
    const przycisk2=()=>{
    chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
      chrome.tabs.sendMessage(tabs[0].id!, {type: "tekscik2"},
        (response)=>{
          chrome.runtime.sendMessage({type: "ustaw", tekst: response},
            (res)=> setText(res)
          );

        }
      )
    });
    }

  return (
    <>
      <div>
        <a href="https://wxt.dev" target="_blank">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>WXT + React</h1>
      <div className="card">
        <button onClick={przycisk}>Pokaż</button>
        <button onClick={przycisk2}>Pokaż2</button>
        <p>
          {text}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;
