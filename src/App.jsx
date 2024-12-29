import React, { useState, useCallback } from 'react';
import Deck from './components/Deck/Deck';
import backgroundImage from './assets/japanese gradients/O.png';
import axios from 'axios';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import ShaderText from './components/ShaderText';
import InputControls from './components/InputControls';
import './components/InputControls.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [currentGameId] = useState('game123');
  const [currentCardId, setCurrentCardId] = useState('');
  const userId = 'user123';
  const notifyInput = () =>  toast(`hey u, thanks for your input:) : ${userInput}`);
  const notifyMsg = (errorMsg) => toast(`
    Here what you submitted: ${userInput}
    Error: ${errorMsg}
  `);
  const [inputSettings, setInputSettings] = useState({
    fontSize: 76,
    fontFamily: 'Papyrus',
    color: '#666666',
    fontWeight: 400
  });

  const handleCardChange = useCallback((cardId) => {
    setCurrentCardId(cardId);
    console.log('Current card ID:', cardId);
  }, []);

  const handleSettingsChange = (setting, value) => {
    setInputSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div 
      className="app-container" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Left Half - Question and Input */}
      <div className="left-half">
        <div className="title-section">
          <ShaderText text="what do you see?" className="title" />
        </div>

        <div className="input-section">
          <ToastContainer />

          <textarea
            className="input-textarea"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="i see ..."
            style={{
              fontSize: `${inputSettings.fontSize}px`,
              fontFamily: inputSettings.fontFamily,
              color: inputSettings.color,
              fontWeight: inputSettings.fontWeight
            }}
          />

          <button
            className="submit-button"
            onClick={() => {
              axios.post('http://localhost:7777/api/createuserentry', {
                entry: userInput,
                user_id: userId,
                game_id: currentGameId,
                card_id: currentCardId
              })
                .then(response => {
                  console.log(response)
                  notifyInput()
                  setUserInput("");
                })
                .catch(err => {
                  console.log(err)
                  const errorMessage = err.message === 'Network Error' 
                    ? 'Unable to connect to the server. Please make sure the server is running.'
                    : err.response?.data?.message || 'An unexpected error occurred';
                  notifyMsg(errorMessage);
                });
            }}
          >
            fancy im done button
          </button>
        </div>
      </div>
      
      {/* Deck Section - Right Half */}
      <div className="deck-section">
        <div className="deck-container">
          <Deck onCardChange={handleCardChange} />
        </div>
      </div>
    </div>
  );
}

export default App;



// Whispering soft winds
// Petals fall on quiet streams
// Sunset blushes gold