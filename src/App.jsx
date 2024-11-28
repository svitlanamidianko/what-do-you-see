import React, { useState } from 'react';
import Deck from './components/Deck/Deck';
import './index.css'

function App() {
  const [userInput, setUserInput] = useState('');

  return (
    <div className="w-screen h-screen flex">
      {/* Left Half - Question and Input */}
      <div className="flex-1 flex flex-col p-[10vh_5vw] font-['Cormorant_Garamond']">
        
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full min-h-[600px] mt-56 bg-transparent border-0 
                     text-6xl leading-none font-inherit resize-none outline-none 
                     text-gray-600 py-4 placeholder:text-gray-400"
          placeholder="what do you see?"
        />
      </div>

      {/* Deck Section - Right Half */}
      <div className="flex-1 relative h-screen flex items-center justify-center">
        <div className="relative w-[300px] h-[450px]">
          <Deck />
        </div>
      </div>
    </div>
  );
}

export default App;