import React from 'react';

function InputControls({ settings, onSettingsChange }) {
  const fontFamilies = [
    'Papyrus',
    'Cormorant Garamond',
    'Libre Baskerville',
    'Times New Roman',
    'Arial',
    'Helvetica',
    'Georgia',
    'MedievalSharp',
    'Luminari',
    'Copperplate Gothic',
    'Blackletter',
    'UnifrakturMaguntia',
    'Almendra',
    'Uncial Antiqua',
    'Dragon Hunter'
  ];

  return (
    <div className="input-controls">
      <div className="control-group">
        <label>Font Size (px)</label>
        <input
          type="range"
          min="12"
          max="72"
          value={settings.fontSize}
          onChange={(e) => onSettingsChange('fontSize', e.target.value)}
        />
        <span>{settings.fontSize}px</span>
      </div>

      <div className="control-group">
        <label>Font Family</label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onSettingsChange('fontFamily', e.target.value)}
        >
          {fontFamilies.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>Font Color</label>
        <input
          type="color"
          value={settings.color}
          onChange={(e) => onSettingsChange('color', e.target.value)}
        />
      </div>

      <div className="control-group">
        <label>Font Weight</label>
        <input
          type="range"
          min="100"
          max="900"
          step="100"
          value={settings.fontWeight}
          onChange={(e) => onSettingsChange('fontWeight', e.target.value)}
        />
        <span>{settings.fontWeight}</span>
      </div>
    </div>
  );
}

export default InputControls; 