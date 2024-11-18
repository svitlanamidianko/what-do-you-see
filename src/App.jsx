import React, { useState } from 'react';
import Deck from './components/Deck/Deck';

function App() {
  const [userInput, setUserInput] = useState('');

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      {/* Left Half - Question and Input */}
      <div style={{ 
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        padding: '10vh 5vw',
        fontFamily: '"Cormorant Garamond", serif'
      }}>
        <h1 style={{ 
          fontSize: '48px',
          fontWeight: '300',
          marginBottom: '4vh',
          color: '#333',
          lineHeight: '1.2'
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
            borderBottom: '1px solid #ddd',
            fontSize: '24px',
            lineHeight: '1.6',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            color: '#444',
            padding: '1rem 0'
          }}
          placeholder="write your vision..."
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
          width: '300px',
          height: '450px'
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