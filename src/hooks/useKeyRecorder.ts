import { useRef, useEffect, useCallback, useState } from 'react';
import { debounce } from 'lodash';
import { KeystrokeRecorder } from '../KeystrokeRecorder';

const IGNORED_KEYS = [
  'Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 
  'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
];

export const useKeyRecorder = (inactivityTimeout = 1000) => {
  const recorder = useRef(new KeystrokeRecorder(inactivityTimeout));
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const handleKeyPress = useCallback(
    debounce((event: KeyboardEvent) => {
      // Ignore modifier keys and shortcuts
      if (event.metaKey || event.ctrlKey || event.altKey || 
          IGNORED_KEYS.includes(event.key)) {
        return;
      }

      recorder.current.handleKeystroke(event.key);
      setIsRecording(true);
      setHasRecording(true);
    }, 16),
    []
  );

  useEffect(() => {
    const currentRecorder = recorder.current;

    // Subscribe to recorder state changes
    currentRecorder.onStateChange = (recording: boolean) => {
      setIsRecording(recording);
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      currentRecorder.cleanup();
    };
  }, [handleKeyPress]);

  const replay = async () => {
    setIsRecording(false);
    await recorder.current.replay('#outputElement');
  };

  return {
    isRecording,
    replay,
    hasRecording,
  };
};