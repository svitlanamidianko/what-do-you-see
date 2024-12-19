import React, { useState } from 'react';
import Deck from './components/Deck/Deck';
import backgroundImage from './assets/japanese gradients/O.png';
import axios from 'axios';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';


function App() {
  const [userInput, setUserInput] = useState('');
  const notifyInput = () =>  toast(`hey u, thanks for your input:) : ${userInput}`);
  const notifyNone = (errorMsg) => toast(`
    hey u, nothing was submitted:)
    Error: ${errorMsg}
  `);

  return (
    <div 
      className="app-container" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Left Half - Question and Input */}
      <div className="left-half">
        <h1 className="title">
          what do you see?
        </h1>

        <button
          className="submit-button"
          onClick={() => {
            axios.post('http://localhost:7777/createuserentry', {"entry": userInput})
              .then(response => {
                console.log(response)
                notifyInput()
                setUserInput("");
              })
              .catch(err => {
                console.log(err)
                notifyNone(err.response.data.message)
              });
          }}
        >
          fancy im done button
        </button>
        <ToastContainer />

        <textarea
          className="input-textarea"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />



      </div>
      
      {/* Deck Section - Right Half */}
      <div className="deck-section">
        <div className="deck-container">
          <Deck />
        </div>
      </div>
    </div>
  );
}

export default App;



// Whispering soft winds
// Petals fall on quiet streams
// Sunset blushes gold