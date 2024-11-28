import React, { useState, useRef } from 'react';
import Deck from './components/Deck/Deck';
import './index.css'

function App() {
  const [userInput, setUserInput] = useState('');
  const deckRef = useRef();

  const handleNextCard = () => {
    // We'll implement the animation trigger here
    if (deckRef.current) {
      deckRef.current.triggerNextCardAnimation();
    }
    setUserInput(''); // Clear input
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Left Half - Question and Input */}
      <div className="flex-1 flex flex-col p-[10vh_5vw] font-['Cormorant_Garamond']">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full min-h-[200px] mt-56 bg-transparent border-0 
                     text-6xl leading-none font-inherit resize-none outline-none 
                     text-gray-600 py-4 placeholder:text-gray-400"
          placeholder="what do you see?"
        />
        
        {/* Next Card Button - Moved under textarea */}
        {userInput.trim().length > 0 && (
          <button
            onClick={handleNextCard}
            className="mt-8 px-6 py-3 w-fit self-end
                     border border-gray-300 rounded-lg
                     text-xl text-gray-600 hover:text-gray-800
                     hover:border-gray-400 transition-all
                     bg-white/50 backdrop-blur-sm"
          >
            next card
          </button>
        )}
      </div>

      {/* Deck Section - Right Half */}
      <div className="flex-1 relative h-screen flex items-center justify-center">
        <div className="relative w-[300px] h-[450px]">
          <Deck ref={deckRef} />
        </div>
      </div>
    </div>
  );
}

export default App;