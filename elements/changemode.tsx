import React from 'react'
import { FaRegMoon } from "react-icons/fa";
import { IoSunnyOutline } from "react-icons/io5";

const Changemode = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
     useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "dark" || saved === "light") {
          setTheme(saved);
          document.documentElement.classList.toggle("dark", saved === "dark");
        }
      }, []);
    
      useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
      }, [theme]);
  return (
    <div>
      <input type="checkbox" className='eh' id="theme-toggle" style={{opacity:0, position: 'absolute'}} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <label htmlFor="theme-toggle" className='mode'><FaRegMoon className='moon' /><IoSunnyOutline className='sun' /></label>
    </div>
  )
}

export default Changemode