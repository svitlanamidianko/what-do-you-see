import React, { useState } from 'react';
import Deck from './components/Deck/Deck';
import backgroundImage from './assets/japanese gradients/O.png';

function App() {
  const [userInput, setUserInput] = useState('');

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Left Half - Question and Input */}
      <div style={{ 
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        padding: '10vh 5vw',
        fontFamily: '"Cormorant Garamond", serif'
      }}>
        <h1 style={{ 
          fontSize: '64px',
          fontWeight: '300',
          marginBottom: '4vh',
          color: '#333',
          lineHeight: '1.2',
          fontFamily: '"Libre Baskerville", serif'
        }}>
          what do you see?
        </h1>
        
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{
            width: '100%',
            minHeight: '200px',
            background: 'transparent',
            border: 'none',
            fontSize: '28px',
            lineHeight: '1.6',
            fontFamily: '"Libre Baskerville", serif',
            resize: 'none',
            outline: 'none',
            color: '#666',
            padding: '1rem 0'
          }}
        />
      </div>

      {/* Deck Section - Right Half */}
      <div style={{ 
        flex: '1', 
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          position: 'relative',
          width: '600px',
          height: '900px',
          transform: 'scale(0.6)',
          transformOrigin: 'center center'
        }}>
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