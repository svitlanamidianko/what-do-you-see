import React, { useState, useCallback, useRef } from 'react';
import Deck from './components/Deck/Deck';
import backgroundImage from './assets/japanese gradients/O.png';
import axios from 'axios';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import ShaderText from './components/ShaderText';
import InputControls from './components/InputControls';
import './components/InputControls.css';
import flyButton from './assets/fly on button.png';

function App() {
  const [userInput, setUserInput] = useState('');
  const [currentGameId] = useState('game123');
  const [currentCardId, setCurrentCardId] = useState('');
  const userId = 'user123';
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
  const deckRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmission = useCallback(async () => {
    if (!userInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      await axios.post('http://localhost:7777/api/createuserentry', {
        entry: userInput,
        user_id: userId,
        game_id: currentGameId,
        card_id: currentCardId
      });
      setUserInput("");
      
      setTimeout(() => {
        deckRef.current?.triggerSwipe();
      }, 800);
      
    } catch (err) {
      console.log(err);
      const errorMessage = err.message === 'Network Error' 
        ? 'Unable to connect to the server. Please make sure the server is running.'
        : err.response?.data?.message || 'An unexpected error occurred';
      notifyMsg(errorMessage);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1200);
    }
  }, [userInput, userId, currentGameId, currentCardId, notifyMsg, isSubmitting]);

  // Add handler for Enter key
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default enter behavior
      handleSubmission();
    }
  }, [handleSubmission]);

  const handleSwipeComplete = useCallback(() => {
    handleSubmission();
  }, [handleSubmission]);

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
            onKeyDown={handleKeyPress}
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
            onClick={handleSubmission}
          >
            <img src={flyButton} alt="Submit" />
          </button>
        </div>
      </div>
      
      {/* Deck Section - Right Half */}
      <div className="deck-section">
        <div className="deck-container">
          <Deck 
            ref={deckRef}
            onCardChange={handleCardChange} 
            onSwipeComplete={handleSwipeComplete}
          />
        </div>
      </div>
    </div>
  );
}

export default App;



// Whispering soft winds
// Petals fall on quiet streams
// Sunset blushes gold