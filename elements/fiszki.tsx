import React from 'react'


const Fiszki = () => {
  const [fisz, setfisz]=React.useState("cos")
  const przycisk2=()=>{
    chrome.tabs.query({active:true,currentWindow:true},(tabs)=>{
      chrome.tabs.sendMessage(tabs[0].id!,{type: "tekscik"},
        (response)=>{
          chrome.runtime.sendMessage({type: "generateImage", prompt: response},
            (res)=> setfisz(res)
          );

        }
      )
    });
    }
  return (
    <div className='fisz'>
      <button className='przycisk' onClick={przycisk2}>Generuj fiszki ze wszystkiego</button>
      <button className='przycisk' onClick={przycisk2}>Generuj fiszki z zaznaczonego</button>
      <button className='przycisk' onClick={przycisk2}>Importuj</button>
      <button className='przycisk' onClick={przycisk2}>Eksportuj</button>
      {fisz}
    
    </div>
  )
}

export default Fiszki