interface Keystroke {
  key: string;
  timestamp: number;
}

export class KeystrokeRecorder {
  private recording: Keystroke[] = [];
  private startTime: number | null = null;
  private isRecording = false;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private replayTimeouts: NodeJS.Timeout[] = [];
  public onStateChange: ((recording: boolean) => void) | null = null;

  constructor(private inactivityTimeout = 5000) {}

  handleKeystroke(key: string): void {
    if (!this.isRecording) {
      this.startRecording();
    }
    this.addKeystroke(key);
    this.resetInactivityTimer();
  }

  private startRecording(): void {
    this.recording = [];
    this.startTime = performance.now();
    this.isRecording = true;
    this.onStateChange?.(true);
  }

  private addKeystroke(key: string): void {
    if (!this.startTime) return;
    
    this.recording.push({
      key,
      timestamp: performance.now() - this.startTime
    });
  }

  private resetInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      this.stop();
    }, this.inactivityTimeout);
  }

  stop(): void {
    this.isRecording = false;
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    this.onStateChange?.(false);
  }

  hasRecording(): boolean {
    return this.recording.length > 0;
  }

  replay(elementSelector: string): Promise<void> {
    const element = document.querySelector(elementSelector) as HTMLTextAreaElement;
    if (!element) return Promise.reject(new Error('Element not found'));

    this.stop();
    this.cleanup();
    element.value = '';

    return new Promise((resolve) => {
      this.recording.forEach((keystroke) => {
        const timeout = setTimeout(() => {
          if (keystroke.key === 'Backspace') {
            element.value = element.value.slice(0, -1);
          } else if (keystroke.key.length === 1) {
            element.value += keystroke.key;
          }
        }, keystroke.timestamp);
        
        this.replayTimeouts.push(timeout);
      });

      const lastKeystroke = this.recording[this.recording.length - 1];
      if (lastKeystroke) {
        setTimeout(resolve, lastKeystroke.timestamp);
      } else {
        resolve();
      }
    });
  }

  cleanup(): void {
    this.replayTimeouts.forEach(clearTimeout);
    this.replayTimeouts = [];
  }
}